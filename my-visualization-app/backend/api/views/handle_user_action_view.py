from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from rest_framework.views import APIView
import json
import pandas as pd

# @method_decorator(csrf_exempt, name='dispatch')
class HandleUserActionView(APIView):
    def post(self, request):
        """
        Handle user actions sent from the frontend and return a response.
        """
        try:
            # Get JSON data from frontend
            body = json.loads(request.body)
            action = body.get("action", None)
            parameters = body.get("parameters", {})

            if not action:
                return JsonResponse({"error": "No action provided"}, status=400)

            if action == "fetch_summary":
                summary = {
                    "message": "Summary fetched successfully",
                    "details": parameters.get("details", "No details provided")
                }
                return JsonResponse(summary, status=200)
            elif action == "process_data":
                data = parameters.get("data", [])
                if not data:
                    return JsonResponse({"error": "No data provided for processing"}, status=400)

                # Use pandas to process data
                df = pd.DataFrame(data)
                result = {
                    "columns": df.columns.tolist(),
                    "mean": df.mean().tolist(),
                    "std": df.std().tolist()
                }
                return JsonResponse({"message": "Data processed successfully", "result": result}, status=200)
            else:
                return JsonResponse({"error": f"Unknown action: {action}"}, status=400)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)