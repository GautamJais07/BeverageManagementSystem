from django.urls import path

from .views import (
    CategoryListCreateView,
    CategoryDetailView,
)


urlpatterns = [

    # GET  /api/categories/
    # POST /api/categories/
    path(
        "categories/",
        CategoryListCreateView.as_view(),
        name="category-list-create",
    ),


    # GET    /api/categories/1/
    # PUT    /api/categories/1/
    # DELETE /api/categories/1/
    path(
        "categories/<int:pk>/",
        CategoryDetailView.as_view(),
        name="category-detail",
    ),

]
