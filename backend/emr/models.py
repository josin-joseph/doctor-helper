from django.db import models
from patients.models import Patient
from accounts.models import User


class VitalSigns(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='vitals')
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    blood_pressure_systolic = models.IntegerField(null=True, blank=True)
    blood_pressure_diastolic = models.IntegerField(null=True, blank=True)
    heart_rate = models.IntegerField(null=True, blank=True)
    temperature = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    respiratory_rate = models.IntegerField(null=True, blank=True)
    oxygen_saturation = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    height = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    bmi = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    blood_glucose = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-recorded_at']

    def save(self, *args, **kwargs):
        if self.weight and self.height:
            height_m = float(self.height) / 100
            self.bmi = round(float(self.weight) / (height_m ** 2), 2)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Vitals for {self.patient} at {self.recorded_at}"


class Encounter(models.Model):
    ENCOUNTER_TYPES = [
        ('outpatient', 'Outpatient'),
        ('inpatient', 'Inpatient'),
        ('emergency', 'Emergency'),
        ('follow_up', 'Follow Up'),
        ('teleconsult', 'Teleconsult'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='encounters')
    doctor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='encounters')
    encounter_type = models.CharField(max_length=20, choices=ENCOUNTER_TYPES, default='outpatient')

    # Clinical info
    chief_complaints = models.TextField()
    history_of_present_illness = models.TextField(blank=True)
    past_medical_history = models.TextField(blank=True)
    physical_examination = models.TextField(blank=True)
    diagnosis = models.TextField()
    differential_diagnosis = models.TextField(blank=True)
    treatment_plan = models.TextField(blank=True)
    clinical_notes = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    follow_up_instructions = models.TextField(blank=True)

    # Dates
    encounter_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-encounter_date']

    def __str__(self):
        return f"Encounter: {self.patient} on {self.encounter_date.date()}"


class Prescription(models.Model):
    FREQUENCY_CHOICES = [
        ('once_daily', 'Once Daily'),
        ('twice_daily', 'Twice Daily'),
        ('thrice_daily', 'Thrice Daily'),
        ('four_times', 'Four Times Daily'),
        ('as_needed', 'As Needed'),
        ('weekly', 'Weekly'),
        ('other', 'Other'),
    ]
    ROUTE_CHOICES = [
        ('oral', 'Oral'),
        ('iv', 'Intravenous'),
        ('im', 'Intramuscular'),
        ('topical', 'Topical'),
        ('inhaled', 'Inhaled'),
        ('other', 'Other'),
    ]

    encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name='prescriptions')
    medicine_name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    route = models.CharField(max_length=20, choices=ROUTE_CHOICES, default='oral')
    duration_days = models.IntegerField(default=7)
    instructions = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.medicine_name} - {self.dosage}"


class Allergy(models.Model):
    SEVERITY_CHOICES = [
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
    ]
    ALLERGY_TYPES = [
        ('drug', 'Drug'),
        ('food', 'Food'),
        ('environmental', 'Environmental'),
        ('other', 'Other'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='allergies')
    allergen = models.CharField(max_length=200)
    allergy_type = models.CharField(max_length=20, choices=ALLERGY_TYPES, default='drug')
    reaction = models.TextField()
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    noted_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.allergen} - {self.severity}"