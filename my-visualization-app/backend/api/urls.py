from django.urls import path
from .views import DataVisualizationView, OversampleDataView, SuggestFeatureCombiningView, SuggestFeatureDroppingView, \
    ApplyPcaView, HandleUserActionView, ExportLogView, ExtrapolateView, FitCurveView, InterpolateView, \
    CorrelationView, DimensionalReductionView, DatasetDetailView, DatasetColumnsView, \
    DeleteFeatureView, UploadView, ChangeDataView, DownloadView, RecommendDimReductionView, GetCsrfTokenView
from backend.api.views.dataset_views import CreateDatasetView

urlpatterns = [
    path('visualize/', DataVisualizationView.as_view(), name='visualize'),
    path('upload/', UploadView.as_view(), name='upload'),
    path('download/<int:dataset_id>/<str:file_format>/', DownloadView.as_view(), name='download_dataset'),
    #path("add_data/", AddDataView.as_view(), name = "add_data"),
    path("apply_pca/", ApplyPcaView.as_view(), name = "apply_pca"),
    path("suggest_feature_dropping/", SuggestFeatureDroppingView.as_view(), name = "suggest_feature_dropping"),
    path("suggest_feature_combining/", SuggestFeatureCombiningView.as_view(), name = "suggest_feature_combining"),
    path("handle_user_action/", HandleUserActionView.as_view(), name="handle_user_action"),
    path('export_log/', ExportLogView.as_view(), name='export_log'),
    path('fit_curve/', FitCurveView.as_view(), name='fit_curve'),
    path('interpolate/', InterpolateView.as_view(), name='interpolate'),
    path('extrapolate/', ExtrapolateView.as_view(), name='extrapolate'),
    path('correlation/', CorrelationView.as_view(), name='correlation'),
    path('dimensional_reduction/', DimensionalReductionView.as_view(), name='dimensional_reduction'),
    path('recommend_dim_reduction/', RecommendDimReductionView.as_view(), name='recommend_dim_reduction'),
    path('oversample_data/', OversampleDataView.as_view(), name='oversample_data'),
    path("get_csrf_token/", GetCsrfTokenView.as_view(), name="get_csrf_token"),
    path('datasets/<int:dataset_id>/', DatasetDetailView.as_view(), name='dataset-detail'),
    path('dataset/<int:dataset_id>/columns/', DatasetColumnsView.as_view(), name='dataset-columns'),
    path('change_data/', ChangeDataView.as_view(), name='change-data'),
    path('delete_feature/', DeleteFeatureView.as_view(), name='delete_feature'),
    path('create_dataset/', CreateDatasetView.as_view(), name = 'creat_dataset'),
]
