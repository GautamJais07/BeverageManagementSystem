"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from django.views.static import serve
from django.conf import settings
from pathlib import Path
from django.urls import re_path

from accounts.views import change_password_view

FRONTEND_DIR = (
    Path(settings.BASE_DIR).parent /
    "frontend"
)


urlpatterns = [
    path(
        "admin/",
        admin.site.urls
    ),

    path(
        "api/auth/",
        include("accounts.urls")
    ),

    path(
        "api/",
        include("categories.urls")
    ),

    path(
        "api/",
        include("beverages.urls")
    ),

    path(
        "api/suppliers/",
        include("suppliers.urls")
    ),

    path(
        "api/",
        include("inventory.urls")
    ),

    path(
        "api/",
        include("purchases.urls")
    ),

    path(
        "api/",
        include("sales.urls")
    ),

    path(
        "api/reports/",
        include("reports.urls")
    ),

    path(
        "api/dashboard/",
        include("config.dashboard_urls")
    ),
    path(
        "change-password/",
        change_password_view,
        name="change-password"
    ),
    path(
        "",
        lambda request:
        redirect("/login.html")
    ),
    re_path(
        r"^(?P<path>.*)$",
        serve,
        {
            "document_root":
                FRONTEND_DIR
        }
    ),


]
