from django.db import models
from accounts.models import User


class DoctorProfile(models.Model):
    SPECIALIZATION_CHOICES = [
        ('general', 'General Physician'),
        ('cardiology', 'Cardiology'),
        ('neurology', 'Neurology'),
        ('orthopedics', 'Orthopedics'),
        ('pediatrics', 'Pediatrics'),
        ('gynecology', 'Gynecology'),
        ('dermatology', 'Dermatology'),
        ('psychiatry', 'Psychiatry'),
        ('radiology', 'Radiology'),
        ('surgery', 'Surgery'),
        ('oncology', 'Oncology'),
        ('other', 'Other'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    specialization = models.CharField(max_length=50, choices=SPECIALIZATION_CHOICES, default='general')
    qualification = models.CharField(max_length=200, blank=True)
    license_number = models.CharField(max_length=50, unique=True, blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    hospital_name = models.CharField(max_length=200, blank=True)
    hospital_address = models.TextField(blank=True)
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='doctor_profiles/', null=True, blank=True)
    consultation_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    available_days = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Dr. {self.user.get_full_name()} - {self.specialization}"