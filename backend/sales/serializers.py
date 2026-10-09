from rest_framework import serializers
from .models import Sale, SaleDetail


class SaleDetailSerializer(serializers.ModelSerializer):

    beverage_name = serializers.CharField(
        source="beverage.beverage_name",
        read_only=True,
    )

    class Meta:

        model = SaleDetail

        fields = [
            "id",
            "beverage",
            "beverage_name",
            "quantity",
            "unit_price",
            "subtotal",
        ]


class SaleSerializer(serializers.ModelSerializer):

    details = SaleDetailSerializer(
        many=True,
        read_only=True
    )

    created_by_name = serializers.CharField(
        source="created_by.username",
        read_only=True
    )

    class Meta:

        model = Sale

        fields = [
            "id",
            "sale_date",

            # CUSTOMER
            "customer_name",

            "total_amount",
            "payment_method",

            "created_by",
            "created_by_name",

            "details",
        ]

        read_only_fields = [
            "created_by",
            "total_amount",
            "sale_date",
        ]


class SaleCreateSerializer(serializers.Serializer):

    # =====================================================
    # CUSTOMER NAME
    # =====================================================

    customer_name = serializers.CharField(
        max_length=150,
        required=True,
        allow_blank=False,
        trim_whitespace=True
    )

    payment_method = serializers.ChoiceField(
        choices=["CASH", "CARD", "ONLINE"]
    )

    details = serializers.ListField(
        child=serializers.DictField(),
        min_length=1
    )

    def validate_customer_name(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Customer name is required."
            )

        # Customer name should contain letters.
        # Spaces, dots and hyphens are allowed.

        if not all(
            char.isalpha() or char in " .-'"
            for char in value
        ):
            raise serializers.ValidationError(
                "Customer name can contain only letters, spaces, "
                "dots and hyphens."
            )

        return value

    def validate_details(self, details):

        for item in details:

            for key in ("beverage", "quantity"):

                if key not in item:

                    raise serializers.ValidationError(
                        f"Each detail needs {key}."
                    )

            if int(item["quantity"]) <= 0:

                raise serializers.ValidationError(
                    "Quantity must be greater than zero."
                )

            if "amount" in item and item["amount"] not in (
                None,
                ""
            ):

                try:

                    amount = float(
                        item["amount"]
                    )

                except (
                    TypeError,
                    ValueError
                ):

                    raise serializers.ValidationError(
                        "Amount must be a number."
                    )

                if amount <= 0:

                    raise serializers.ValidationError(
                        "Amount must be greater than zero."
                    )

        return details
