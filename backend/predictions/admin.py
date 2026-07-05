from django.contrib import admin
from .models import DiseasePrediction

@admin.register(DiseasePrediction)
class DiseasePredictionAdmin(admin.ModelAdmin):
    list_display = ['patient', 'predicted_disease', 'confidence_score', 'created_at']
    list_filter = ['predicted_disease']
    search_fields = ['patient__first_name', 'patient__last_name', 'predicted_disease']