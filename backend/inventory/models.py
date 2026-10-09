from django.db import models
from beverages.models import Beverage

class Inventory(models.Model):
    STATUS_CHOICES = (
        ("IN_STOCK", "In Stock"),
        ("LOW_STOCK", "Low Stock"),
        ("OUT_OF_STOCK", "Out of Stock"),
    )
    beverage = models.OneToOneField(Beverage, on_delete=models.CASCADE, related_name="inventory")
    quantity_in_stock = models.PositiveIntegerField(default=0)
    reorder_level = models.PositiveIntegerField(default=10)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="OUT_OF_STOCK")

    def update_status(self):
        if self.quantity_in_stock == 0:
            self.status = "OUT_OF_STOCK"
        elif self.quantity_in_stock <= self.reorder_level:
            self.status = "LOW_STOCK"
        else:
            self.status = "IN_STOCK"

    def save(self, *args, **kwargs):
        self.update_status()
        super().save(*args, **kwargs)
