import os
from pathlib import Path

import numpy as np
from rest_framework import status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from backend.api.models import UploadedFile, Dataset
from rest_framework.views import APIView
import pandas as pd


# Define BASE_DIR to point to the project root directory.
BASE_DIR = Path(__file__).resolve().parent.parent.parent
# @method_decorator(csrf_exempt, name='dispatch')
class UploadView(APIView):
    """
    Uploading files and parsing them into datasets for storage in the Dataset database
    """
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file received"}, status=status.HTTP_400_BAD_REQUEST)

        # Make sure the upload directory exists
        UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        file_path = os.path.join(UPLOAD_DIR, file.name)

        try:
            # Saving files to the backend
            with open(file_path, "wb") as f:
                for chunk in file.chunks():
                    f.write(chunk)

            # Parsing CSV / Excel files
            if file.name.lower().endswith(".csv"):
                df = pd.read_csv(file_path)
                file_type = "csv"
            elif file.name.lower().endswith(".xlsx"):
                df = pd.read_excel(file_path)
                file_type = "xlsx"
            else:
                return Response({"error": "Only CSV and XLSX files are supported"}, status=status.HTTP_400_BAD_REQUEST)

            # Extract Column Names & Data Records
            features = list(df.columns)
            df = df.replace({np.nan: None})
            records = df.to_dict(orient="records")

            # Stored in database Dataset
            dataset = Dataset.objects.create(
                name=file.name,
                features=features,
                records=records
            )

            # Optional: Deposit to UploadedFile record
            file_instance = UploadedFile.objects.create(
                file_path=file_path, name=file.name, file_type=file_type
            )

            return Response(
                {"message": f"File '{file.name}' uploaded and stored successfully.", "dataset_id": dataset.id, "name": file.name},
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            print("error:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)