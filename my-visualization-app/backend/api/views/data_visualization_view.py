from rest_framework.response import Response
from rest_framework.views import APIView
import pandas as pd

class DataVisualizationView(APIView):
    def post(self, request):
        # Getting data
        data = request.data.get("data", [])
        if not data:
            return Response({"error": "No data provided"}, status=400)

        try:
            # Convert data to Pandas DataFrame
            df = pd.DataFrame(data)

            # Cleaning up the data: making sure all columns are numeric
            df = df.apply(pd.to_numeric, errors='coerce')

            # Calculate the mean and standard deviation for each column
            summary = {
                "columns": df.columns.tolist(),
                "mean": df.mean().tolist(),
                "std": df.std().tolist(),
            }

            return Response(summary)
        except Exception as e:
            return Response({"error": str(e)}, status=500)