import pytest
class CreateDatasetViewTest(APITestCase):

    def setUp(self):
        self.dataset = Dataset.objects.create(name="Test Dataset", features=["feature1", "feature2"], records=[{"feature1": 1, "feature2": 2}])

    @pytest.mark.django_db
    def test_create_dataset(self):
        url = '/create_dataset/'
        data = json.dumps({
            "dataset_id": self.dataset.id,
            "features": ["feature1", "feature3"],
            "new_dataset_name": "New Dataset",
            "records": [{"feature1": 1, "feature3": 3}]
        })
        response = self.client.post(url, data, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("new_dataset_id", response.data)
        self.assertIn("name", response.data)

    @pytest.mark.django_db
    def test_create_dataset_invalid(self):
        url = '/create_dataset/'
        data = json.dumps({
            "dataset_id": "invalid",  # Invalid dataset_id
            "features": ["feature1", "feature3"],
            "new_dataset_name": "New Dataset",
            "records": [{"feature1": 1, "feature3": 3}]
        })
        response = self.client.post(url, data, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
