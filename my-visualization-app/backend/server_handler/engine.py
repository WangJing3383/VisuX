import pandas as pd
import numpy as np
import os

from django.utils.timezone import now
from sklearn.decomposition import PCA
from scipy.interpolate import interp1d
from sklearn.linear_model import LinearRegression
from scipy.optimize import curve_fit, OptimizeWarning
from imblearn.over_sampling import SMOTE,RandomOverSampler
from sklearn.manifold import TSNE
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as LDA
from sklearn.feature_selection import VarianceThreshold
from scipy.interpolate import interp1d, UnivariateSpline
from itertools import combinations
from backend.api.models import UploadedFile, AuditLog
import umap.umap_ as umap
import warnings

class Engine:
    def __init__(self):
        pass

    @staticmethod
    def data_to_panda(dataset_id: int) -> pd.DataFrame:
        """
        Get data based on dataset_id and convert to Pandas DataFrame
        """
        try:
            dataset = UploadedFile.objects.get(id=dataset_id)
            file_path = dataset.file_path.path

            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")

            if dataset.file_type == "csv":
                return pd.read_csv(file_path)
            elif dataset.file_type == "xlsx":
                return pd.read_excel(file_path, engine="openpyxl")
            else:
                raise ValueError(f"Unsupported file type: {dataset.file_type}")

        except UploadedFile.DoesNotExist:
            raise ValueError(f"Dataset with ID {dataset_id} not found.")
        except Exception as e:
            raise ValueError(f"Error loading dataset: {e}")

    @staticmethod
    def apply_pca(data: pd.DataFrame, n_components: int = 2) -> pd.DataFrame:
        """
        Perform PCA downscaling
        """
        try:
            pca = PCA(n_components=n_components)
            transformed_data = pca.fit_transform(data)
            columns = [f'dim{i + 1}' for i in range(n_components)]
            return pd.DataFrame(transformed_data, columns=columns)
        except Exception as e:
            raise ValueError(f"Error in PCA processing: {e}")

    @staticmethod
    def apply_tsne(data: pd.DataFrame, n_components: int = 2) -> pd.DataFrame:
        """
        Perform t-SNE dimensionality reduction
        """
        try:
            tsne = TSNE(n_components=n_components)
            transformed_data = tsne.fit_transform(data)
            columns = [f'dim{i + 1}' for i in range(n_components)]
            return pd.DataFrame(transformed_data, columns=columns)
        except Exception as e:
            raise ValueError(f"Error in t-SNE processing: {e}")

    @staticmethod
    def apply_umap(data: pd.DataFrame, n_components: int = 2) -> pd.DataFrame:
        """
        Perform UMAP dimensionality reduction
        """
        try:
            reducer = umap.UMAP(n_components=n_components)
            transformed_data = reducer.fit_transform(data)
            columns = [f'dim{i + 1}' for i in range(n_components)]
            return pd.DataFrame(transformed_data, columns=columns)
        except Exception as e:
            raise ValueError(f"Error in UMAP processing: {e}")

    @staticmethod
    def dimensional_reduction(data: pd.DataFrame, method: str, n_components: int = 2, filename="unknown.csv") -> pd.DataFrame:
        """
        Performs downscaling according to the specified method
        """
        if not isinstance(data, pd.DataFrame):
            raise ValueError("Input data must be a pandas DataFrame.")

        # Selecting Numeric Data
        numeric_data = data.select_dtypes(include=['number'])
        if numeric_data.empty:
            raise ValueError("Dataset does not contain numeric data suitable for dimensionality reduction.")

        Engine.log_action(method.upper(), filename, n_components, len(numeric_data))

        # Implementation of dimensionality reduction
        if method == "pca":
            return Engine.apply_pca(numeric_data, n_components)
        elif method == "tsne":
            return Engine.apply_tsne(numeric_data, n_components)
        elif method == "umap":
            return Engine.apply_umap(numeric_data, n_components)
        else:
            raise ValueError(f"Unsupported dimensionality reduction method: {method}")

    @staticmethod
    def recommend_dim_reduction(dataset_df):
        try:
            num_features = dataset_df.shape[1]
            recommendations = []
            parameters = {}

            if num_features > 50:
                recommendations.append("pca")
                parameters["pca"] = {"n_components": min(10, num_features // 2)}

            if num_features > 10:
                recommendations.append("tsne")
                parameters["tsne"] = {"n_components": 2, "perplexity": min(30, num_features - 1)}

            if num_features > 5:
                recommendations.append("umap")
                parameters["umap"] = {"n_components": 2, "n_neighbors": min(15, num_features - 1)}

            if not recommendations:
                recommendations.append("pca")
                parameters["pca"] = {"n_components": min(2, num_features)}

            return recommendations, parameters
        except Exception as e:
            return [], {}
    """
    # Do interpolate with given data, given kind of interpolation, the number of generated data and the given range.
    # The default generated kind is linear.
    # The default number of generated data is 100.
    # User is allowed to set the range of the interpolation(extrapolation).
    # If the user doesn't set the range, the default value will be the maximum and minimum in x.
    def interpolate(self, x: np.ndarray, y: np.ndarray, kind: str = 'linear', num_points: int = 100, min_value = None, max_value = None) -> pd.DataFrame:
        try:
            interpolator = interp1d(x, y, kind=kind, ill_value = "extrapolate")
            if min_value is None:
                min_value = np.min(x)
            if max_value is None:
                max_value = np.max(x)
            x_new = np.linspace(min_value, max_value, num_points)
            y_new = interpolator(x_new)
            return pd.DataFrame({'x': x_new, 'y': y_new})
        except Exception as e:
            raise ValueError(f"Error in interpolation: {e}")
    """

    def interpolate(dataset: pd.DataFrame, x_feature: str, y_feature: str, kind: str = 'linear', num_points: int = 100, min_value=None, max_value=None, degree: int = 3) -> pd.DataFrame:
        """
        Perform interpolation (or extrapolation) on a given dataset.

        :param dataset: pandas.DataFrame, the input dataset
        :param x_feature: str, the column name for the independent variable (x-axis)
        :param y_feature: str, the column name for the dependent variable (y-axis)
        :param kind: str, type of interpolation ("linear", "polynomial", "spline")
        :param num_points: int, number of generated data points (default: 100)
        :param min_value: float, minimum x value for interpolation (default: min(dataset[x_feature]))
        :param max_value: float, maximum x value for interpolation (default: max(dataset[x_feature]))
        :param degree: int, degree of the polynomial (only used for "polynomial" and "spline")
        :return: pandas.DataFrame containing interpolated 'x' and 'y' values
        """

        try:
            # Ensure that x_feature and y_feature exist in the DataFrame
            if x_feature not in dataset.columns or y_feature not in dataset.columns:
                raise ValueError(f"Columns '{x_feature}' and/or '{y_feature}' not found in dataset")

            # Extract x and y data
            x = dataset[x_feature].values
            y = dataset[y_feature].values

             # Handle NaN values in y by replacing them with the mean or by removing the rows with NaN values
            if np.any(np.isnan(y)):
                # Option 1: Remove rows where y is NaN
                mask = ~np.isnan(y)
                x = x[mask]
                y = y[mask]

            # Use min and max values from the dataset if not provided
            if min_value is None:
                min_value = np.min(x)
            if max_value is None:
                max_value = np.max(x)

            # Generate new x values for interpolation
            x_new = np.linspace(min_value, max_value, num_points)
            
            # Linear interpolation
            if kind == "linear":
                interpolator = interp1d(x, y, kind="linear", fill_value="extrapolate")
                y_new = interpolator(x_new)
                # Check if NaN values were generated during interpolation
                if np.any(np.isnan(y_new)):
                    print("Warning: NaN values generated during linear interpolation.")
                    y_new = np.nan_to_num(y_new)  # Replace NaNs with 0 or another suitable value

            # Polynomial interpolation
            elif kind == "polynomial":
                poly_coeffs = np.polyfit(x, y, degree)
                poly_func = np.poly1d(poly_coeffs)
                y_new = poly_func(x_new)

            # Spline interpolation
            elif kind == "spline":
                spline = UnivariateSpline(x, y, k=min(degree, len(x) - 1), s=0)
                y_new = spline(x_new)

            # Exponential interpolation
            elif kind == "exponential":
                # Ensure all y values are positive (required for log transformation)
                if np.any(y <= 0):
                    raise ValueError("Exponential interpolation requires all y values to be positive.")

                # Fit a linear model to log(y)
                log_y = np.log(y)
                coeffs = np.polyfit(x, log_y, 1)
                exp_func = lambda x_val: np.exp(coeffs[1]) * np.exp(coeffs[0] * x_val)
                y_new = exp_func(x_new)

            else:
                raise ValueError("Unsupported interpolation method. Choose from 'linear', 'polynomial', or 'spline'.")

            # Return the interpolated DataFrame
            return pd.DataFrame({x_feature: x_new, y_feature: y_new})

        except Exception as e:
            raise ValueError(f"Error in interpolation: {e}")

    def extrapolate(data: pd.DataFrame, x_feature: str, y_feature: str, target_x: list, method="linear", degree=2) -> pd.DataFrame:
        """
        Perform extrapolation using different methods.

        :param data: pandas.DataFrame, input data with features
        :param x_feature: str, name of the column used as x values
        :param y_feature: str, name of the column used as y values
        :param target_x: list, target x values for extrapolation
        :param method: str, extrapolation method ("linear", "polynomial", "exponential", "spline")
        :param degree: int, degree of polynomial fit (default: 2)
        :return: pandas.DataFrame, extrapolated data with columns ['x', 'y']
        """
    
        if not isinstance(data, pd.DataFrame):
            raise TypeError("Input data must be a pandas DataFrame")
        if x_feature not in data.columns or y_feature not in data.columns:
            raise ValueError(f"DataFrame must contain columns '{x_feature}' and '{y_feature}'")

        X = data[x_feature].values.reshape(-1, 1)  # Extract x values
        y = data[y_feature].values  # Extract y values
        target_x = np.array(target_x)  # Convert to numpy array

        if method == "linear":
            model = LinearRegression()
            model.fit(X, y)
            y_pred = model.predict(target_x.reshape(-1, 1))

        elif method == "polynomial":
            coeffs = np.polyfit(X.flatten(), y, degree)
            poly_func = np.poly1d(coeffs)
            y_pred = poly_func(target_x)

        elif method == "exponential":
            # Use log transformation for exponential regression
            if np.any(y <= 0):
                raise ValueError("Exponential extrapolation requires positive y values")
            log_y = np.log(y)
            model = LinearRegression()
            model.fit(X, log_y)
            log_y_pred = model.predict(target_x.reshape(-1, 1))
            y_pred = np.exp(log_y_pred)  # Convert back to exponential form

        elif method == "spline":
            spline_func = interp1d(X.flatten(), y, kind="cubic", fill_value="extrapolate")
            y_pred = spline_func(target_x)

        else:
            raise ValueError("Unsupported extrapolation method. Choose from 'linear', 'polynomial', 'exponential', or 'spline'.")

        # Return extrapolated data as a pandas DataFrame
        return pd.DataFrame({x_feature: target_x, y_feature: y_pred})

    @staticmethod
    def fit_curve(dataset: pd.DataFrame, x_feature: str, y_feature: str, method: str = "linear", degree: int = 2, initial_params: list = None):
        """
        Perform curve fitting on the given dataset.

        :param dataset: pandas.DataFrame, the input dataset
        :param x_feature: str, the column name for the independent variable (x-axis)
        :param y_feature: str, the column name for the dependent variable (y-axis)
        :param method: str, the type of curve fitting ("linear", "polynomial", "exponential")
        :param degree: int, the degree of the polynomial (only used for "polynomial" method)
        :param initial_params: list, initial parameters for curve fitting (only used for "exponential" method)
        :return: tuple (params, covariance, fitted_data)
                 - params: the fitted parameters
                 - covariance: covariance of the fitted parameters (None for polynomial fitting)
                 - fitted_data: pandas.DataFrame with 'x' and 'y' values of the fitted curve
        """
        try:
            # make sure x_feature and y_feature are in DataFrame 
            if x_feature not in dataset.columns or y_feature not in dataset.columns:
                raise ValueError(f"Columns '{x_feature}' and/or '{y_feature}' not found in dataset")

            x = dataset[x_feature].values
            y = dataset[y_feature].values
            x = np.asarray(x, dtype=np.float64)
            y = np.asarray(y, dtype=np.float64)
            try:
                degree = int(degree)
            except ValueError:
                raise ValueError("degree must be a int")

            # generate x
            x_fit = np.linspace(np.min(x), np.max(x), 100)

            if method == "linear":
                def linear_func(x, a, b):
                    return a * x + b

                params, covariance = curve_fit(linear_func, x, y)
                y_fit_curve = linear_func(x_fit, *params)

            elif method == "polynomial":
                try:
                    poly_coeffs = np.polyfit(x, y, degree)
                except Exception as e:
                    print(f"Errors in the fitting process: {e}")
                    return None, None, None
                poly_func = np.poly1d(poly_coeffs)
                y_fit_curve = poly_func(x_fit)
                params, covariance = poly_coeffs, None  # no covariance for polynomial

            elif method == "exponential":
                def exp_func(x, a, b, c):
                    return a * np.exp(b * x) + c
                if x.size == 0 or y.size == 0:
                    raise ValueError("Input x or y is empty!")

                if np.any(np.isnan(x)) or np.any(np.isnan(y)) or np.any(np.isinf(x)) or np.any(np.isinf(y)):
                    raise ValueError("Input data contains NaN or Inf!")

                if np.any(y < 0):
                    print("Warning: Some y values are negative, which may affect exponential fitting.")

                if initial_params is None:
                    initial_params = [max(y), 0.01, min(y)]  # Adjustment of initial values according to data

                with warnings.catch_warnings():
                    warnings.simplefilter("error", OptimizeWarning)
                    try:
                        params, covariance = curve_fit(exp_func, x, y, p0=initial_params, 
                                           bounds=([0, -1, -np.inf], [np.inf, 1, np.inf]), 
                                           maxfev=5000)
                        y_fit_curve = exp_func(x_fit, *params)
                    except (RuntimeError, OptimizeWarning) as e:
                        raise ValueError(f"Curve fitting failed: {e}")


            else:
                raise ValueError("Unsupported method. Choose from 'linear', 'polynomial', or 'exponential'.")

            # create result DataFrame
            fitted_data = pd.DataFrame({"x": x_fit, "y": y_fit_curve})

            return params, covariance, fitted_data

        except Exception as e:
            raise ValueError(f"Error in curve fitting: {e}")

    def oversample_data(dataset: pd.DataFrame, x_feature: str, y_feature: str, method: str = 'smote', oversample_factor: int = 1) -> pd.DataFrame:
        """
        Perform oversampling.

        :param dataset: pandas.DataFrame, input data containing the features to oversample
        :param x_feature: str, the column name for the independent variable (x-axis)
        :param y_feature: str, the column name for the dependent variable (y-axis)
        :param method: str, interpolation method ("linear", "spline", "polynomial")
        :param oversample_factor: int, the value of oversample factor
        :return: pandas.DataFrame, oversampled data
        """
        try:
            # Ensure that x_feature and y_feature exist in the DataFrame
            if x_feature not in dataset.columns or y_feature not in dataset.columns:
                raise ValueError(f"Columns '{x_feature}' and/or '{y_feature}' not found in dataset")
            
            else:
                X = dataset[[x_feature]].values
                y = dataset[y_feature].values
                class_counts = dataset[y_feature].value_counts()
                num_classes = dataset[y_feature].nunique()
                if num_classes == 2:
                    min_class = class_counts.idxmin()  # Get min class
                    max_class = class_counts.idxmax()  # Get max class

                    minority_count = class_counts[min_class]
                    majority_count = class_counts[max_class]

                    target_minority_count = int(majority_count * oversample_factor)
                    sampling_strategy = target_minority_count / majority_count
                else:
                    sampling_strategy = {cls: max(int(count * oversample_factor), count + 1) for cls, count in class_counts.items()}


                #Use SMOTE to oversample.
                if method == 'smote':
                    min_samples = min(class_counts.values)
                    n_neighbors = max(1, min(5, min_samples - 1))
                    oversampler = SMOTE(sampling_strategy=sampling_strategy, random_state=42, k_neighbors=n_neighbors)

                #Use random to oversample.
                elif method == "random":
                    oversampler = RandomOverSampler(sampling_strategy=sampling_strategy, random_state=42)
                
                else:
                    raise ValueError("Invalid oversampling method. Choose from 'SMOTE' or 'Random Oversampling'.")

                X_resampled, y_resampled = oversampler.fit_resample(X, y)

                # Build DataFrame
                oversampled_data = pd.DataFrame(X_resampled, columns=[x_feature])
                oversampled_data[y_feature] = y_resampled 

                print("The classed after oversample:", oversampled_data[y_feature].value_counts())

                return oversampled_data

        except Exception as e:
            raise ValueError(f"Error in oversampling data: {e}")

    def suggest_feature_dropping(dataset: pd.DataFrame, correlation_threshold=0.95, variance_threshold=0.01):
        """
        Identify features to be dropped based on:
        1. Low variance (below `variance_threshold`).
        2. High correlation (above `correlation_threshold`).

        :param dataset: pandas.DataFrame, input dataset
        :param correlation_threshold: float, threshold for high correlation (default: 0.95)
        :param variance_threshold: float, threshold for low variance (default: 0.01)
        :return: List[str], list of features to drop.
        """

        if not isinstance(dataset, pd.DataFrame):
            raise TypeError("Input dataset must be a pandas DataFrame")

        features_to_drop = set()

        # 1. low variance
        selector = VarianceThreshold(threshold=variance_threshold)
        selector.fit(dataset)
        low_variance_features = dataset.columns[~selector.get_support()].tolist()
        features_to_drop.update(low_variance_features)

        # 2. high correlation
        corr_matrix = dataset.corr().abs() 
        upper_triangle = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool)) 

        highly_correlated_features = [
            column for column in upper_triangle.columns if any(upper_triangle[column] > correlation_threshold)
        ]
        features_to_drop.update(highly_correlated_features)

        return list(features_to_drop)
        

    def suggest_feature_combining(dataset: pd.DataFrame, correlation_threshold=0.9):
        """
        Suggest feature combinations based on high correlation (correlation > `correlation_threshold`).

        :param dataset: pandas.DataFrame, input dataset
        :param correlation_threshold: float, threshold for high correlation (default: 0.9)
        :return: List[dict], suggested feature pairs for combining.
        """
        if not isinstance(dataset, pd.DataFrame):
            raise TypeError("Input dataset must be a pandas DataFrame")

        suggested_combinations = []

        # correlation matrix
        corr_matrix = dataset.corr().abs()
    
        # all feature pairs
        feature_pairs = combinations(dataset.columns, 2)

        # chose high correlation pairs
        for feature1, feature2 in feature_pairs:
            correlation = corr_matrix.loc[feature1, feature2]
            if correlation > correlation_threshold:
                suggested_combinations.append({
                    "features": [feature1, feature2],
                    "correlation": correlation 
                })
        return suggested_combinations

    def compute_correlation(data: pd.DataFrame, feature_1: str, feature_2: str, method="pearson") -> float:
        """
        Compute the correlation between two specified features in a pandas DataFrame.

        :param data: pandas.DataFrame, the input data containing numeric features
        :param feature_1: str, the name of the first feature (column) to compare
        :param feature_2: str, the name of the second feature (column) to compare
        :param method: str, the correlation method to use ("pearson", "spearman", "kendall")
        :return: float, correlation coefficient between the two features
        """
        if not isinstance(data, pd.DataFrame):
            raise TypeError("Input data must be a pandas DataFrame")

        if feature_1 not in data.columns or feature_2 not in data.columns:
            raise ValueError(f"Features '{feature_1}' and/or '{feature_2}' not found in the dataset")

        if method == "pearson":
            correlation = data[feature_1].corr(data[feature_2], method="pearson")
        elif method == "spearman":
            correlation = data[feature_1].corr(data[feature_2], method="spearman")
        elif method == "kendall":
            correlation = data[feature_1].corr(data[feature_2], method="kendall")
        else:
            raise ValueError("Invalid correlation method. Choose from 'pearson', 'spearman', or 'kendall'.")

        return correlation
    
    @staticmethod
    def log_action(tool_type: str, filename: str, n_components: int, rows: int):
        AuditLog.objects.create(
            tool_type=tool_type,
            timestamp=now(),
            params={ 
                "filename": filename,
                "n_components": n_components,
                "rows": rows
            },
            is_reverted=False
        )
