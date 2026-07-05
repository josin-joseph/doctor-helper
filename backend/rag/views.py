from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import MedicalQuery
from .rag_engine import ask_medical_assistant, build_faiss_index
from patients.models import Patient
from rest_framework import serializers


class MedicalQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalQuery
        fields = '__all__'
        read_only_fields = ['doctor', 'created_at']


class AskMedicalAssistantView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        question = request.data.get('question', '').strip()
        patient_id = request.data.get('patient_id')

        if not question:
            return Response(
                {'error': 'Question is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Build patient context if patient_id provided
        patient_context = ''
        patient = None
        if patient_id:
            try:
                patient = Patient.objects.get(
                    pk=patient_id, doctor=request.user
                )
                patient_context = (
                    f"Patient: {patient.get_full_name()}, "
                    f"Age: {patient.get_age()}, "
                    f"Gender: {patient.gender}, "
                    f"Blood Group: {patient.blood_group}, "
                    f"Known Allergies: {patient.known_allergies or 'None'}, "
                    f"Chronic Conditions: {patient.chronic_conditions or 'None'}"
                )
            except Patient.DoesNotExist:
                pass

        # Run RAG pipeline
        result = ask_medical_assistant(question, patient_context)

        # Save to DB
        query = MedicalQuery.objects.create(
            doctor=request.user,
            patient=patient,
            question=question,
            answer=result['answer'],
            sources=result['sources'],
        )

        return Response({
            'query_id': query.id,
            'question': question,
            'answer': result['answer'],
            'sources': result['sources'],
        })


class QueryHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MedicalQuerySerializer

    def get_queryset(self):
        return MedicalQuery.objects.filter(doctor=self.request.user)


class BuildIndexView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            build_faiss_index()
            return Response({'message': 'FAISS index built successfully.'})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )