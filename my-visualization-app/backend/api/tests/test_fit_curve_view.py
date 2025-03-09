from django.test import TestCase
from rest_framework.test import APIClient
from backend.api.models import Dataset
import json
import pytest

class FitCurveViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.dataset = Dataset.objects.create(name="Test Dataset", features=["x", "y"], records=[{"x": 1, "y": 2}, {"x": 2, "y": 4}])

    @pytest.mark.django_db
    def test_fit_curve(self):
        url = '/fit_curve/'
        data = {
            "params": {
                "datasetId": self.dataset.id,
                "xColumn": "x",
                "yColumn": "y",
                "type": "linear"
            }
        }
        response = self.client.post(url, json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn("params", response.data)
        self.assertIn("generated_data", response.data)
