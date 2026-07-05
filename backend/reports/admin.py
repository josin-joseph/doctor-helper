from django.contrib import admin
from .models import LabReport, LabParameter

class LabParameterInline(admin.TabularInline):
    model = LabParameter
    extra = 0

@admin.register(LabReport)
class LabReportAdmin(admin.ModelAdmin):
    list_display = ['patient', 'report_type', 'report_date', 'status']
    list_filter = ['report_type', 'status']
    inlines = [LabParameterInline]