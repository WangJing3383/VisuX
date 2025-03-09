from rest_framework.test import APITestCase
from rest_framework import status
import json
import pytest

class DataVisualizationViewTest(APITestCase):

    @pytest.mark.django_db
    def test_no_data_provided(self):
        # Test no data provided.
        url = '/visualize/'
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json(), {"error": "No data provided"})

    @pytest.mark.django_db
    def test_valid_data(self):
        # Test provide valid data.
        url = '/visualize/'
        data = {
            "data": [
                {"column1": 1, "column2": 2},
                {"column1": 3, "column2": 4},
                {"column1": 5, "column2": 6}
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if the mean and std are correct.
        response_data = response.json()
        self.assertIn("mean", response_data)
        self.assertIn("std", response_data)
        self.assertEqual(response_data["mean"], [3.0, 4.0])
        self.assertEqual(response_data["std"], [2.0, 2.0])

    @pytest.mark.django_db
    def test_invalid_data(self):
        # Test providing invalid data.
        url = '/visualize/'
        data = {
            "data": [
                {"column1": "invalid", "column2": 2},
                {"column1": 3, "column2": "invalid"},
                {"column1": 5, "column2": 6}
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # The invalid value should be ignored.
        response_data = response.json()
        self.assertIn("mean", response_data)
        self.assertIn("std", response_data)

    @pytest.mark.django_db
    def test_empty_data(self):
        # Test providing empty data.
        url = '/visualize/' 
        data = {"data": []}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json(), {"error": "No data provided"})
