from rest_framework.permissions import BasePermission


def get_user_role(user):
    if not user or not user.is_authenticated:
        return None

    profile = getattr(user, "profile", None)

    if not profile:
        return None

    return profile.role


def is_admin(user):

    return get_user_role(user) == "ADMIN"


def is_manager_or_admin(user):

    return get_user_role(user) in (
        "ADMIN",
        "MANAGER",
    )


class IsAdmin(BasePermission):

    def has_permission(self, request, view):

        return is_admin(request.user)


class IsAdminOrManager(BasePermission):

    def has_permission(self, request, view):

        return is_manager_or_admin(request.user)
