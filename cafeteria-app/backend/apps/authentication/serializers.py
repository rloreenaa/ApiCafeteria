"""Serializadores para autenticación y perfiles."""
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['role', 'avatar_url', 'phone', 'bio', 'preferred_pickup_time']

class UserSerializer(serializers.ModelSerializer):
    """Serializa usuario con su perfil anidado."""
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'profile']
        read_only_fields = ['id', 'username', 'email']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

class UpdateProfileSerializer(serializers.ModelSerializer):
    """Permite actualizar datos del perfil y nombre de usuario."""
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)

    class Meta:
        model = UserProfile
        fields = ['first_name', 'last_name', 'phone', 'bio', 'preferred_pickup_time', 'avatar_url']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
