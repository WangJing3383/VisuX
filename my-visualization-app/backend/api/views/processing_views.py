from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from backend.server_handler.engine import Engine
from django.http import JsonResponse
from backend.api.models import UploadedFile, Dataset
from rest_framework.views import APIView
import json
import pandas as pd
import numpy as np

# @method_decorator(csrf_exempt, name='dispatch')
class FitCurveView(APIView):
    def post(self, request):
        try:
            body = json.loads(request.body)
            #dataset_id = body.get("dataset_id")
            params = body.get("params", {})
            x_feature = params.get("xColumn")
            y_feature = params.get("yColumn")
            method = params.get("type", "linear")
            degree = params.get("degree", 2)
            initial_params = params.get("initial_params", None)
            dataset_id = params.get("datasetId")
            print(dataset_id)
            # Ensure dataset_id is provided
            if not dataset_id:
                return JsonResponse({"error": "Dataset ID is required"}, status=400)
            # Get the dataset object
            #dataset = get_object_or_404(Dataset, id=dataset_id)
            #if not dataset_id:
                #dataset = Dataset.objects.order_by("-id").first()
            #else:
            dataset = get_object_or_404(Dataset, id=dataset_id)
            # Convert dataset to Pandas DataFrame
            dataset_df = dataset.get_dataframe()
            # Ensure required features exist in the dataset
            if x_feature not in dataset_df.columns or y_feature not in dataset_df.columns:
                return JsonResponse({"error": "Specified features not found in dataset"}, status=400)
            # Perform curve fitting using Engine
            params, covariance, fitted_data = Engine.fit_curve(
                dataset_df,
                x_feature,
                y_feature,
                method=method,
                degree=degree,
                initial_params=initial_params
            )
            # Create original data array with x_feature and y_feature values
            original_data = dataset_df[[x_feature, y_feature]].rename(columns={x_feature: 'x', y_feature: 'y'}).to_dict(
                orient='records')
            return JsonResponse({
                "params": params.tolist(),
                "covariance": covariance.tolist() if covariance is not None else None,
                "generated_data": fitted_data.to_dict(orient='records'),
                "original_data": original_data
            })
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)


