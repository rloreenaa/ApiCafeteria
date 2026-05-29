"""Vistas para gestión de pedidos."""
from django.db import transaction
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.products.models import Product
from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer

class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and hasattr(request.user, 'profile')
            and request.user.profile.is_admin
        )

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        qs = Order.objects.prefetch_related('items').select_related('user')
        if hasattr(user, 'profile') and user.profile.is_admin:
            return qs
        return qs.filter(user=user)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Crea un pedido nuevo en estado 'pending_payment'."""
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        order = Order(
            user=request.user,
            total_amount=0,
            pickup_time=data.get('pickup_time'),
            notes=data.get('notes', ''),
        )
        order.save()

        total = 0
        for item_data in data['items']:
            product = Product.objects.get(id=item_data['product_id'])
            qty = int(item_data.get('quantity', 1))
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                product_price=product.price,
                quantity=qty,
            )
            total += product.price * qty

        order.total_amount = total
        order.save(update_fields=['total_amount'])

        out = OrderSerializer(order, context={'request': request})
        return Response(out.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Actualiza el estado de un pedido (solo admins)."""
        if not (hasattr(request.user, 'profile') and request.user.profile.is_admin):
            return Response({'error': 'Sin permisos'}, status=403)
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status not in Order.Status.values:
            return Response({'error': 'Estado inválido'}, status=400)
        order.status = new_status
        order.save(update_fields=['status'])
        out = OrderSerializer(order, context={'request': request})
        return Response(out.data)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Dashboard financiero para administradores."""
        if not (hasattr(request.user, 'profile') and request.user.profile.is_admin):
            return Response({'error': 'Sin permisos'}, status=403)
        from django.db.models import Sum, Count
        from django.utils import timezone
        import datetime

        today = timezone.now().date()
        month_start = today.replace(day=1)

        total_revenue = Order.objects.filter(
            status=Order.Status.PAID
        ).aggregate(total=Sum('total_amount'))['total'] or 0

        monthly_revenue = Order.objects.filter(
            status=Order.Status.PAID,
            created_at__date__gte=month_start
        ).aggregate(total=Sum('total_amount'))['total'] or 0

        daily_data = []
        for i in range(6, -1, -1):
            day = today - datetime.timedelta(days=i)
            rev = Order.objects.filter(
                status=Order.Status.PAID,
                created_at__date=day
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            daily_data.append({'date': str(day), 'revenue': float(rev)})

        orders_by_status = {
            s: Order.objects.filter(status=s).count()
            for s in Order.Status.values
        }

        return Response({
            'total_revenue': float(total_revenue),
            'monthly_revenue': float(monthly_revenue),
            'daily_data': daily_data,
            'orders_by_status': orders_by_status,
            'total_orders': Order.objects.count(),
        })
