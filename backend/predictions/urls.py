from django.urls import path
from . import views

urlpatterns = [
    path('predict/<int:patient_id>/', views.PredictDiseaseView.as_view(), name='predict-disease'),
    path('history/<int:patient_id>/', views.PatientPredictionHistoryView.as_view(), name='prediction-history'),
    path('stats/', views.PredictionStatsView.as_view(), name='prediction-stats'),
]