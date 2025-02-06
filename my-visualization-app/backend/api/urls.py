from django.urls import path
from .views import DataVisualizationView, SuggestFeatureCombiningView, SuggestFeatureDroppingView, UploadView, AddDataView, ApplyPcaView

urlpatterns = [
    path('visualize/', DataVisualizationView.as_view(), name='visualize'),
    path('upload/', UploadView.as_view(), name='upload'),
    path("add_data/", AddDataView.as_view(), name = "add_data"),
    path("apply_pca/", ApplyPcaView.as_view(), name = "apply_pca"),
    path("suggest_feature_dropping/", SuggestFeatureDroppingView.as_view(), name = "suggest_feature_dropping"),
    path("suggest_feature_combining/", SuggestFeatureCombiningView.as_view(), name = "suggest_feature_combining"),
]
