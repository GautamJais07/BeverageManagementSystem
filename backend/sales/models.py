from django.db import models
from django.conf import settings
from beverages.models import Beverage


class Sale(models.Model):

    PAYMENT_CHOICES = (
        ('CASH', 'Cash'),
        ('CARD', 'Card'),
        ('ONLINE', 'Online'),
    )

    sale_date = models.DateTimeField(
        auto_now_add=True
    )

    # =====================================================
    # CUSTOMER NAME
    # =====================================================

    customer_name = models.CharField(
        max_length=150,
        default="Walk-in Customer"
    )

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_CHOICES
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='sales_created'
    )

    def __str__(self):
        return f"Sale #{self.id} - {self.customer_name}"


class SaleDetail(models.Model):

    sale = models.ForeignKey(
        Sale,
        on_delete=models.CASCADE,
        related_name='details'
    )

    beverage = models.ForeignKey(
        Beverage,
        on_delete=models.PROTECT,
        related_name='sale_details'
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
        return f"{self.sale_id} - {self.beverage.beverage_name}"
