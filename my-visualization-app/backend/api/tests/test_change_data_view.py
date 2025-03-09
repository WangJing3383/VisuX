import pytest
class ChangeDataViewTest(APITestCase):
    
    def setUp(self):
        self.dataset = Dataset.objects.create(name="Test Dataset", features=["feature1", "feature2"], records=[{"feature1": 1, "feature2": 2}])

    @pytest.mark.django_db
    def test_change_data(self):
        url = f'/change_data/{self.dataset.id}/'
        data = {
            "modifications": json.dumps({
                "features": ["feature1", "feature3"],
                "records": [{"feature1": 1, "feature3": 3}]
            })
        }
        response = self.client.post(url, data, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("dataset_id", response.data)
        self.assertIn("features", response.data)
        self.assertIn("records", response.data)

    @pytest.mark.django_db
    def test_change_data_invalid_json(self):
        url = f'/change_data/{self.dataset.id}/'
        data = {
            "modifications": "invalid_json"
        }
        response = self.client.post(url, data, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
