from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from patients.models import Patient
from .models import DiseasePrediction
from .serializers import PredictionInputSerializer, DiseasePredictionSerializer
from .prediction_service import predict_disease


class PredictDiseaseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, patient_id):
        try:
            patient = Patient.objects.get(pk=patient_id, doctor=request.user)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = PredictionInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = predict_disease(serializer.validated_data)
        except Exception as e:
            return Response(
                {'error': f'Prediction failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Save prediction to DB
        prediction = DiseasePrediction.objects.create(
            patient=patient,
            doctor=request.user,
            predicted_disease=result['predicted_disease'],
            confidence_score=result['confidence_score'],
            shap_values=result.get('shap_values', {}),
            all_probabilities=result.get('top_5_diseases', {}),
            **{k: serializer.validated_data[k] for k in serializer.validated_data}
        )
        return Response({
            'prediction': DiseasePredictionSerializer(prediction).data,
            'top_features': result['top_features'],
            'all_probabilities': result.get('top_5_diseases', {}),
        }, status=status.HTTP_201_CREATED)


class PatientPredictionHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DiseasePredictionSerializer

    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        return DiseasePrediction.objects.filter(
            patient_id=patient_id,
            patient__doctor=self.request.user
        )


class PredictionStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        predictions = DiseasePrediction.objects.filter(doctor=request.user)
        disease_counts = {}
        for p in predictions:
            disease_counts[p.predicted_disease] = \
                disease_counts.get(p.predicted_disease, 0) + 1

        return Response({
            'total_predictions': predictions.count(),
            'disease_distribution': disease_counts,
        })