import pytest
class DeleteFeatureViewTest(APITestCase):
    
    def setUp(self):
        self.dataset = Dataset.objects.create(name="Test Dataset", features=["feature1", "feature2"], records=[{"feature1": 1, "feature2": 2}])

    @pytest.mark.django_db
    def test_delete_feature(self):
        url = '/delete_feature/'
        data = json.dumps({
            "dataset_id": self.dataset.id,
            "features_to_remove": ["feature2"]
        })
        response = self.client.post(url, data, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)
        self.assertIn("dataset_id", response.data)

    @pytest.mark.django_db
    def test_delete_feature_missing_field(self):
        url = '/delete_feature/'
        data = json.dumps({
            "dataset_id": self.dataset.id
        })
        response = self.client.post(url, data, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
