from django.urls import path
from . import views

urlpatterns = [
    path('', views.PatientListCreateView.as_view(), name='patient-list-create'),
    path('stats/', views.PatientStatsView.as_view(), name='patient-stats'),
    path('<int:pk>/', views.PatientDetailView.as_view(), name='patient-detail'),
    path('<int:pk>/timeline/', views.PatientTimelineView.as_view(), name='patient-timeline'),
]