from django.contrib import admin
from .models import Category, Product, Allergen
admin.site.register([Category, Product, Allergen])
