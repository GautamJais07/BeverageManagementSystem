from django.utils import timezone
from django.db.models import Sum, Count

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from sales.models import SaleDetail
from purchases.models import PurchaseDetail
from inventory.models import Inventory


def _period_start(period, today):
    if period == "weekly":
        return today - timezone.timedelta(days=7)
    if period == "monthly":
        return today.replace(day=1)
    if period == "yearly":
        return today.replace(month=1, day=1)
    # daily (default)
    return today


class SalesReportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        period = request.GET.get("period", "daily")
        today = timezone.localdate()
        start_date = _period_start(period, today)

        queryset = SaleDetail.objects.select_related(
            "sale",
            "beverage",
            "beverage__category",
            "sale__created_by",
        ).filter(sale__sale_date__date__gte=start_date)

        summary = [{
            "period": period,
            "total": queryset.aggregate(total=Sum("subtotal"))["total"] or 0,
            "count": queryset.values("sale").distinct().count(),
        }]

        by_beverage = list(
            queryset.values("beverage__beverage_name")
            .annotate(quantity=Sum("quantity"), total=Sum("subtotal"))
            .order_by("-total")
        )

        by_category = list(
            queryset.values("beverage__category__category_name")
            .annotate(quantity=Sum("quantity"), total=Sum("subtotal"))
            .order_by("-total")
        )

        by_user = list(
            queryset.values("sale__created_by__username")
            .annotate(total=Sum("subtotal"), count=Count("sale", distinct=True)
                      )
            .order_by("-total")
        )
        # rename key to match frontend expectation: created_by__username
        for row in by_user:
            row["created_by__username"] = row.pop("sale__created_by__username")

        return Response({
            "summary": summary,
            "by_beverage": by_beverage,
            "by_category": by_category,
            "by_user": by_user,
        })


class PurchaseReportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # Get selected period from frontend
        period = request.GET.get("period", "daily")

        # Get today's date
        today = timezone.localdate()

        # Calculate start date according to period
        start_date = _period_start(
            period,
            today
        )

        # Get purchases within selected period
        queryset = PurchaseDetail.objects.select_related(
            "purchase",
            "purchase__supplier"
        ).filter(
            purchase__purchase_date__date__gte=start_date
        )

        # ==========================================
        # PURCHASE SUMMARY
        # ==========================================

        summary = [{
            "period": period,

            "total": queryset.aggregate(
                total=Sum("subtotal")
            )["total"] or 0,

            "count": queryset.values(
                "purchase"
            ).distinct().count(),
        }]

        # ==========================================
        # PURCHASE BY SUPPLIER
        # ==========================================

        by_supplier = list(

            queryset
            .values(
                "purchase__supplier__supplier_name"
            )
            .annotate(
                total=Sum("subtotal"),

                count=Count(
                    "purchase",
                    distinct=True
                ),
            )
            .order_by("-total")

        )

        # Rename field for frontend
        for row in by_supplier:

            row["supplier__supplier_name"] = row.pop(
                "purchase__supplier__supplier_name"
            )

        return Response({

            "summary": summary,

            "by_supplier": by_supplier,

        })


class StockReportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        queryset = Inventory.objects.select_related(
            "beverage", "beverage__category"
        ).values(
            "beverage__beverage_name",
            "beverage__brand",
            "beverage__category__category_name",
            "quantity_in_stock",
            "reorder_level",
            "status",
        )

        return Response({
            "stock": list(queryset),
        })
