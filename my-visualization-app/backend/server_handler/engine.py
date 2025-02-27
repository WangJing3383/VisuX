import pandas as pd
import numpy as np
import os

from sklearn.decomposition import PCA
from sklearn.linear_model import LinearRegression
from scipy.optimize import curve_fit, OptimizeWarning
from imblearn.over_sampling import SMOTE,RandomOverSampler
from sklearn.manifold import TSNE
from sklearn.feature_selection import VarianceThreshold
from scipy.interpolate import interp1d, UnivariateSpline
from itertools import combinations
from backend.api.models import UploadedFile
import umap.umap_ as umap
import warnings

DEFAULT_DIMREDUCTION_FACTOR = 2
DEFAULT_POINT_NUMBER = 100
PCA_RECOMMEND_NUMBER = 50
TSNE_RECOMMEND_NUMBER = 10
UMAP_RECOMMEND_NUMBER = 5
PCA_MAX_COMPONENTS = 10
TSNE_MAX_COMPONENTS = 30
UMAP_MAX_COMPONENTS = 15
COMPONENTS_DIVISOR = 2
MIN_COMPONENTS = 2
COLUMN_INDEX = 1
DEFAULT_INTERPOLATION_DEGREE = 3
DEFAULT_EXTRAPOLATION_DEGREE = 2
DEFAULT_OVERSAMPLE_FACTOR = 2
RANDOM_STATE = 42
EXACT_INTERPOLATION_FACTOR = 0
LIMIT = 1
LARGEST_NOT_POSITIVE_NUMBER = 0
DEGREE_OF_POLYNOMIAL = 1
SLOPE_INDEX = 0
INTERCEPT_INDEX = 1
SINGLE_COLUMN = 1
AUTO = -1
FEATURE_DROPPING_CORRELATION_THRESHOLD = 0.95
FEATURE_DROPPING_VARIANCE_THRESHOLD = 0.01
FEATURE_COMBING_CORRELATION_THRESHOLD = 0.9

DEFAULT_FILE_NAME = "unknown.csv"
DEFAULT_ENGINE = "openpyxl"
ALL_NUMERIC_TYPES = "number"

OVERSAMPLE_PROCESS = "oversample"
INTERPOLATE_PROCESS = "interpolation"
EXTRAPOLATION_PROCESS = "extrapolate"
FIT_CURVE_PROCESS = "curve fitting"

CSV_TYPE = "csv"
XLSX_TYPE = "xlsx"

PCA_METHOD = "pca"
TSNE_METHOD = "tsne"
UMAP_METHOD = "umap"
TSNE_PERPLEXITY = "perplexity"
UMAP_N_NEIGHBOR = "n_neighbors"

PEARSON_METHOD = "pearson"
SPEARMAN_METHOD = "spearman"
KENDALL_METHOD = "kendall"
CUBIC_METHOD = "cubic"

SMOTE_METHOD = "smote"
RANDOM_METHOD = "random"

N_COMPONENTS = "n_components"

SPLINE_METHOD = "spline"
LINEAR_METHOD = "linear"
POLYNOMIAL_METHOD = "polynomial"
EXPONENTIAL_METHOD = "exponential"

INVALID_INPUT_INFORMATION = "Input data must be a pandas DataFrame."
INVALID_DEGREE = "Degree must be an integer."
ERROR_NUMERIC_DATA = "Dataset does not contain numeric data suitable for dimensionality reduction."
INVALID_CORRELATION_METHOD_INFORMATION = "Invalid correlation method. Choose from 'pearson', 'spearman', or 'kendall'."
INVALID_VALUE_IN_PROCESS = "Warning: NaN values generated during linear interpolation."
ERROR_POSITIVE_VALUE = "All y values should be positive."
UNSUPPORTED_INTERPOLATION_METHOD = "Unsupported interpolation method. Choose from 'linear', 'polynomial', or 'spline'."
UNSUPPORTED_EXTRAPOLATION_METHOD = "Unsupported extrapolation method. Choose from 'linear', 'polynomial', 'exponential', or 'spline'."
INVALID_OVERSAMPLE_METHOD = "Invalid oversampling method. Choose from 'SMOTE' or 'Random Oversampling'."

