from rest_framework import status
from rest_framework.response import Response
from backend.api.serializers import DatasetSerializer
from rest_framework.views import APIView

class UploadDatasetView(APIView):
    """
    Uploading data sets and storing them in the database
    """

    def post(self, request):
        serializer = DatasetSerializer(data=request.data)

        if serializer.is_valid():
            dataset = serializer.save()  # save dataset
            return Response(
                {"message": "Dataset uploaded successfully!", "dataset_id": dataset.id},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
