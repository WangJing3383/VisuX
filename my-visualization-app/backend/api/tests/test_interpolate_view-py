from django.test import TestCase
from rest_framework.test import APIClient
from backend.api.models import Dataset
import json
import pytest

class InterpolateViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.dataset = Dataset.objects.create(name="Test Dataset", features=["x", "y"], records=[{"x": 1, "y": 2}, {"x": 2, "y": 4}])

    @pytest.mark.django_db
    def test_interpolate(self):
        url = '/interpolate/'
        data = {
            "dataset_id": self.dataset.id,
            "x_feature": "x",
            "y_feature": "y",
            "kind": "linear",
            "numPoints": 10
        }
        response = self.client.post(url, json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn("interpolated_data", response.data)
