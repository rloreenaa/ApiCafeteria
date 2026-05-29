"""
Vistas de autenticación.
Incluye: obtener perfil, actualizar perfil, endpoint de info para Google OAuth.
"""
from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile
from .serializers import UserSerializer, UpdateProfileSerializer

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me(request):
    """Devuelve el perfil completo del usuario autenticado."""
    user = User.objects.select_related('profile').get(pk=request.user.pk)
    serializer = UserSerializer(user)
    return Response(serializer.data)

class UpdateProfileView(generics.UpdateAPIView):
    """Actualización de perfil del usuario autenticado."""
    serializer_class = UpdateProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def google_auth_callback(request):
    email = request.data.get('email')
    first_name = request.data.get('given_name', '')
    last_name = request.data.get('family_name', '')
    avatar = request.data.get('picture', '')

    if not email:
        return Response({'error': 'Email requerido'}, status=status.HTTP_400_BAD_REQUEST)

    user, created = User.objects.get_or_create(
        email=email,
        defaults={'username': email, 'first_name': first_name, 'last_name': last_name}
    )
    if not created:
        user.first_name = first_name
        user.last_name = last_name
        user.save()

    profile, _ = UserProfile.objects.get_or_create(user=user)
    if avatar and not profile.avatar_url:
        profile.avatar_url = avatar
        profile.save()

    # Recargar usuario con perfil actualizado
    user_fresh = User.objects.select_related('profile').get(pk=user.pk)
    refresh = RefreshToken.for_user(user_fresh)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user_fresh).data,
    })

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def demo_login(request):
    """Login de demostración sin Google OAuth. Solo para desarrollo."""
    role = request.data.get('role', 'student')

    # Validar que el rol sea válido
    if role not in ('student', 'admin'):
        return Response({'error': 'Rol inválido'}, status=status.HTTP_400_BAD_REQUEST)

    if role == 'admin':
        email = 'admin@cafeteria.com'
        first_name = 'Admin'
        last_name = 'Cafeteria'
    else:
        email = 'alumno@cafeteria.com'
        first_name = 'Alumno'
        last_name = 'Demo'

    user, _ = User.objects.get_or_create(
        email=email,
        defaults={'username': email, 'first_name': first_name, 'last_name': last_name}
    )
    user.first_name = first_name
    user.last_name = last_name
    user.save()

    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.role = role
    profile.save()

    # Recargar usuario desde BD para que el perfil esté actualizado en memoria
    user_fresh = User.objects.select_related('profile').get(pk=user.pk)

    refresh = RefreshToken.for_user(user_fresh)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user_fresh).data,
    })