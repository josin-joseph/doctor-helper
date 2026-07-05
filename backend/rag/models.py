from django.db import models
from accounts.models import User
from patients.models import Patient


class MedicalQuery(models.Model):
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='queries')
    patient = models.ForeignKey(
        Patient, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='queries'
    )
    question = models.TextField()
    answer = models.TextField()
    sources = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.doctor.username}: {self.question[:50]}"