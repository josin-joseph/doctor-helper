from rest_framework import serializers
from .models import VitalSigns, Encounter, Prescription, Allergy


class VitalSignsSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = VitalSigns
        fields = '__all__'
        read_only_fields = ['recorded_by', 'bmi', 'recorded_at']

    def get_recorded_by_name(self, obj):
        if obj.recorded_by:
            return obj.recorded_by.get_full_name()
        return None


class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = '__all__'
        read_only_fields = ['created_at']


class EncounterSerializer(serializers.ModelSerializer):
    prescriptions = PrescriptionSerializer(many=True, read_only=True)
    doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = Encounter
        fields = '__all__'
        read_only_fields = ['doctor', 'encounter_date', 'updated_at']

    def get_doctor_name(self, obj):
        if obj.doctor:
            return obj.doctor.get_full_name()
        return None

    def get_patient_name(self, obj):
        return obj.patient.get_full_name()


class AllergySerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergy
        fields = '__all__'
        read_only_fields = ['noted_date']