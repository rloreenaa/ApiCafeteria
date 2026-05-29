import stripe
import json
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.orders.models import Order
from apps.orders.serializers import OrderSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    order_id = request.data.get('order_id')
    if not order_id:
        return Response({'error': 'order_id requerido'}, status=400)
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({'error': 'Pedido no encontrado'}, status=404)

    if order.status != Order.Status.PENDING_PAYMENT:
        return Response({'error': 'Este pedido ya fue procesado'}, status=400)

    try:
        intent = stripe.PaymentIntent.create(
            amount=int(order.total_amount * 100),
            currency='eur',
            metadata={'order_id': str(order.id), 'user_email': request.user.email},
            automatic_payment_methods={'enabled': True},
        )
        order.stripe_payment_intent_id = intent.id
        order.save(update_fields=['stripe_payment_intent_id'])
        return Response({
            'client_secret': intent.client_secret,
            'publishable_key': settings.STRIPE_PUBLISHABLE_KEY,
        })
    except stripe.error.StripeError as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_local(request):
    """
    Confirma el pago localmente sin webhook.
    Solo para desarrollo en localhost.
    """
    order_id = request.data.get('order_id')
    try:
        order = Order.objects.get(id=order_id, user=request.user)
        order.status = Order.Status.PAID
        order.save(update_fields=['status'])
        try:
            order.generate_qr()
        except Exception:
            pass
        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data)
    except Order.DoesNotExist:
        return Response({'error': 'Pedido no encontrado'}, status=404)

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    try:
        event = json.loads(payload)
    except ValueError:
        return HttpResponse(status=400)

    if event.get('type') == 'payment_intent.succeeded':
        intent = event['data']['object']
        order_id = intent.get('metadata', {}).get('order_id')
        if order_id:
            try:
                order = Order.objects.get(id=order_id)
                order.status = Order.Status.PAID
                order.save(update_fields=['status'])
                order.generate_qr()
            except Order.DoesNotExist:
                pass
    return HttpResponse(status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({'error': 'Pedido no encontrado'}, status=404)
    serializer = OrderSerializer(order, context={'request': request})
    return Response(serializer.data)