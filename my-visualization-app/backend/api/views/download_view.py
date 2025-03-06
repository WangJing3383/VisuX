import io
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404

from backend.server_handler.log_manager import export_logs
from django.http import JsonResponse, HttpResponse
from backend.api.models import Dataset
from rest_framework.views import APIView
import json
import pandas as pd



# @method_decorator(csrf_exempt, name='dispatch')
class DownloadView(APIView):
    def get(self, request, dataset_id, file_format, *args, **kwargs):

        # Get the specified dataset
        dataset = get_object_or_404(Dataset, id=dataset_id)

        # Ensure that `features` and `records` exist.
        features = dataset.features if hasattr(dataset, "features") else []
        records = dataset.records if hasattr(dataset, "records") else []

        df = pd.DataFrame(records, columns=features)

        if file_format == "csv":
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{dataset.name}.csv"'
            df.to_csv(response, index=False)
        elif file_format == "json":
            response = HttpResponse(json.dumps(records, indent=2), content_type='application/json')
            response['Content-Disposition'] = f'attachment; filename="{dataset.name}.json"'
        elif file_format == "xlsx":
            try:
                # Use `BytesIO()` as Excel file buffer
                output = io.BytesIO()
                with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
                    df.to_excel(writer, index=False, sheet_name="Data")

                # Returning the stream to its starting position
                output.seek(0)

                # Generate HttpResponse
                response = HttpResponse(output.getvalue(),
                                        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                response['Content-Disposition'] = f'attachment; filename="{dataset.name}.xlsx"'
                return response
            except Exception as e:
                print(f"Excel generation error: {e}")
                return JsonResponse({"error": f"Failed to generate Excel file: {str(e)}"}, status=500)
        else:
            return JsonResponse({"error": "Unsupported format"}, status=400)

        return response
