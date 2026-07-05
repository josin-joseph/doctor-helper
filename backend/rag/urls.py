from django.urls import path
from . import views

urlpatterns = [
    path('ask/', views.AskMedicalAssistantView.as_view(), name='ask-assistant'),
    path('history/', views.QueryHistoryView.as_view(), name='query-history'),
    path('build-index/', views.BuildIndexView.as_view(), name='build-index'),
]