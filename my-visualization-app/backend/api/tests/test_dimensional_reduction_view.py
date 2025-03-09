from django.test import TestCase
from rest_framework.test import APIClient
from backend.api.models import Dataset
import json
import pytest

class DimensionalReductionViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.dataset = Dataset.objects.create(name="Test Dataset", features=["x", "y", "z"], records=[{"x": 1, "y": 2, "z": 3}, {"x": 2, "y": 3, "z": 4}])

    @pytest.mark.django_db
    def test_dimensional_reduction(self):
        url = '/dimensional_reduction/'
        data = {
            "dataset_id": self.dataset.id,
            "method": "pca",
            "n_components": 2
        }
        response = self.client.post(url, json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn("reduced_features", response.data)
        self.assertIn("reduced_records", response.data)
