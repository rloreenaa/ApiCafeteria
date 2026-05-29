"""Vistas para el catálogo de productos."""
from django.db.models import Count, Q
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    """Permite lectura a todos los autenticados; escritura solo a admins."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return (
            request.user.is_authenticated
            and hasattr(request.user, 'profile')
            and request.user.profile.is_admin
        )

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Listado de categorías con conteo de productos."""
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.annotate(
            product_count=Count('products', filter=Q(products__is_available=True))
        )

class ProductViewSet(viewsets.ModelViewSet):
    """CRUD de productos. Escritura solo para administradores."""
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'name', 'created_at']

    def get_queryset(self):
        qs = Product.objects.select_related('category').prefetch_related('allergens')
        category = self.request.query_params.get('category')
        available = self.request.query_params.get('available')
        if category:
            qs = qs.filter(category__slug=category)
        if available is not None:
            qs = qs.filter(is_available=available.lower() == 'true')
        return qs

    @action(detail=True, methods=['patch'])
    def update_stock(self, request, pk=None):
        """Endpoint rápido para actualizar stock de un producto."""
        product = self.get_object()
        stock = request.data.get('stock')
        if stock is None:
            return Response({'error': 'stock requerido'}, status=400)
        product.stock = int(stock)
        product.save(update_fields=['stock'])
        return Response({'id': product.id, 'stock': product.stock})
