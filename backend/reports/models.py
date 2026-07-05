from django.db import models
from patients.models import Patient
from accounts.models import User


class LabReport(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('analyzed', 'Analyzed'),
        ('reviewed', 'Reviewed'),
    ]
    REPORT_TYPES = [
        ('cbc', 'Complete Blood Count'),
        ('lft', 'Liver Function Test'),
        ('kft', 'Kidney Function Test'),
        ('lipid', 'Lipid Profile'),
        ('thyroid', 'Thyroid Profile'),
        ('glucose', 'Blood Glucose'),
        ('urine', 'Urine Analysis'),
        ('electrolytes', 'Electrolytes'),
        ('cardiac', 'Cardiac Markers'),
        ('other', 'Other'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='lab_reports')
    doctor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='lab_reports')
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES, default='cbc')
    report_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    ai_interpretation = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-report_date']

    def __str__(self):
        return f"{self.patient} - {self.report_type} ({self.report_date})"


class LabParameter(models.Model):
    STATUS_CHOICES = [
        ('normal', 'Normal'),
        ('low', 'Low'),
        ('high', 'High'),
        ('critical_low', 'Critical Low'),
        ('critical_high', 'Critical High'),
    ]

    report = models.ForeignKey(LabReport, on_delete=models.CASCADE, related_name='parameters')
    parameter_name = models.CharField(max_length=100)
    value = models.FloatField()
    unit = models.CharField(max_length=50)
    normal_min = models.FloatField(null=True, blank=True)
    normal_max = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='normal')