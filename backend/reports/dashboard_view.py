from django.db.models import Sum

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from beverages.models import Beverage
from categories.models import Category
from suppliers.models import Supplier
from purchases.models import Purchase
from sales.models import Sale
from inventory.models import Inventory


class DashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        total_beverages = Beverage.objects.count()
        total_categories = Category.objects.count()
        total_suppliers = Supplier.objects.count()
        total_purchases = Purchase.objects.count()
        total_sales = Sale.objects.count()

        current_inventory = (
            Inventory.objects.aggregate(
                total=Sum("quantity_in_stock")
            )["total"]
            or 0
        )

        low_stock = Inventory.objects.filter(status="LOW_STOCK").count()
        out_of_stock = Inventory.objects.filter(status="OUT_OF_STOCK").count()

        recent_sales_qs = (
            Sale.objects
            .order_by("-sale_date")[:5]
            .prefetch_related("details__beverage")
        )

        recent_sales = []
        for sale in recent_sales_qs:
            items = ", ".join(
                f"{d.beverage.beverage_name} (x{d.quantity})"
                for d in sale.details.all()
            )
            total_quantity = sum(d.quantity for d in sale.details.all())
            recent_sales.append({
                "id": sale.id,
                "sale_date": sale.sale_date,
                "total_amount": sale.total_amount,
                "payment_method": sale.payment_method,
                "items": items,
                "total_quantity": total_quantity,
            })

        recent_purchases_qs = (
            Purchase.objects
            .order_by("-purchase_date")[:5]
            .select_related("supplier")
            .prefetch_related("details__beverage")
        )

        recent_purchases = []
        for purchase in recent_purchases_qs:
            items = ", ".join(
                f"{d.beverage.beverage_name} (x{d.quantity})"
                for d in purchase.details.all()
            )
            total_quantity = sum(d.quantity for d in purchase.details.all())
            recent_purchases.append({
                "id": purchase.id,
                "purchase_date": purchase.purchase_date,
                "total_amount": purchase.total_amount,
                "supplier_name": purchase.supplier.supplier_name,
                "items": items,
                "total_quantity": total_quantity,
            })

        return Response({
            "total_beverages": total_beverages,
            "total_categories": total_categories,
            "total_suppliers": total_suppliers,
            "total_purchases": total_purchases,
            "total_sales": total_sales,
            "current_inventory": current_inventory,
            "low_stock": low_stock,
            "out_of_stock": out_of_stock,
            "recent_sales": recent_sales,
            "recent_purchases": recent_purchases,
        })
