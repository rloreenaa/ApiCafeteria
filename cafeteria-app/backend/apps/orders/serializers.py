"""Serializadores para pedidos y líneas de pedido."""
from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_price', 'quantity', 'subtotal']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    qr_code_url = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user_email', 'user_name', 'status', 'status_display',
            'total_amount', 'pickup_time', 'items', 'qr_code_url', 'notes',
            'created_at', 'stripe_payment_intent_id',
        ]
        read_only_fields = ['id', 'created_at', 'stripe_payment_intent_id', 'qr_code_url']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.email

    def get_qr_code_url(self, obj):
        request = self.context.get('request')
        if obj.qr_code and request:
            return request.build_absolute_uri(obj.qr_code.url)
        return None

class CreateOrderSerializer(serializers.Serializer):
    """Valida los datos para crear un nuevo pedido."""
    items = serializers.ListField(
        child=serializers.DictField(), min_length=1
    )
    pickup_time = serializers.TimeField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True)
