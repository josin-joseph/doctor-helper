from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.DoctorProfileView.as_view(), name='doctor-profile'),
    path('list/', views.DoctorListView.as_view(), name='doctor-list'),
]