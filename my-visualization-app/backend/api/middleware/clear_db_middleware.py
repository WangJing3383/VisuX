from django.utils.deprecation import MiddlewareMixin
from django.db import connection


class ClearDatabaseMiddleware(MiddlewareMixin):
    """Clear database only when get_csrf_token request is made"""

    # Get csrf token can be changed to any function that simply identifies that the database needs to be emptied.
    # Here has nothing to do with csrf
    def process_request(self, request):
        # Empty the database only on GET requests with path /api/get_csrf_token/.
        if request.method == "GET" and request.path == "/api/get_csrf_token/":

            tables_to_clear = ["api_uploadedfile", "api_dataset", "api_auditlog", "api_analysisresult"]

            with connection.cursor() as cursor:
                for table in tables_to_clear:
                    cursor.execute(f"DELETE FROM {table};")  # Empty table data
                    cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table}';")  # Reset ID Count

        return None





