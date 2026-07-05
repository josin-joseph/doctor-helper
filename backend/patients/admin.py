from django.contrib import admin
from .models import Patient

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['patient_id', 'first_name', 'last_name', 'gender', 'phone', 'status']
    search_fields = ['first_name', 'last_name', 'patient_id', 'phone']
    list_filter = ['status', 'gender', 'blood_group']