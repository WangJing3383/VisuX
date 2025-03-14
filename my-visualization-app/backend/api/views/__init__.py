from .data_visualization_view import DataVisualizationView
from .handle_user_action_view import HandleUserActionView
from .upload_view import UploadView
from .download_view import DownloadView
from .dataset_views import DatasetColumnsView, DatasetDetailView, DeleteFeatureView, ChangeDataView
from .upload_dataset_view import UploadDatasetView
from .processing_views import (InterpolateView, ExtrapolateView, CorrelationView, FitCurveView,
                               DimensionalReductionView, OversampleDataView
                               , RecommendDimReductionView)

__all__ = [
    "UploadDatasetView",
    "HandleUserActionView",
    "DataVisualizationView",
    "UploadView",
    "DatasetDetailView",
    "DatasetColumnsView",
    "DeleteFeatureView",
    "ChangeDataView",
    "DimensionalReductionView",
    "RecommendDimReductionView",
    "OversampleDataView",
    "ExtrapolateView",
    "InterpolateView",
    "CorrelationView",
    "FitCurveView",
    "DownloadView",
]