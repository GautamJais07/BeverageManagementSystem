from django.db import models
from django.conf import settings
from suppliers.models import Supplier
from beverages.models import Beverage


class Purchase(models.Model):

    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
        related_name='purchases'
    )

    purchase_date = models.DateTimeField(
        auto_now_add=True
    )

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='purchases_created'
    )

    def __str__(self):
        return f"Purchase #{self.id}"


class PurchaseDetail(models.Model):

    purchase = models.ForeignKey(
        Purchase,
        on_delete=models.CASCADE,
        related_name='details'
    )

    beverage = models.ForeignKey(
        Beverage,
        on_delete=models.PROTECT,
        related_name='purchase_details'
    )

    quantity = models.PositiveIntegerField()

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    def __str__(self):
        return f"{self.purchase_id} - {self.beverage.beverage_name}"
