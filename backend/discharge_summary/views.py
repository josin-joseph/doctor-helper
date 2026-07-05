from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from django.core.files.base import ContentFile
from .models import DischargeSummary
from .serializers import DischargeSummarySerializer, DischargeSummaryCreateSerializer
from .pdf_generator import generate_discharge_pdf
from .ai_generator import generate_ai_narrative
from patients.models import Patient
from doctors.models import DoctorProfile
import os


class DischargeSummaryListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient_id = request.query_params.get('patient_id')
        summaries = DischargeSummary.objects.filter(doctor=request.user)
        if patient_id:
            summaries = summaries.filter(patient_id=patient_id)
        serializer = DischargeSummarySerializer(summaries, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DischargeSummaryCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        patient_id = request.data.get('patient')
        try:
            patient = Patient.objects.get(pk=patient_id, doctor=request.user)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Save summary first
        summary = serializer.save(doctor=request.user)

        # Generate AI narrative
        try:
            ai_narrative = generate_ai_narrative({
                'patient_name': patient.get_full_name(),
                'age': patient.get_age(),
                'gender': patient.gender,
                'diagnosis': summary.diagnosis,
                'chief_complaints': summary.chief_complaints,
                'hospital_course': summary.hospital_course,
                'treatment_given': summary.treatment_given,
                'procedures_performed': summary.procedures_performed,
                'condition_at_discharge': summary.condition_at_discharge,
                'stay_duration': summary.get_stay_duration(),
            })
            summary.ai_narrative = ai_narrative
            summary.save()
        except Exception as e:
            pass  # AI narrative is optional

        return Response(
            DischargeSummarySerializer(summary).data,
            status=status.HTTP_201_CREATED
        )


class DischargeSummaryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DischargeSummarySerializer

    def get_queryset(self):
        return DischargeSummary.objects.filter(doctor=self.request.user)


class GeneratePDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            summary = DischargeSummary.objects.get(
                pk=pk, doctor=request.user
            )
        except DischargeSummary.DoesNotExist:
            return Response(
                {'error': 'Discharge summary not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get doctor profile
        try:
            doctor_profile = request.user.doctor_profile
        except Exception:
            doctor_profile = None

        # Generate PDF
        pdf_buffer = generate_discharge_pdf(summary, doctor_profile)
        pdf_content = pdf_buffer.read()

        # Save PDF to model
        filename = f"discharge_{summary.patient.patient_id}_{summary.discharge_date}.pdf"
        summary.pdf_file.save(filename, ContentFile(pdf_content), save=True)

        # Return PDF response
        response = HttpResponse(pdf_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class RegenerateNarrativeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            summary = DischargeSummary.objects.get(
                pk=pk, doctor=request.user
            )
        except DischargeSummary.DoesNotExist:
            return Response(
                {'error': 'Discharge summary not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        patient = summary.patient
        ai_narrative = generate_ai_narrative({
            'patient_name': patient.get_full_name(),
            'age': patient.get_age(),
            'gender': patient.gender,
            'diagnosis': summary.diagnosis,
            'chief_complaints': summary.chief_complaints,
            'hospital_course': summary.hospital_course,
            'treatment_given': summary.treatment_given,
            'procedures_performed': summary.procedures_performed,
            'condition_at_discharge': summary.condition_at_discharge,
            'stay_duration': summary.get_stay_duration(),
        })
        summary.ai_narrative = ai_narrative
        summary.save()

        return Response({
            'message': 'Narrative regenerated successfully.',
            'ai_narrative': ai_narrative,
        })