# @method_decorator(csrf_exempt, name='dispatch')
class InterpolateView(APIView):
    def post(self, request):
        try:
            # Parse the request body
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")  # Get the ID of the uploaded file
            x_feature = body.get("x_feature")  # The column name for the x-axis
            y_feature = body.get("y_feature")  # The column name for the y-axis
            kind = body.get("kind", "linear")  # The type of interpolation (linear, polynomial, spline, exponential)
            num_points = body.get("numPoints") or 100  # Default to 100 if null
            min_value = body.get("minValue", None)  # Minimum x value for interpolation (optional)
            max_value = body.get("maxValue", None)  # Maximum x value for interpolation (optional)
            new_dataset_name = body.get("new_dataset_name", "Interpolated Dataset")

            # Ensure dataset_id is provided
            if not dataset_id:
                return JsonResponse({"error": "Dataset ID is required"}, status=400)

            # Get the dataset object
            dataset = get_object_or_404(Dataset, id=dataset_id)

            # Convert dataset to Pandas DataFrame
            dataset_df = dataset.get_dataframe()
            # Perform interpolation
            interpolated_data = Engine.interpolate(
                dataset_df,
                x_feature=x_feature,
                y_feature=y_feature,
                kind=kind,
                num_points=num_points,
                min_value=min_value,
                max_value=max_value
            )
            """
            # Generate new features and records
            reduced_features = [x_feature, y_feature]
            reduced_records = interpolated_data.to_dict(orient="records")

            # Create a new Dataset and associate it with last_dataset
            new_dataset = Dataset.objects.create(
                name=new_dataset_name,
                features=reduced_features,
                records=reduced_records,
                last_dataset=dataset  # Linked original dataset
            )
            """
            # Return the interpolated data in JSON format
            return JsonResponse({"interpolated_data": interpolated_data.to_dict(orient='records')
            #, "new_dataset_id": new_dataset.id
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)


# @method_decorator(csrf_exempt, name='dispatch')
class ExtrapolateView(APIView):
    def post(self, request):
        try:
            # Parse the JSON data sent from the frontend
            request_data = json.loads(request.body)
            # Extract fields from the request data
            dataset_id = request_data.get('dataset_id')
            x_feature = request_data.get('x_feature')
            y_feature = request_data.get('y_feature')
            method = request_data.get('kind')
            extrapolate_range = request_data.get('params', {}).get('extrapolateRange', [])
            new_dataset_name = request_data.get("new_dataset_name", "Extrapolated Dataset")

            # Ensure that the request data is valid
            if not dataset_id or not x_feature or not y_feature or not method or not extrapolate_range:
                return JsonResponse({"error": "Missing required parameters"}, status=400)

            # Retrieve the dataset
            dataset = Dataset.objects.get(id=dataset_id)
            # Convert dataset to Pandas DataFrame
            dataset_df = dataset.get_dataframe()
            print(1)

            # Call the extrapolate function to perform extrapolation
            extrapolated_data = Engine.extrapolate(
                data=dataset_df,
                x_feature=x_feature,
                y_feature=y_feature,
                target_x=extrapolate_range,
                method=method
            )

            # Convert the DataFrame to a dictionary and return it to the frontend
            result = extrapolated_data.to_dict(orient='records')

            return JsonResponse({"original_data": dataset_df.to_dict(orient='records'),
                "extrapolated_data": result,
                #"new_dataset_id": new_dataset.id
            })

        except Exception as e:
            # Catch exceptions and return an error message
            return JsonResponse({"error": str(e)}, status=500)


# @method_decorator(csrf_exempt, name='dispatch')
class CorrelationView(APIView):
    def post(self, request):
        try:
            # Parsing Request JSON
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")
            selected_features = body.get("features", [])
            method = body.get("method", "pearson")

            # Ensure that `dataset_id` exists
            if not dataset_id:
                return JsonResponse({"error": "Dataset ID is required"}, status=400)

            # Getting the dataset object
            dataset = get_object_or_404(Dataset, id=dataset_id)  # 用 `id` 代替 `dataset_id`

            # Converting a dataset to a Pandas DataFrame
            df = dataset.get_dataframe()

            # Ensure that the selected columns are in the DataFrame
            if not all(feature in df.columns for feature in selected_features):
                return JsonResponse({"error": "One or more selected features are missing from the dataset"}, status=400)

            # Calculate the correlation matrix
            correlation_matrix = df[selected_features].corr(method=method)

            # Convert correlation matrix to JSON format
            result = {
                "columns": correlation_matrix.columns.tolist(),  # Column names for X/Y axis
                "values": correlation_matrix.values.tolist(),  # Value of the correlation matrix
            }

            return JsonResponse({"correlation_matrix": result})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


# @method_decorator(csrf_exempt, name="dispatch")
class DimensionalReductionView(APIView):
    def post(self, request):
        try:
            # Parsing the request body
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")
            method = body.get("method", "pca").lower()
            n_components = body.get("n_components", 2)
            new_dataset_name = body.get("new_dataset_name", "Reduced Dataset")

            # Ensure dataset_id exists
            if not dataset_id:
                return JsonResponse({"error": "Missing dataset_id."}, status=400)

            try:
                dataset = Dataset.objects.get(id=int(dataset_id))
            except (Dataset.DoesNotExist, ValueError):
                return JsonResponse({"error": f"Dataset with ID {dataset_id} not found or invalid."}, status=404)

            # Get DataFrame
            if not dataset.features or not dataset.records:
                return JsonResponse({"error": "Dataset is empty or invalid."}, status=400)

            dataset_df = pd.DataFrame(dataset.records, columns=dataset.features)

            # do dim reduction
            reduced_data = Engine.dimensional_reduction(
                dataset_df,
                method=method,
                n_components=n_components
            )
            
            # Generate new features and records
            reduced_features = [f"dim{i+1}" for i in range(n_components)]
            reduced_records = reduced_data.to_dict(orient="records")
            
            return JsonResponse({
                "message": "Dimensionality reduction successful.",
                #"new_dataset_id": new_dataset.id,
                "reduced_features": reduced_features,
                "reduced_records": reduced_records
            }, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


# @method_decorator(csrf_exempt, name='dispatch')
class RecommendDimReductionView(APIView):
    def get(self, request):
        try:
            dataset_id = request.GET.get("dataset_id")
            if not dataset_id:
                return JsonResponse({"error": "Dataset ID is required"}, status=400)

            dataset = get_object_or_404(Dataset, id=dataset_id)
            dataset_df = dataset.get_dataframe()

            recommendations, parameters = Engine.recommend_dim_reduction(dataset_df)

            return JsonResponse({
                "recommendations": recommendations,
                "parameters": parameters
            })
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

# @method_decorator(csrf_exempt, name='dispatch')
class OversampleDataView(APIView):
    def post(self, request):
        try:
            # Parse the incoming JSON body
            body = json.loads(request.body)

            # Extract the relevant fields from the request
            dataset_id = body.get("datasetId")  # Dataset ID to locate the file in the database
            params = body.get("params", {})
            x_feature = params.get("xColumn")  # get x column from params
            y_feature = params.get("yColumn")  # get y column from params
            method = params.get("method", "smote")  # Oversample method (default: smote)
            oversample_factor = params.get("num_samples", 1)  # Oversampling factor (default: 1)

            # Ensure dataset_id is provided
            if not dataset_id:
                return JsonResponse({"error": "Dataset ID is required"}, status=400)

            # Get the dataset object
            dataset = get_object_or_404(Dataset, id=dataset_id)

            # Convert dataset to Pandas DataFrame
            dataset_df = dataset.get_dataframe()

            # Perform oversampling (data interpolation)
            oversampled_data = Engine.oversample_data(
                dataset_df,
                x_feature=x_feature,
                y_feature=y_feature,
                method=method,
                oversample_factor=oversample_factor
            )

            # Convert the oversampled data to a dictionary for easy JSON response
            oversampled_features = list(oversampled_data.columns)
            oversampled_records = oversampled_data.to_dict(orient="records")

            # Return the oversampled data as a JSON response
            return JsonResponse({
                "message": "Oversampling successful.",
                "oversampled_features": oversampled_features,
                "oversampled_records": oversampled_records
            }, status=200)
        except Exception as e:
            # If any error occurs, return an error response with the exception message
            return JsonResponse({"error": str(e)}, status=400)


class ApplyPcaView(APIView):
    def post(self, request):
        try:
            body = json.loads(request.body)
            dataset = body.get("dataset", [])
            n_components = body.get("n_components", 2)

            if not dataset:
                return JsonResponse({"error": "dataset empty"}, status=400)

            dataset_df = pd.DataFrame(dataset)
            transformed_df = Engine.apply_pca(dataset_df, n_components=n_components)

            return JsonResponse({
                "pca_result": transformed_df.to_dict(orient="records")
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)


class SuggestFeatureDroppingView(APIView):
    def post(self, request):
        try:
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")
            correlation_threshold = float(body.get("correlation_threshold", 0.95))
            variance_threshold = float(body.get("variance_threshold", 0.01))

            if not dataset_id:
                return JsonResponse({"error": "Missing dataset_id"}, status=400)

            uploaded_file = UploadedFile.objects.get(id=dataset_id)
            df = Engine.data_to_panda(uploaded_file)

            features_to_drop = Engine.suggest_feature_dropping(
                df,
                correlation_threshold=correlation_threshold,
                variance_threshold=variance_threshold
            )

            return JsonResponse({"features_to_drop": features_to_drop})

        except UploadedFile.DoesNotExist:
            return JsonResponse({"error": "Dataset not found"}, status=404)
        except ValueError as ve:
            return JsonResponse({"error": f"Invalid parameter: {str(ve)}"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


class SuggestFeatureCombiningView(APIView):
    def post(self, request):
        try:
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")
            correlation_threshold = body.get("correlation_threshold", 0.9)

            if not dataset_id:
                return JsonResponse({"error": "Missing dataset_id"}, status=400)

            # get file
            try:
                data_file = UploadedFile.objects.get(id=dataset_id)
            except UploadedFile.DoesNotExist:
                return JsonResponse({"error": "Dataset not found"}, status=404)

            # read file
            dataset_df = Engine.data_to_panda(data_file)

            feature_combinations = Engine.suggest_feature_combining(
                dataset_df,
                correlation_threshold=correlation_threshold
            )

            return JsonResponse({"feature_combinations": feature_combinations})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
