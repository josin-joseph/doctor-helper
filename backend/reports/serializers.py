from rest_framework import serializers
from .models import LabReport, LabParameter


class LabParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabParameter
        fields = '__all__'
        read_only_fields = ['status', 'clinical_significance']


class LabReportSerializer(serializers.ModelSerializer):
    parameters = LabParameterSerializer(many=True, read_only=True)
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    abnormal_count = serializers.SerializerMethodField()

    class Meta:
        model = LabReport
        fields = '__all__'
        read_only_fields = ['doctor', 'ai_interpretation', 'created_at', 'updated_at']

    def get_patient_name(self, obj):
        return obj.patient.get_full_name()

    def get_doctor_name(self, obj):
        return obj.doctor.get_full_name() if obj.doctor else None

    def get_abnormal_count(self, obj):
        return obj.parameters.exclude(status='normal').count()


class LabReportCreateSerializer(serializers.Serializer):
    patient_id = serializers.IntegerField()
    report_type = serializers.CharField()
    report_date = serializers.DateField()
    notes = serializers.CharField(required=False, allow_blank=True)
    parameters = serializers.ListField(child=serializers.DictField())