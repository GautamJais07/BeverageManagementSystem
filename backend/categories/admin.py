from django.contrib import admin

from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'category_name',
        'description',
    )

    search_fields = (
        'category_name',
        'description',
    )
