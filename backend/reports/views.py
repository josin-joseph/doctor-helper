from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import LabReport, LabParameter
from .serializers import LabReportSerializer, LabReportCreateSerializer, LabParameterSerializer
from .lab_analyzer import analyze_parameters, generate_summary
from patients.models import Patient


class LabReportListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient_id = request.query_params.get('patient_id')
        reports = LabReport.objects.filter(doctor=request.user)
        if patient_id:
            reports = reports.filter(patient_id=patient_id)
        serializer = LabReportSerializer(reports, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = LabReportCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        try:
            patient = Patient.objects.get(
                pk=data['patient_id'], doctor=request.user
            )
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Analyze parameters
        analysis = analyze_parameters(data['parameters'])
        summary = generate_summary(analysis, data['report_type'])

        # Create report
        report = LabReport.objects.create(
            patient=patient,
            doctor=request.user,
            report_type=data['report_type'],
            report_date=data['report_date'],
            notes=data.get('notes', ''),
            ai_interpretation=summary,
            status='analyzed',
        )

        # Save each parameter
        for param_data in analysis['parameters']:
            LabParameter.objects.create(report=report, **param_data)

        return Response({
            'report': LabReportSerializer(report).data,
            'analysis_summary': analysis['summary'],
        }, status=status.HTTP_201_CREATED)


class LabReportDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LabReportSerializer

    def get_queryset(self):
        return LabReport.objects.filter(doctor=self.request.user)


class LabReportStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reports = LabReport.objects.filter(doctor=request.user)
        abnormal_reports = sum(
            1 for r in reports
            if r.parameters.exclude(status='normal').exists()
        )
        return Response({
            'total_reports': reports.count(),
            'abnormal_reports': abnormal_reports,
            'report_type_distribution': {
                rt: reports.filter(report_type=rt).count()
                for rt, _ in LabReport.REPORT_TYPES
            },
        })