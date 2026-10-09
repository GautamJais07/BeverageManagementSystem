from decimal import Decimal
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Purchase, PurchaseDetail
from .serializers import PurchaseSerializer, PurchaseCreateSerializer
from suppliers.models import Supplier
from beverages.models import Beverage
from inventory.models import Inventory
from accounts.permissions import IsAdmin, IsAdminOrManager


class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = (
        Purchase.objects
        .select_related("supplier", "created_by")
        .prefetch_related("details__beverage")
        .all()
        .order_by("-purchase_date")
    )
    serializer_class = PurchaseSerializer

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAdmin()]
        return [IsAdminOrManager()]

    def create(self, request, *args, **kwargs):
        serializer = PurchaseCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            supplier = get_object_or_404(
                Supplier, pk=serializer.validated_data["supplier"]
            )
            purchase = Purchase.objects.create(
                supplier=supplier, created_by=request.user, total_amount=0
            )
            total = Decimal("0.00")
            for item in serializer.validated_data["details"]:
                beverage = get_object_or_404(Beverage, pk=item["beverage"])
                quantity = int(item["quantity"])
                unit_price = Decimal(str(item["unit_price"]))
                subtotal = unit_price * quantity
                PurchaseDetail.objects.create(
                    purchase=purchase,
                    beverage=beverage,
                    quantity=quantity,
                    unit_price=unit_price,
                    subtotal=subtotal,
                )
                inventory, _ = Inventory.objects.get_or_create(
                    beverage=beverage
                )
                inventory.quantity_in_stock += quantity
                inventory.save()
                total += subtotal
            purchase.total_amount = total
            purchase.save(update_fields=["total_amount"])
        return Response(
            PurchaseSerializer(purchase).data,
            status=status.HTTP_201_CREATED
        )
