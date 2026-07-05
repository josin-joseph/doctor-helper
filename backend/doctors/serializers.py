from rest_framework import serializers
from .models import DoctorProfile
from accounts.serializers import UserSerializer


class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = DoctorProfile
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_full_name(self, obj):
        return obj.user.get_full_name()


class DoctorProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        exclude = ['user', 'created_at', 'updated_at']