from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import DoctorProfile
from .serializers import DoctorProfileSerializer, DoctorProfileUpdateSerializer


class DoctorProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = DoctorProfile.objects.get(user=request.user)
            serializer = DoctorProfileSerializer(profile)
            return Response(serializer.data)
        except DoctorProfile.DoesNotExist:
            return Response(
                {'error': 'Doctor profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

    def post(self, request):
        if DoctorProfile.objects.filter(user=request.user).exists():
            return Response(
                {'error': 'Profile already exists. Use PUT to update.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = DoctorProfileUpdateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        try:
            profile = DoctorProfile.objects.get(user=request.user)
        except DoctorProfile.DoesNotExist:
            return Response(
                {'error': 'Doctor profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = DoctorProfileUpdateSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(DoctorProfileSerializer(profile).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DoctorListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DoctorProfileSerializer
    queryset = DoctorProfile.objects.select_related('user').all()