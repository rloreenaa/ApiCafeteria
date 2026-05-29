"""Serializadores para productos y categorías."""
from rest_framework import serializers
from .models import Category, Product, Allergen

class AllergenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergen
        fields = ['id', 'name', 'icon']

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'color', 'product_count']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    allergens = AllergenSerializer(many=True, read_only=True)
    allergen_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Allergen.objects.all(), write_only=True, source='allergens'
    )
    display_image = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'category', 'category_name',
            'allergens', 'allergen_ids', 'display_image', 'stock', 'is_available',
            'is_featured', 'calories', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']
