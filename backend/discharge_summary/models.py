from django.db import models
from patients.models import Patient
from accounts.models import User


class DischargeSummary(models.Model):
    CONDITION_CHOICES = [
        ('stable', 'Stable'),
        ('improved', 'Improved'),
        ('critical', 'Critical'),
        ('deceased', 'Deceased'),
        ('transferred', 'Transferred'),
    ]

    # Core relations
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name='discharge_summaries'
    )
    doctor = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='discharge_summaries'
    )

    # Admission details
    admission_date = models.DateField()
    discharge_date = models.DateField()
    ward = models.CharField(max_length=100, blank=True)
    bed_number = models.CharField(max_length=20, blank=True)

    # Clinical content
    chief_complaints = models.TextField()
    medical_history = models.TextField(blank=True)
    family_history = models.TextField(blank=True)
    physical_examination = models.TextField(blank=True)
    diagnosis = models.TextField()
    differential_diagnosis = models.TextField(blank=True)

    # Investigations
    investigations = models.TextField(blank=True)
    imaging_results = models.TextField(blank=True)

    # Treatment
    procedures_performed = models.TextField(blank=True)
    treatment_given = models.TextField(blank=True)
    blood_transfusions = models.TextField(blank=True)

    # Hospital course
    hospital_course = models.TextField()
    complications = models.TextField(blank=True)

    # Discharge details
    condition_at_discharge = models.CharField(
        max_length=20, choices=CONDITION_CHOICES, default='stable'
    )
    discharge_medications = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    follow_up_instructions = models.TextField(blank=True)
    diet_instructions = models.TextField(blank=True)
    activity_restrictions = models.TextField(blank=True)
    special_instructions = models.TextField(blank=True)

    # AI generated
    ai_narrative = models.TextField(blank=True)
    pdf_file = models.FileField(upload_to='discharge_summaries/', null=True, blank=True)

    # Meta
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Discharge Summaries'

    def get_stay_duration(self):
        if self.admission_date and self.discharge_date:
            return (self.discharge_date - self.admission_date).days
        return 0

    def __str__(self):
        return f"Discharge Summary - {self.patient} ({self.discharge_date})"