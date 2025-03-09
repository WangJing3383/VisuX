from django.test import TestCase
from rest_framework.test import APIClient
from backend.api.models import Dataset
import json
import pytest

class OversampleDataViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.dataset = Dataset.objects.create(name="Test Dataset", features=["x", "y"], records=[{"x": 1, "y": 2}, {"x": 2, "y": 4}])

    @pytest.mark.django_db
    def test_oversample(self):
        url = '/oversample_data/'
        data = {
            "datasetId": self.dataset.id,
            "params": {
                "xColumn": "x",
                "yColumn": "y",
                "method": "smote",
                "num_samples": 5
            }
        }
        response = self.client.post(url, json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn("oversampled_features", response.data)
        self.assertIn("oversampled_records", response.data)
