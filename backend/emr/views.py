from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import VitalSigns, Encounter, Prescription, Allergy
from .serializers import (
    VitalSignsSerializer, EncounterSerializer,
    PrescriptionSerializer, AllergySerializer
)
from patients.models import Patient


class VitalSignsListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VitalSignsSerializer

    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        return VitalSigns.objects.filter(
            patient_id=patient_id,
            patient__doctor=self.request.user
        )

    def perform_create(self, serializer):
        patient_id = self.kwargs.get('patient_id')
        patient = Patient.objects.get(pk=patient_id, doctor=self.request.user)
        serializer.save(patient=patient, recorded_by=self.request.user)


class EncounterListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EncounterSerializer

    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        return Encounter.objects.filter(
            patient_id=patient_id,
            patient__doctor=self.request.user
        )

    def perform_create(self, serializer):
        patient_id = self.kwargs.get('patient_id')
        patient = Patient.objects.get(pk=patient_id, doctor=self.request.user)
        serializer.save(patient=patient, doctor=self.request.user)


class EncounterDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EncounterSerializer

    def get_queryset(self):
        return Encounter.objects.filter(patient__doctor=self.request.user)


class PrescriptionListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PrescriptionSerializer

    def get_queryset(self):
        encounter_id = self.kwargs.get('encounter_id')
        return Prescription.objects.filter(
            encounter_id=encounter_id,
            encounter__patient__doctor=self.request.user
        )

    def perform_create(self, serializer):
        encounter_id = self.kwargs.get('encounter_id')
        serializer.save(encounter_id=encounter_id)


class AllergyListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AllergySerializer

    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        return Allergy.objects.filter(
            patient_id=patient_id,
            patient__doctor=self.request.user
        )

    def perform_create(self, serializer):
        patient_id = self.kwargs.get('patient_id')
        patient = Patient.objects.get(pk=patient_id, doctor=self.request.user)
        serializer.save(patient=patient)


class AllergyDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AllergySerializer

    def get_queryset(self):
        return Allergy.objects.filter(patient__doctor=self.request.user)