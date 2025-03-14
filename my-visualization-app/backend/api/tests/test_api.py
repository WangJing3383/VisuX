import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from backend.api.models import Dataset

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def test_user(db):
    return User.objects.create_user(username="testuser", password="testpassword")

@pytest.mark.django_db
def test_upload_file(api_client, test_user):
    api_client.force_authenticate(user=test_user)

    with open("tests/test_data.csv", "rb") as file:
        response = api_client.post("/api/upload/", {"file": file})

    assert response.status_code == 201

@pytest.mark.django_db
def test_download_file(api_client, test_user):
    api_client.force_authenticate(user=test_user)

    dataset = Dataset.objects.create(name="Test Dataset")

    response = api_client.get(f"/api/download/{dataset.id}/csv/")

    assert response.status_code == 200
    assert response["Content-Type"] == "text/csv"

@pytest.mark.django_db
def test_apply_pca(api_client, test_user):
    api_client.force_authenticate(user=test_user)

    payload = {"dataset_id": 1, "n_components": 2}
    response = api_client.post("/api/apply_pca/", data=payload, format="json")

    assert response.status_code in [200, 400]

@pytest.mark.django_db
def test_suggest_feature_dropping(api_client, test_user):
    api_client.force_authenticate(user=test_user)

    response = api_client.post("/api/suggest_feature_dropping/", data={"dataset_id": 1}, format="json")

    assert response.status_code in [200, 400]

@pytest.mark.django_db
def test_suggest_feature_combining(api_client, test_user):
    api_client.force_authenticate(user=test_user)

    response = api_client.post("/api/suggest_feature_combining/", data={"dataset_id": 1}, format="json")

    assert response.status_code in [200, 400]

@pytest.mark.django_db
def test_handle_user_action(api_client, test_user):
    api_client.force_authenticate(user=test_user)

    payload = {"action": "delete", "dataset_id": 1}
    response = api_client.post("/api/handle_user_action/", data=payload, format="json")

    assert response.status_code in [200, 400]

@pytest.mark.django_db
def test_export_log(api_client, test_user):
    api_client.force_authenticate(user=test_user)

    response = api_client.get("/api/export_log/")

    assert response.status_code == 200

@pytest.mark.django_db
def test_fit_curve(api_client, test_user):
    api_client.force_authenticate(user=test_user)

    payload = {"dataset_id": 1, "feature": "x"}
    response = api_client.post("/api/fit_curve/", data=payload, format="json")

    assert response.status_code in [200, 400]

@pytest.mark.django_db
def test_interpolate(api_client, test_user):
    api_client.force_authenticate(user=test_user)

    payload = {"dataset_id": 1, "method": "linear"}
    response = api_client.post("/api/interpolate/", data=payload, format="json")

    assert response.status_code in [200, 400]

@pytest.mark.django_db
def test_extrapolate(api_client, test_user):
    api_client.force_authenticate(user=test_user)

    payload = {"dataset_id": 1, "method": "polynomial"}
    response = api_client.post("/api/extrapolate/", data=payload, format="json")

    assert response.status_code in [200, 400]

@pytest.mark.django_db
def test_correlation(api_client, test_user):
    api_client.force_authenticate(user=test_user)

    payload = {"dataset_id": 1}
    response = api_client.post("/api/correlation/", data=payload, format="json")

    assert response.status_code in [200, 400]

@pytest.mark.django_db
def test_dimensional_reduction(api_client, test_user):
    api_client.force_authenticate(user=test_user)

    payload = {"dataset_id": 1, "method": "PCA"}
    response = api_client.post("/api/dimensional_reduction/", data=payload, format="json")

    assert response.status_code in [200, 400]

@pytest.mark.django_db
def test_recommend_dim_reduction(api_client, test_user):
    api_client.force_authenticate(user=test_user)

    response = api_client.post("/api/recommend_dim_reduction/", data={"dataset_id": 1}, format="json")

    assert response.status_code in [200, 400]

@pytest.mark.django_db
def test_oversample_data(api_client, test_user):
    api_client.force_authenticate(user=test_user)

    response = api_client.post("/api/oversample_data/", data={"dataset_id": 1}, format="json")

    assert response.status_code in [200, 400]

@pytest.mark.django_db
def test_dataset_detail(api_client, test_user):
    api_client.force_authenticate(user=test_user)

    dataset = Dataset.objects.create(name="Test Dataset")

    response = api_client.get(f"/api/datasets/{dataset.id}/")

    assert response.status_code == 200

@pytest.mark.django_db
def test_dataset_columns(api_client, test_user):
    api_client.force_authenticate(user=test_user)

    dataset = Dataset.objects.create(name="Test Dataset")

    response = api_client.get(f"/api/dataset/{dataset.id}/columns/")

    assert response.status_code == 200

@pytest.mark.django_db
def test_change_data(api_client, test_user):
    api_client.force_authenticate(user=test_user)

    payload = {"dataset_id": 1, "changes": {"column": "new_value"}}
    response = api_client.post("/api/change_data/", data=payload, format="json")

    assert response.status_code in [200, 400]

@pytest.mark.django_db
def test_delete_feature(api_client, test_user):
    api_client.force_authenticate(user=test_user)

    payload = {"dataset_id": 1, "feature": "column1"}
    response = api_client.post("/api/delete_feature/", data=payload, format="json")

    assert response.status_code in [200, 400]

@pytest.mark.django_db
def test_create_dataset(api_client, test_user):
    api_client.force_authenticate(user=test_user)

    payload = {"name": "New Dataset"}
    response = api_client.post("/api/create_dataset/", data=payload, format="json")

    assert response.status_code in [201, 400]
