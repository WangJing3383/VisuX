from rest_framework import status
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404

from backend.api.serializers import DatasetSerializer
from django.http import JsonResponse
from backend.api.models import Dataset
from rest_framework.views import APIView
import json

# @method_decorator(csrf_exempt, name='dispatch')
class DatasetDetailView(APIView):
    """
    Get full dataset (data + column names)
    """

    def get(self, request, dataset_id):
        try:
            dataset = Dataset.objects.get(id=dataset_id)
            serializer = DatasetSerializer(dataset)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Dataset.DoesNotExist:
            return Response({"error": "Dataset not found"}, status=status.HTTP_404_NOT_FOUND)
        

# @method_decorator(csrf_exempt, name='dispatch')
class DatasetColumnsView(APIView):
    """
    Get only the column names of the dataset
    """

    def get(self, request, dataset_id):
        try:
            dataset = Dataset.objects.get(id=dataset_id)
            return Response({"columns": dataset.features}, status=status.HTTP_200_OK)
        except Dataset.DoesNotExist:
            return Response({"error": "Dataset not found"}, status=status.HTTP_404_NOT_FOUND)
        

# @method_decorator(csrf_exempt, name='dispatch')
class ChangeDataView(APIView):
    def post(self, request, dataset_id):
        """
        Create a copy of the Dataset, modify it, and return the updated version.
        """
        dataset = get_object_or_404(Dataset, id=dataset_id)

        # Create a copy of the dataset
        new_dataset = dataset.copy_dataset()

        # Get modification parameters
        modifications = request.POST.get("modifications", "{}")  # Expecting JSON format
        try:
            modifications = json.loads(modifications)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)

        # Modify features
        if "features" in modifications:
            new_dataset.features = modifications["features"]

        # Modify records
        if "records" in modifications:
            new_dataset.records = modifications["records"]

        new_dataset.save()

        return JsonResponse({
            "message": "Dataset copied and modified successfully",
            "dataset_id": new_dataset.id,
            "name": new_dataset.name,
            "features": new_dataset.features,
            "records": new_dataset.records
        })
    

# @method_decorator(csrf_exempt, name='dispatch')
class DeleteFeatureView(APIView):
    def post(self, request):
        # Parse JSON request body
        data = json.loads(request.body)
        dataset_id = data.get("dataset_id")
        features_to_remove = data.get("features_to_remove", [])

        if not dataset_id or not features_to_remove:
            return JsonResponse({"error": "Missing dataset_id or features_to_remove"}, status=400)

        # Retrieve the original Dataset
        original_dataset = Dataset.objects.get(id=dataset_id)

        # Copy the dataset to maintain modification history
        #new_dataset = original_dataset.copy_dataset(new_name=f"{original_dataset.name}_modified")

        # Keep only the features that are not being removed
        original_dataset.features = [f for f in original_dataset.features if f not in features_to_remove]

        # Remove the corresponding feature values from records
        original_dataset.records = [
            {k: v for k, v in record.items() if k in original_dataset.features}  # Keep only the remaining features
            for record in original_dataset.records
        ]

         # Save the modified dataset
        original_dataset.save()


        return JsonResponse({
            "message": "Feature(s) removed successfully",
            "dataset_id": original_dataset.id
        })

# @method_decorator(csrf_exempt, name='dispatch')
class CreateDatasetView(APIView):
    def post(self, request):
        try:
            # Parse the request body
            body = json.loads(request.body)
            dataset_id = body.get("dataset_id")  # Get the ID of the uploaded file
            features = body.get("features")  # The column name for the x-axis
            name = body.get("new_dataset_name")
            records = body.get("records")

            last_dataset = get_object_or_404(Dataset, id=dataset_id)
            # Create a new Dataset and associate it with last_dataset
            new_dataset = Dataset.objects.create(
                name=name,
                features=features,
                records=records,
                last_dataset=last_dataset  # Linked original dataset
            )
            # Return the created dataset id in JSON format
            return JsonResponse({"new_dataset_id": new_dataset.id,"name":new_dataset.name})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)