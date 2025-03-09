from django.test import TestCase
from rest_framework.test import APIClient
from backend.api.models import Dataset
import json
import pytest

class RecommendDimReductionViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.dataset = Dataset.objects.create(name="Test Dataset", features=["x", "y", "z"], records=[{"x": 1, "y": 2, "z": 3}, {"x": 2, "y": 3, "z": 4}])

    @pytest.mark.django_db
    def test_recommend_dim_reduction(self):
        url = '/recommend_dim_reduction/'
        data = {"dataset_id": self.dataset.id}
        response = self.client.get(url, data, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn("recommendations", response.data)
        self.assertIn("parameters", response.data)
