from django.urls import path
from reports.dashboard_view import DashboardView

urlpatterns = [
    path("", DashboardView.as_view(), name="dashboard"),
]
