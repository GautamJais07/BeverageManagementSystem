from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Category
from .serializers import CategorySerializer


class CategoryListCreateView(
    generics.ListCreateAPIView
):

    queryset = Category.objects.all().order_by("id")

    serializer_class = CategorySerializer

    permission_classes = [
        IsAuthenticated
    ]


class CategoryDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = Category.objects.all()

    serializer_class = CategorySerializer

    permission_classes = [
        IsAuthenticated
    ]
