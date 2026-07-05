from django.contrib import admin
from .models import DischargeSummary

@admin.register(DischargeSummary)
class DischargeSummaryAdmin(admin.ModelAdmin):
    list_display = ['patient', 'doctor', 'admission_date',
                    'discharge_date', 'condition_at_discharge']
    list_filter = ['condition_at_discharge']
    search_fields = ['patient__first_name', 'patient__last_name', 'diagnosis']