"""Modelos de pedidos con generación de QR."""
import uuid
import qrcode
import io
from django.core.files.base import ContentFile
from django.db import models
from django.contrib.auth.models import User
from apps.products.models import Product

class Order(models.Model):
    """Pedido de un alumno."""

    class Status(models.TextChoices):
        PENDING_PAYMENT = 'pending_payment', 'Pendiente de Pago'
        PAID = 'paid', 'Pagado'
        PREPARING = 'preparing', 'En Preparación'
        READY = 'ready', 'Listo para Recoger'
        DELIVERED = 'delivered', 'Entregado'
        CANCELLED = 'cancelled', 'Cancelado'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING_PAYMENT)
    total_amount = models.DecimalField(max_digits=8, decimal_places=2)
    pickup_time = models.TimeField(null=True, blank=True)
    stripe_payment_intent_id = models.CharField(max_length=200, blank=True)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Pedido'
        verbose_name_plural = 'Pedidos'
        ordering = ['-created_at']

    def __str__(self):
        return f'Pedido {str(self.id)[:8]} — {self.user.email} — {self.get_status_display()}'

    def generate_qr(self):
        """Genera y guarda el código QR del pedido tras pago confirmado."""
        qr_data = (
            f'CAFETERIA-ORDER\n'
            f'ID: {self.id}\n'
            f'USUARIO: {self.user.email}\n'
            f'TOTAL: {self.total_amount}€\n'
            f'RECOGIDA: {self.pickup_time or "No especificada"}'
        )
        qr_img = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr_img.add_data(qr_data)
        qr_img.make(fit=True)
        img = qr_img.make_image(fill_color='#166534', back_color='white')
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        filename = f'qr_{str(self.id)}.png'
        self.qr_code.save(filename, ContentFile(buffer.read()), save=True)

class OrderItem(models.Model):
    """Línea de producto dentro de un pedido."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=200)
    product_price = models.DecimalField(max_digits=6, decimal_places=2)
    quantity = models.PositiveSmallIntegerField(default=1)

    @property
    def subtotal(self):
        return self.product_price * self.quantity

    def __str__(self):
        return f'{self.quantity}x {self.product_name}'
