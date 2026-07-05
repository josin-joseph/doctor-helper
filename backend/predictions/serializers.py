from rest_framework import serializers
from .models import DiseasePrediction


class PredictionInputSerializer(serializers.Serializer):
    # Symptoms
    age                  = serializers.IntegerField(min_value=0, max_value=120)
    fever                = serializers.BooleanField(default=False)
    cough                = serializers.BooleanField(default=False)
    fatigue              = serializers.BooleanField(default=False)
    headache             = serializers.BooleanField(default=False)
    chest_pain           = serializers.BooleanField(default=False)
    shortness_of_breath  = serializers.BooleanField(default=False)
    nausea               = serializers.BooleanField(default=False)
    vomiting             = serializers.BooleanField(default=False)
    diarrhea             = serializers.BooleanField(default=False)
    sore_throat          = serializers.BooleanField(default=False)
    body_ache            = serializers.BooleanField(default=False)
    loss_of_appetite     = serializers.BooleanField(default=False)
    sweating             = serializers.BooleanField(default=False)
    chills               = serializers.BooleanField(default=False)
    # Vitals
    blood_pressure       = serializers.IntegerField(default=120)
    heart_rate           = serializers.IntegerField(default=72)
    temperature          = serializers.FloatField(default=98.6)
    oxygen_saturation    = serializers.FloatField(default=98.0)
    blood_glucose        = serializers.FloatField(default=100.0)


class DiseasePredictionSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = DiseasePrediction
        fields = '__all__'
        read_only_fields = ['doctor', 'created_at']

    def get_patient_name(self, obj):
        return obj.patient.get_full_name()