ERROR_INFORMATION = "Error in {} processing: {}"
FILE_NOT_FOUND_INFORMATION = "File not found: {}"
INVALID_FILE_TYPE = "Unsupported file type: {}"
ERROR_LOADING_MESSAGE = "Error loading dataset: {}"
DATASET_NOT_FOUND_MESSAGE = "Dataset with ID {} not found."
UNSUPPORTED_DIM_REDUCTION_METHOD = "Unsupported dimensionality reduction method: {}"
INVALID_FEATURES = "Columns '{}' and/or '{}' not found in dataset"
COLUMN_NAME = "dim{}"



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
                raise FileNotFoundError(FILE_NOT_FOUND_INFORMATION.format(file_path))

            if dataset.file_type == CSV_TYPE:
                return pd.read_csv(file_path)
            elif dataset.file_type == XLSX_TYPE:
                return pd.read_excel(file_path, engine=DEFAULT_ENGINE)
            else:
                raise ValueError(INVALID_FILE_TYPE.format(dataset.file_type))

        except UploadedFile.DoesNotExist:
            raise ValueError(DATASET_NOT_FOUND_MESSAGE.format(dataset_id))
        except Exception as e:
            raise ValueError(ERROR_LOADING_MESSAGE.format(e))

    @staticmethod
    def apply_pca(data: pd.DataFrame, n_components: int = DEFAULT_DIMREDUCTION_FACTOR) -> pd.DataFrame:
        """
        Perform PCA downscaling
        """
        try:
            pca = PCA(n_components=n_components)
            transformed_data = pca.fit_transform(data)
            columns = [COLUMN_NAME.format(i+COLUMN_INDEX) for i in range(n_components)]
            return pd.DataFrame(transformed_data, columns=columns)
        except Exception as e:
            raise ValueError(ERROR_INFORMATION.format(PCA_METHOD,e))

    @staticmethod
    def apply_tsne(data: pd.DataFrame, n_components: int = DEFAULT_DIMREDUCTION_FACTOR) -> pd.DataFrame:
        """
        Perform t-SNE dimensionality reduction
        """
        try:
            tsne = TSNE(n_components=n_components)
            transformed_data = tsne.fit_transform(data)
            columns = [COLUMN_NAME.format(i+COLUMN_INDEX) for i in range(n_components)]
            return pd.DataFrame(transformed_data, columns=columns)
        except Exception as e:
            raise ValueError(ERROR_INFORMATION.format(TSNE_METHOD,e))

    @staticmethod
    def apply_umap(data: pd.DataFrame, n_components: int = DEFAULT_DIMREDUCTION_FACTOR) -> pd.DataFrame:
        """
        Perform UMAP dimensionality reduction
        """
        try:
            reducer = umap.UMAP(n_components=n_components)
            transformed_data = reducer.fit_transform(data)
            columns = [COLUMN_NAME.format(i+COLUMN_INDEX) for i in range(n_components)]
            return pd.DataFrame(transformed_data, columns=columns)
        except Exception as e:
            raise ValueError(ERROR_INFORMATION.format(UMAP_METHOD,e))

    @staticmethod
    def dimensional_reduction(data: pd.DataFrame, method: str, n_components: int = DEFAULT_DIMREDUCTION_FACTOR, filename=DEFAULT_FILE_NAME) -> pd.DataFrame:
        """
        Performs downscaling according to the specified method
        """
        if not isinstance(data, pd.DataFrame):
            raise ValueError(INVALID_INPUT_INFORMATION)

        # Selecting Numeric Data
        numeric_data = data.select_dtypes(include=[ALL_NUMERIC_TYPES])
        if numeric_data.empty:
            raise ValueError(ERROR_NUMERIC_DATA)
        
        # Implementation of dimensionality reduction
        if method == PCA_METHOD:
            return Engine.apply_pca(numeric_data, n_components)
        elif method == TSNE_METHOD:
            return Engine.apply_tsne(numeric_data, n_components)
        elif method == UMAP_METHOD:
            return Engine.apply_umap(numeric_data, n_components)
        else:
            raise ValueError(UNSUPPORTED_DIM_REDUCTION_METHOD.format(method))

    @staticmethod
    def recommend_dim_reduction(dataset_df):
        try:
            num_features = dataset_df.shape[COLUMN_INDEX]
            recommendations = []
            parameters = {}

            if num_features > PCA_RECOMMEND_NUMBER:
                recommendations.append(PCA_METHOD)
                parameters[PCA_METHOD] = {N_COMPONENTS: min(PCA_MAX_COMPONENTS, num_features // COMPONENTS_DIVISOR)}

            if num_features > TSNE_RECOMMEND_NUMBER:
                recommendations.append(TSNE_METHOD)
                parameters[TSNE_METHOD] = {N_COMPONENTS: DEFAULT_DIMREDUCTION_FACTOR, TSNE_PERPLEXITY: min(TSNE_MAX_COMPONENTS, num_features - 1)}

            if num_features > UMAP_RECOMMEND_NUMBER:
                recommendations.append(UMAP_METHOD)
                parameters[UMAP_METHOD] = {N_COMPONENTS: DEFAULT_DIMREDUCTION_FACTOR, UMAP_N_NEIGHBOR: min(UMAP_MAX_COMPONENTS, num_features - 1)}

            if not recommendations:
                recommendations.append(PCA_METHOD)
                parameters[PCA_METHOD] = {N_COMPONENTS: min(MIN_COMPONENTS, num_features)}

            return recommendations, parameters
        except Exception as e:
            return [], {}

    def interpolate(dataset: pd.DataFrame, x_feature: str, y_feature: str, kind: str = LINEAR_METHOD, num_points: int = DEFAULT_POINT_NUMBER, min_value=None, max_value=None, degree: int = DEFAULT_INTERPOLATION_DEGREE) -> pd.DataFrame:
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
                raise ValueError(INVALID_FEATURES.format(x_feature,y_feature))

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
            if kind == LINEAR_METHOD:
                interpolator = interp1d(x, y, kind=LINEAR_METHOD, fill_value=EXTRAPOLATION_PROCESS)
                y_new = interpolator(x_new)
                # Check if NaN values were generated during interpolation
                if np.any(np.isnan(y_new)):
                    print(INVALID_VALUE_IN_PROCESS)
                    y_new = np.nan_to_num(y_new)  # Replace NaNs with 0 or another suitable value

            # Polynomial interpolation
            elif kind == POLYNOMIAL_METHOD:
                poly_coeffs = np.polyfit(x, y, degree)
                poly_func = np.poly1d(poly_coeffs)
                y_new = poly_func(x_new)

            # Spline interpolation
            elif kind == SPLINE_METHOD:
                spline = UnivariateSpline(x, y, k=min(degree, len(x) - LIMIT), s=EXACT_INTERPOLATION_FACTOR)
                y_new = spline(x_new)

            # Exponential interpolation
            elif kind == EXPONENTIAL_METHOD:
                # Ensure all y values are positive (required for log transformation)
                if np.any(y <= LARGEST_NOT_POSITIVE_NUMBER):
                    raise ValueError(ERROR_POSITIVE_VALUE)

                # Fit a linear model to log(y)
                log_y = np.log(y)
                coeffs = np.polyfit(x, log_y, DEGREE_OF_POLYNOMIAL)
                exp_func = lambda x_val: np.exp(coeffs[INTERCEPT_INDEX]) * np.exp(coeffs[SLOPE_INDEX] * x_val)
                y_new = exp_func(x_new)

            else:
                raise ValueError(UNSUPPORTED_INTERPOLATION_METHOD)

            # Return the interpolated DataFrame
            return pd.DataFrame({x_feature: x_new, y_feature: y_new})

        except Exception as e:
            raise ValueError(ERROR_INFORMATION.format(INTERPOLATE_PROCESS, e))

    def extrapolate(data: pd.DataFrame, x_feature: str, y_feature: str, target_x: list, method=LINEAR_METHOD, degree=DEFAULT_EXTRAPOLATION_DEGREE) -> pd.DataFrame:
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
            raise TypeError(INVALID_INPUT_INFORMATION)
        if x_feature not in data.columns or y_feature not in data.columns:
            raise ValueError(INVALID_FEATURES.format(x_feature,y_feature))

        X = data[x_feature].values.reshape(AUTO, SINGLE_COLUMN)  # Extract x values
        y = data[y_feature].values  # Extract y values
        target_x = np.array(target_x)  # Convert to numpy array

        if method == LINEAR_METHOD:
            model = LinearRegression()
            model.fit(X, y)
            y_pred = model.predict(target_x.reshape(AUTO, SINGLE_COLUMN))

        elif method == POLYNOMIAL_METHOD:
            coeffs = np.polyfit(X.flatten(), y, degree)
            poly_func = np.poly1d(coeffs)
            y_pred = poly_func(target_x)

        elif method == EXPONENTIAL_METHOD:
            # Use log transformation for exponential regression
            if np.any(y <= LARGEST_NOT_POSITIVE_NUMBER):
                raise ValueError(ERROR_POSITIVE_VALUE)
            log_y = np.log(y)
            model = LinearRegression()
            model.fit(X, log_y)
            log_y_pred = model.predict(target_x.reshape(-1, 1))
            y_pred = np.exp(log_y_pred)  # Convert back to exponential form

        elif method == SPLINE_METHOD:
            spline_func = interp1d(X.flatten(), y, kind=CUBIC_METHOD, fill_value=EXTRAPOLATION_PROCESS)
            y_pred = spline_func(target_x)

        else:
            raise ValueError(UNSUPPORTED_EXTRAPOLATION_METHOD)

        # Return extrapolated data as a pandas DataFrame
        return pd.DataFrame({x_feature: target_x, y_feature: y_pred})

    @staticmethod
    def fit_curve(dataset: pd.DataFrame, x_feature: str, y_feature: str, method: str = LINEAR_METHOD, degree: int = 2, initial_params: list = None):
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
                raise ValueError(INVALID_DEGREE)

            # generate x
            x_fit = np.linspace(np.min(x), np.max(x), DEFAULT_POINT_NUMBER)

            if method == LINEAR_METHOD:
                def linear_func(x, a, b):
                    return a * x + b

                params, covariance = curve_fit(linear_func, x, y)
                y_fit_curve = linear_func(x_fit, *params)

            elif method == POLYNOMIAL_METHOD:
                try:
                    poly_coeffs = np.polyfit(x, y, degree)
                except Exception as e:
                    print(ERROR_INFORMATION.format(FIT_CURVE_PROCESS,e))
                    return None, None, None
                poly_func = np.poly1d(poly_coeffs)
                y_fit_curve = poly_func(x_fit)
                params, covariance = poly_coeffs, None  # no covariance for polynomial

            elif method == EXPONENTIAL_METHOD:
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
            raise ValueError(ERROR_INFORMATION.format(FIT_CURVE_PROCESS,e))

    def oversample_data(dataset: pd.DataFrame, x_feature: str, y_feature: str, method: str = SMOTE_METHOD, oversample_factor: int = DEFAULT_OVERSAMPLE_FACTOR) -> pd.DataFrame:
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
                raise ValueError(INVALID_FEATURES.format(x_feature,y_feature))
            
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
                if method == SMOTE_METHOD:
                    min_samples = min(class_counts.values)
                    n_neighbors = max(1, min(5, min_samples - 1))
                    oversampler = SMOTE(sampling_strategy=sampling_strategy, random_state=RANDOM_STATE, k_neighbors=n_neighbors)

                #Use random to oversample.
                elif method == RANDOM_METHOD:
                    oversampler = RandomOverSampler(sampling_strategy=sampling_strategy, random_state=RANDOM_STATE)
                
                else:
                    raise ValueError(INVALID_OVERSAMPLE_METHOD)

                X_resampled, y_resampled = oversampler.fit_resample(X, y)

                # Build DataFrame
                oversampled_data = pd.DataFrame(X_resampled, columns=[x_feature])
                oversampled_data[y_feature] = y_resampled 

                return oversampled_data

        except Exception as e:
            raise ValueError(ERROR_INFORMATION.format(OVERSAMPLE_PROCESS,e))

    def suggest_feature_dropping(dataset: pd.DataFrame, correlation_threshold=FEATURE_DROPPING_CORRELATION_THRESHOLD, variance_threshold=FEATURE_DROPPING_VARIANCE_THRESHOLD):
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
            raise TypeError(INVALID_INPUT_INFORMATION)

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
        

    def suggest_feature_combining(dataset: pd.DataFrame, correlation_threshold=FEATURE_COMBING_CORRELATION_THRESHOLD):
        """
        Suggest feature combinations based on high correlation (correlation > `correlation_threshold`).

        :param dataset: pandas.DataFrame, input dataset
        :param correlation_threshold: float, threshold for high correlation (default: 0.9)
        :return: List[dict], suggested feature pairs for combining.
        """
        if not isinstance(dataset, pd.DataFrame):
            raise TypeError(INVALID_INPUT_INFORMATION)

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

    def compute_correlation(data: pd.DataFrame, feature_1: str, feature_2: str, method=PEARSON_METHOD) -> float:
        """
        Compute the correlation between two specified features in a pandas DataFrame.

        :param data: pandas.DataFrame, the input data containing numeric features
        :param feature_1: str, the name of the first feature (column) to compare
        :param feature_2: str, the name of the second feature (column) to compare
        :param method: str, the correlation method to use ("pearson", "spearman", "kendall")
        :return: float, correlation coefficient between the two features
        """
        if not isinstance(data, pd.DataFrame):
            raise TypeError(INVALID_INPUT_INFORMATION)

        if feature_1 not in data.columns or feature_2 not in data.columns:
            raise ValueError(INVALID_FEATURES.format(feature_1,feature_2))

        if method == PEARSON_METHOD:
            correlation = data[feature_1].corr(data[feature_2], method=PEARSON_METHOD)
        elif method == SPEARMAN_METHOD:
            correlation = data[feature_1].corr(data[feature_2], method=SPEARMAN_METHOD)
        elif method == KENDALL_METHOD:
            correlation = data[feature_1].corr(data[feature_2], method=KENDALL_METHOD)
        else:
            raise ValueError(INVALID_CORRELATION_METHOD_INFORMATION)

        return correlation
    
