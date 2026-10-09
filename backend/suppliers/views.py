from rest_framework import viewsets
from accounts.permissions import IsAdmin, IsAdminOrManager
from .models import Supplier
from .serializers import SupplierSerializer


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all().order_by("supplier_name")
    serializer_class = SupplierSerializer

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAdmin()]
        return [IsAdminOrManager()]
