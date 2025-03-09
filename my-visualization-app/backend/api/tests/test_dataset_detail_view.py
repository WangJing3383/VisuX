from rest_framework.test import APITestCase
from rest_framework import status
from backend.api.models import Dataset
import pytest

class DatasetDetailViewTest(APITestCase):
    
    def setUp(self):
        self.dataset = Dataset.objects.create(name="Test Dataset", features=["feature1", "feature2"], records=[{"feature1": 1, "feature2": 2}])

    @pytest.mark.django_db
    def test_get_dataset_detail(self):
        url = f'/datasets/{self.dataset.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("name", response.data)
        self.assertIn("features", response.data)
        self.assertIn("records", response.data)

    @pytest.mark.django_db
    def test_get_dataset_not_found(self):
        url = '/datasets/invalid/'  # invalid ID
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("error", response.data)
