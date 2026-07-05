from django.urls import path
from . import views

urlpatterns = [
    path('patients/<int:patient_id>/vitals/', views.VitalSignsListCreateView.as_view(), name='vitals'),
    path('patients/<int:patient_id>/encounters/', views.EncounterListCreateView.as_view(), name='encounters'),
    path('patients/<int:patient_id>/allergies/', views.AllergyListCreateView.as_view(), name='allergies'),
    path('encounters/<int:pk>/', views.EncounterDetailView.as_view(), name='encounter-detail'),
    path('encounters/<int:encounter_id>/prescriptions/', views.PrescriptionListCreateView.as_view(), name='prescriptions'),
    path('allergies/<int:pk>/', views.AllergyDetailView.as_view(), name='allergy-detail'),
]