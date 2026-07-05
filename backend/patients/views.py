from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Patient
from .serializers import PatientSerializer, PatientListSerializer
from emr.models import Encounter, VitalSigns
from emr.serializers import EncounterSerializer, VitalSignsSerializer


class PatientPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class PatientListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = PatientPagination

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PatientListSerializer
        return PatientSerializer

    def get_queryset(self):
        queryset = Patient.objects.filter(doctor=self.request.user)
        search        = self.request.query_params.get('search', '')
        status_filter = self.request.query_params.get('status', '')
        gender_filter = self.request.query_params.get('gender', '')

        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)  |
                Q(patient_id__icontains=search) |
                Q(phone__icontains=search)
            )
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if gender_filter:
            queryset = queryset.filter(gender=gender_filter)

        return queryset

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user)


class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PatientSerializer

    def get_queryset(self):
        return Patient.objects.filter(doctor=self.request.user)


class PatientTimelineView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            patient = Patient.objects.get(pk=pk, doctor=request.user)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        encounters = Encounter.objects.filter(patient=patient).order_by('-encounter_date')
        vitals     = VitalSigns.objects.filter(patient=patient).order_by('-recorded_at')[:10]
        return Response({
            'patient':    PatientSerializer(patient).data,
            'encounters': EncounterSerializer(encounters, many=True).data,
            'vitals':     VitalSignsSerializer(vitals, many=True).data,
        })


class PatientStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patients = Patient.objects.filter(doctor=request.user)
        return Response({
            'total':      patients.count(),
            'active':     patients.filter(status='active').count(),
            'discharged': patients.filter(status='discharged').count(),
            'critical':   patients.filter(status='critical').count(),
            'male':       patients.filter(gender='male').count(),
            'female':     patients.filter(gender='female').count(),
        })