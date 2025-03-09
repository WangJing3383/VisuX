from django.test import TestCase
from rest_framework.test import APIClient
import json
import pytest

class SuggestFeatureCombiningViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    @pytest.mark.django_db
    def test_suggest_feature_combining(self):
        url = 'suggest_feature_combining/'
        data = {
            "dataset_id": 1,
            "correlation_threshold": 0.9
        }
        response = self.client.post(url, json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn("feature_combinations", response.data)
