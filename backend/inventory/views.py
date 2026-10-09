from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Inventory
from .serializers import InventorySerializer

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.select_related("beverage","beverage__category").all().order_by("beverage__beverage_name")
    serializer_class = InventorySerializer
    http_method_names = ["get","patch","head","options"]

    def get_queryset(self):
        qs = super().get_queryset()
        status_value = self.request.query_params.get("status")
        if status_value:
            qs = qs.filter(status=status_value)
        return qs
