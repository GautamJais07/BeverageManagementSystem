from django.urls import path

from .views import (
    SalesReportView,
    PurchaseReportView,
    StockReportView,
)


urlpatterns = [

    path(
        "sales/",
        SalesReportView.as_view(),
        name="sales-report"
    ),

    path(
        "purchases/",
        PurchaseReportView.as_view(),
        name="purchase-report"
    ),

    path(
        "stock/",
        StockReportView.as_view(),
        name="stock-report"
    ),

]