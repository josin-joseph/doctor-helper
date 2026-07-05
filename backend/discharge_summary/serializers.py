from rest_framework import serializers
from .models import DischargeSummary


class DischargeSummarySerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    stay_duration = serializers.SerializerMethodField()

    class Meta:
        model = DischargeSummary
        fields = '__all__'
        read_only_fields = [
            'doctor', 'ai_narrative', 'pdf_file',
            'created_at', 'updated_at'
        ]

    def get_patient_name(self, obj):
        return obj.patient.get_full_name()

    def get_doctor_name(self, obj):
        return obj.doctor.get_full_name() if obj.doctor else None

    def get_stay_duration(self, obj):
        return obj.get_stay_duration()


class DischargeSummaryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DischargeSummary
        exclude = ['doctor', 'ai_narrative', 'pdf_file', 'created_at', 'updated_at']