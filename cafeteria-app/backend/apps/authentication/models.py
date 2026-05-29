"""
Modelos de autenticación y perfiles de usuario.
"""
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    """Perfil extendido de usuario con rol y preferencias."""

    class Role(models.TextChoices):
        STUDENT = 'student', 'Alumno'
        ADMIN = 'admin', 'Administrador'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)
    avatar_url = models.URLField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    preferred_pickup_time = models.TimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Perfil de Usuario'
        verbose_name_plural = 'Perfiles de Usuario'

    def __str__(self):
        return f'{self.user.get_full_name()} ({self.get_role_display()})'

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN
