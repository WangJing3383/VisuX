from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from backend.api.models import Dataset
import json
import pandas as pd
import pytest

class DownloadViewTests(TestCase):
    
    @classmethod
    def setUpTestData(cls):
        # Create a test dataset
        cls.dataset = Dataset.objects.create(
            name="Test Dataset",
            features=["feature1", "feature2"],
            records=[
                {"feature1": 1, "feature2": 2},
                {"feature1": 3, "feature2": 4}
            ]
        )

    @pytest.mark.django_db
    def test_download_csv(self):
        url = reverse('download_dataset', kwargs={'dataset_id': self.dataset.id, 'file_format': 'csv'})
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')
        self.assertIn('Content-Disposition', response)
        self.assertTrue(response['Content-Disposition'].startswith('attachment; filename="Test Dataset.csv"'))
        
        # Check the content of the CSV
        content = response.content.decode('utf-8')
        self.assertIn("feature1", content)
        self.assertIn("feature2", content)
        self.assertIn("1", content)
        self.assertIn("3", content)

    @pytest.mark.django_db
    def test_download_json(self):
        url = reverse('download_dataset', kwargs={'dataset_id': self.dataset.id, 'file_format': 'json'})
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/json')
        self.assertIn('Content-Disposition', response)
        self.assertTrue(response['Content-Disposition'].startswith('attachment; filename="Test Dataset.json"'))
        
        # Check the content of the JSON
        content = json.loads(response.content)
        self.assertIn("feature1", content[0])
        self.assertIn("feature2", content[0])
        self.assertEqual(content[0]["feature1"], 1)

    @pytest.mark.django_db
    def test_download_xlsx(self):
        url = reverse('download_dataset', kwargs={'dataset_id': self.dataset.id, 'file_format': 'xlsx'})
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        self.assertIn('Content-Disposition', response)
        self.assertTrue(response['Content-Disposition'].startswith('attachment; filename="Test Dataset.xlsx"'))
        
        # Check if content is an xlsx file (basic check)
        self.assertTrue(response.content.startswith(b'PK'))

    @pytest.mark.django_db
    def test_invalid_file_format(self):
        url = reverse('download_dataset', kwargs={'dataset_id': self.dataset.id, 'file_format': 'txt'})
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        content = json.loads(response.content)
        self.assertEqual(content["error"], "Unsupported format")

    @pytest.mark.django_db
    def test_dataset_not_found(self):
        url = reverse('download_dataset', kwargs={'dataset_id': 99999, 'file_format': 'csv'})
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        content = json.loads(response.content)
        self.assertEqual(content["detail"], "Not found.")
