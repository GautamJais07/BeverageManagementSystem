from rest_framework import serializers
from .models import Inventory

class InventorySerializer(serializers.ModelSerializer):
    beverage_name = serializers.CharField(source="beverage.beverage_name", read_only=True)
    brand = serializers.CharField(source="beverage.brand", read_only=True)
    category_name = serializers.CharField(source="beverage.category.category_name", read_only=True)
    class Meta:
        model = Inventory
        fields = ["id","beverage","beverage_name","brand","category_name","quantity_in_stock","reorder_level","status"]
