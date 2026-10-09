from django.db import models
from categories.models import Category


class Beverage(models.Model):
    beverage_name = models.CharField(max_length=150)
    brand = models.CharField(max_length=100)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="beverages",
    )
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.beverage_name} - {self.brand}"
