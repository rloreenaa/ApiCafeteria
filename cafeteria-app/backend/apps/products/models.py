"""Modelos del catálogo de productos de la cafetería."""
from django.db import models

class Category(models.Model):
    """Categoría de producto (Bebidas, Bocadillos, Saludable, etc.)."""
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=50, blank=True, help_text='Emoji o nombre de icono')
    color = models.CharField(max_length=7, default='#4ade80', help_text='Color hex')
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

class Allergen(models.Model):
    """Alérgeno (gluten, lactosa, etc.)."""
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=10, blank=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    """Producto disponible en la cafetería."""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    allergens = models.ManyToManyField(Allergen, blank=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    image_url = models.URLField(blank=True, help_text='URL externa de imagen (alternativa)')
    stock = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    calories = models.PositiveSmallIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['-is_featured', 'name']

    def __str__(self):
        return f'{self.name} — {self.price}€'

    @property
    def display_image(self):
        if self.image:
            return self.image.url
        return self.image_url or ''
