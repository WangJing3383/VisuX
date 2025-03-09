from django.test import TestCase
from rest_framework.test import APIClient
import json
import pytest

class ApplyPcaViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    @pytest.mark.django_db
    def test_apply_pca(self):
        url = '/apply_pca/'
        data = {
            "dataset": [{"x": 1, "y": 2}, {"x": 3, "y": 4}],
            "n_components": 2
        }
        response = self.client.post(url, json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn("pca_result", response.data)
