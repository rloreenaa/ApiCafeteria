from django.urls import path
from . import views

urlpatterns = [
    path('create-intent/', views.create_payment_intent, name='create-payment-intent'),
    path('webhook/', views.stripe_webhook, name='stripe-webhook'),
    path('status/<uuid:order_id>/', views.payment_status, name='payment-status'),
]
