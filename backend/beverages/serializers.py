from rest_framework import serializers
from .models import Beverage
from inventory.models import Inventory


class BeverageSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source='category.category_name',
        read_only=True
    )

    stock = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Beverage
        fields = [
            'id',
            'beverage_name',
            'brand',
            'category',
            'category_name',
            'unit_price',
            'stock',
            'status',
        ]

    def get_stock(self, obj):
        # A brand-new beverage may not have an Inventory row yet,
        # so guard against DoesNotExist instead of crashing.
        try:
            return obj.inventory.quantity_in_stock
        except Inventory.DoesNotExist:
            return 0

    def get_status(self, obj):
        try:
            return obj.inventory.status
        except Inventory.DoesNotExist:
            return "OUT_OF_STOCK"
