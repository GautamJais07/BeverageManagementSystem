from django.urls import path

from .views import (
    login_view,
    logout_view,
    change_password_view,
    admin_users_view,
    admin_delete_user_view,
)

urlpatterns = [

    path(
        "login/",
        login_view,
        name="login"
    ),

    path(
        "logout/",
        logout_view,
        name="logout"
    ),

    path(
        "change-password/",
        change_password_view,
        name="change-password"
    ),

    path(
        "users/",
        admin_users_view,
        name="admin-users"
    ),

    path(
        "users/<int:user_id>/",
        admin_delete_user_view,
        name="admin-delete-user"
    ),

]
