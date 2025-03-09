import pytest
class DatasetColumnsViewTest(APITestCase):
    
    def setUp(self):
        self.dataset = Dataset.objects.create(name="Test Dataset", features=["feature1", "feature2"], records=[{"feature1": 1, "feature2": 2}])

    @pytest.mark.django_db
    def test_get_dataset_columns(self):
        url = f'/datasets/{self.dataset.id}/columns/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("columns", response.data)
        self.assertEqual(response.data["columns"], ["feature1", "feature2"])

    @pytest.mark.django_db
    def test_get_dataset_columns_not_found(self):
        url = '/datasets/invalid/columns/'  # Invalid ID
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("error", response.data)
