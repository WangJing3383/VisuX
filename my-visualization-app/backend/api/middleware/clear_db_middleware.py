from django.utils.deprecation import MiddlewareMixin
from django.db import connection
from django.http import JsonResponse

class ClearDatabaseMiddleware(MiddlewareMixin):
    """Clear database only when a specific request is made"""

    def process_request(self, request):
        # Empty the database only if /api/clear_database/ is accessed by POST.
        if request.method == "POST" and request.path == "/api/clear_database/":
            tables_to_clear = ["api_uploadedfile", "api_dataset", "api_auditlog", "api_analysisresult"]

            with connection.cursor() as cursor:
                for table in tables_to_clear:
                    cursor.execute(f"DELETE FROM {table};")  # Empty table data
                    cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table}';")  # Reset self-incrementing ID

            # Returns a success response directly, preventing Django from continuing to look for the view and causing a 404 error.
            return JsonResponse({"message": "Database cleared successfully"}, status=200)

        return None  # Allow other requests to be executed normally
