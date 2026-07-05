from django.urls import path
from . import views

urlpatterns = [
    path('', views.DischargeSummaryListCreateView.as_view(), name='discharge-list-create'),
    path('<int:pk>/', views.DischargeSummaryDetailView.as_view(), name='discharge-detail'),
    path('<int:pk>/pdf/', views.GeneratePDFView.as_view(), name='discharge-pdf'),
    path('<int:pk>/regenerate/', views.RegenerateNarrativeView.as_view(), name='discharge-regenerate'),
]