from django.contrib import admin
from .models import MedicalQuery

@admin.register(MedicalQuery)
class MedicalQueryAdmin(admin.ModelAdmin):
    list_display = ['doctor', 'patient', 'question', 'created_at']
    search_fields = ['question', 'doctor__username']