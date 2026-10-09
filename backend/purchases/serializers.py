from rest_framework import serializers
from .models import Purchase, PurchaseDetail


class PurchaseDetailSerializer(serializers.ModelSerializer):
    beverage_name = serializers.CharField(
        source="beverage.beverage_name", read_only=True
    )

    class Meta:
        model = PurchaseDetail
        fields = [
            "id", "beverage", "beverage_name", "quantity",
            "unit_price", "subtotal"
        ]


class PurchaseSerializer(serializers.ModelSerializer):
    details = PurchaseDetailSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(
        source="supplier.supplier_name", read_only=True
    )
    created_by_name = serializers.CharField(
        source="created_by.username", read_only=True
    )

    class Meta:
        model = Purchase
        fields = [
            "id", "supplier", "supplier_name", "purchase_date",
            "total_amount", "created_by", "created_by_name", "details"
        ]
        read_only_fields = ["created_by", "total_amount", "purchase_date"]


class PurchaseCreateSerializer(serializers.Serializer):
    supplier = serializers.IntegerField()
    details = serializers.ListField(
        child=serializers.DictField(), min_length=1
    )

    def validate_details(self, details):
        for item in details:
            for key in ("beverage", "quantity", "unit_price"):
                if key not in item:
                    raise serializers.ValidationError(
                        f"Each detail needs {key}."
                    )
            if int(item["quantity"]) <= 0:
                raise serializers.ValidationError(
                    "Quantity must be greater than zero."
                )
            if float(item["unit_price"]) < 0:
                raise serializers.ValidationError(
                    "Unit price cannot be negative."
                )
        return details
