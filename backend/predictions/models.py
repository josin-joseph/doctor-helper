from django.db import models
from patients.models import Patient
from accounts.models import User


class DiseasePrediction(models.Model):
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name='predictions'
    )
    doctor = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='predictions'
    )

    # Input symptoms
    age = models.IntegerField()
    fever = models.BooleanField(default=False)
    cough = models.BooleanField(default=False)
    fatigue = models.BooleanField(default=False)
    headache = models.BooleanField(default=False)
    chest_pain = models.BooleanField(default=False)
    shortness_of_breath = models.BooleanField(default=False)
    nausea = models.BooleanField(default=False)
    vomiting = models.BooleanField(default=False)
    diarrhea = models.BooleanField(default=False)
    sore_throat = models.BooleanField(default=False)
    body_ache = models.BooleanField(default=False)
    loss_of_appetite = models.BooleanField(default=False)
    sweating = models.BooleanField(default=False)
    chills = models.BooleanField(default=False)

    # Vitals input
    blood_pressure = models.IntegerField(default=120)
    heart_rate = models.IntegerField(default=72)
    temperature = models.FloatField(default=98.6)
    oxygen_saturation = models.FloatField(default=98.0)
    blood_glucose = models.FloatField(default=100.0)

    # Prediction output
    predicted_disease = models.CharField(max_length=100)
    confidence_score = models.FloatField()
    shap_values = models.JSONField(null=True, blank=True)
    all_probabilities = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.patient} → {self.predicted_disease} ({self.confidence_score:.1%})"