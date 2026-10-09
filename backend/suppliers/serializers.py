from rest_framework import serializers
from .models import Supplier


class SupplierSerializer(serializers.ModelSerializer):

    class Meta:
        model = Supplier

        fields = [
            "id",
            "supplier_name",
            "contact_person",
            "phone",
            "email",
            "address",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]
