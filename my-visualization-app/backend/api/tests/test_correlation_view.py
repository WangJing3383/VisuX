from django.test import TestCase
from rest_framework.test import APIClient
from backend.api.models import Dataset
import json
import pytest

class CorrelationViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.dataset = Dataset.objects.create(name="Test Dataset", features=["x", "y"], records=[{"x": 1, "y": 2}, {"x": 2, "y": 4}])

    @pytest.mark.django_db
    def test_correlation(self):
        url = '/correlation/'
        data = {
            "dataset_id": self.dataset.id,
            "features": ["x", "y"],
            "method": "pearson"
        }
        response = self.client.post(url, json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn("correlation_matrix", response.data)
