from django.urls import path
from . import views

urlpatterns = [
    path('', views.LabReportListCreateView.as_view(), name='lab-reports'),
    path('<int:pk>/', views.LabReportDetailView.as_view(), name='lab-report-detail'),
    path('stats/', views.LabReportStatsView.as_view(), name='lab-report-stats'),
]