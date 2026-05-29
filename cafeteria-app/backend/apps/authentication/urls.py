from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.me, name='user-me'),
    path('profile/update/', views.UpdateProfileView.as_view(), name='profile-update'),
    path('google/', views.google_auth_callback, name='google-auth'),
    path('demo-login/', views.demo_login, name='demo-login'),
]