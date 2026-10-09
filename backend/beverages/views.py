from django.db.models import Q
from django.db.models.deletion import ProtectedError
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Beverage
from .serializers import BeverageSerializer
from accounts.permissions import IsAdmin, IsAdminOrManager


class BeverageViewSet(viewsets.ModelViewSet):
    queryset = (
        Beverage.objects.select_related("category")
        .all()
        .order_by("beverage_name")
    )
    serializer_class = BeverageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get("search")
        category = self.request.query_params.get("category")
        if search:
            qs = qs.filter(
                Q(beverage_name__icontains=search)
                | Q(brand__icontains=search)
                | Q(category__category_name__icontains=search)
            )
        if category:
            qs = qs.filter(category_id=category)
        return qs

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAdmin()]
        if self.request.method in ("POST", "PUT", "PATCH"):
            return [IsAdminOrManager()]
        return [IsAuthenticated()]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
        except ProtectedError:
            return Response(
                {
                    "detail": (
                        f"Cannot delete '{instance.beverage_name}' because it "
                        "already has purchase or sale records linked to it. "
                        "Remove those records first, or keep this beverage "
                        "and just adjust its stock instead."
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)
