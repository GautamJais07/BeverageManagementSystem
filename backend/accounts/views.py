import json
import re

from .models import AccountProfile
from .permissions import IsAdmin

from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError

from rest_framework.decorators import (
    api_view,
    permission_classes
)

from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated
)

from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from rest_framework import status

from .models import AccountProfile


# =====================================================
# LOGIN
# =====================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):

    username = request.data.get(
        "username",
        ""
    ).strip()

    password = request.data.get(
        "password",
        ""
    )

    if not username or not password:

        return Response(

            {
                "detail":
                "Username and password are required."
            },

            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(

        username=username,

        password=password

    )

    if user is None:

        return Response(

            {
                "detail":
                "Invalid username or password."
            },

            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:

        return Response(

            {
                "detail":
                "This account is inactive."
            },

            status=status.HTTP_403_FORBIDDEN
        )

    # -----------------------------------------
    # Token
    # -----------------------------------------

    token, created = Token.objects.get_or_create(

        user=user

    )

    # -----------------------------------------
    # Role
    # -----------------------------------------

    profile = getattr(
        user,
        "profile",
        None
    )

    role = (
        profile.role
        if profile
        else "STAFF"
    )

    # -----------------------------------------
    # Full name
    # -----------------------------------------

    full_name = (
        f"{user.first_name} "
        f"{user.last_name}"
    ).strip()

    if not full_name:

        full_name = user.username

    return Response(

        {
            "message":
                "Login successful.",

            "token":
                token.key,

            "user": {

                "id":
                    user.id,

                "username":
                    user.username,

                "email":
                    user.email,

                "full_name":
                    full_name,

                "role":
                    role

            }
        },

        status=status.HTTP_200_OK
    )


# =====================================================
# CHANGE PASSWORD
# =====================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password_view(request):

    current_password = request.data.get(
        "current_password"
    )

    new_password = request.data.get(
        "new_password"
    )

    confirm_password = request.data.get(
        "confirm_password"
    )

    if not current_password:

        return Response(
            {
                "detail":
                "Current password is required."
            },
            status=400
        )

    if not new_password:

        return Response(
            {
                "detail":
                "New password is required."
            },
            status=400
        )

    if new_password != confirm_password:

        return Response(
            {
                "detail":
                "New passwords do not match."
            },
            status=400
        )

    if len(new_password) < 8:

        return Response(
            {
                "detail":
                "New password must contain at least 8 characters."
            },
            status=400
        )

    if not check_password(
        current_password,
        request.user.password
    ):

        return Response(
            {
                "detail":
                "Current password is incorrect."
            },
            status=400
        )

    request.user.set_password(
        new_password
    )

    request.user.save()

    # Generate new token

    Token.objects.filter(
        user=request.user
    ).delete()

    token = Token.objects.create(
        user=request.user
    )

    return Response(

        {
            "message":
                "Password changed successfully.",

            "token":
                token.key
        },

        status=status.HTTP_200_OK
    )

# =====================================================
# ADMIN USER MANAGEMENT
# =====================================================


@api_view(["GET", "POST"])
@permission_classes([IsAdmin])
def admin_users_view(request):

    # -------------------------------------------------
    # GET = LIST USERS
    # -------------------------------------------------

    if request.method == "GET":

        users = User.objects.select_related("profile").all()

        user_list = []

        for user in users:

            profile = getattr(
                user,
                "profile",
                None
            )

            role = (
                profile.role
                if profile
                else "STAFF"
            )

            full_name = (
                f"{user.first_name} "
                f"{user.last_name}"
            ).strip()

            if not full_name:
                full_name = user.username

            user_list.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": full_name,
                "role": role,
                "is_active": user.is_active,
            })

        return Response(
            {
                "users": user_list
            },
            status=status.HTTP_200_OK
        )

    # -------------------------------------------------
    # POST = CREATE STAFF/MANAGER
    # -------------------------------------------------

    data = request.data

    full_name = str(
        data.get("full_name", "")
    ).strip()

    username = str(
        data.get("username", "")
    ).strip()

    email = str(
        data.get("email", "")
    ).strip()

    password = data.get(
        "password",
        ""
    )

    confirm_password = data.get(
        "confirm_password",
        ""
    )

    role = str(
        data.get("role", "")
    ).upper().strip()

    # -------------------------------------------------
    # VALIDATION
    # -------------------------------------------------

    if not full_name:
        return Response(
            {
                "detail":
                "Full name is required."
            },
            status=400
        )

    if not re.fullmatch(
        r"[A-Za-z]+(?:\s+[A-Za-z]+)*",
        full_name
    ):
        return Response(
            {
                "detail":
                "Full name must contain letters and spaces only."
            },
            status=400
        )

    if not username:
        return Response(
            {
                "detail":
                "Username is required."
            },
            status=400
        )

    if (
        not re.fullmatch(
            r"[A-Za-z0-9]+",
            username
        )
        or not re.search(
            r"[A-Za-z]",
            username
        )
        or not re.search(
            r"[0-9]",
            username
        )
    ):
        return Response(
            {
                "detail":
                "Username must contain both letters and numbers."
            },
            status=400
        )

    # -------------------------------------------------
    # EMAIL VALIDATION
    # -------------------------------------------------

    if not email:

        return Response(
            {
                "detail":
                "Email is required."
            },
            status=400
        )

    email_pattern = (
        r"^[A-Za-z0-9._%+-]+@"
        r"[A-Za-z0-9.-]+\."
        r"[A-Za-z]{2,}$"
    )

    if not re.fullmatch(
        email_pattern,
        email
    ):

        return Response(
            {
                "detail":
                "Please enter a valid email address."
            },
            status=400
        )

    # -------------------------------------------------
    # PASSWORD VALIDATION
    # -------------------------------------------------

    if not password:
        return Response(
            {
                "detail":
                "Password is required."
            },
            status=400
        )

    # Minimum 8 characters
    if len(password) < 8:
        return Response(
            {
                "detail":
                "Password must contain at least 8 characters."
            },
            status=400
        )

    # At least one uppercase letter
    if not re.search(
        r"[A-Z]",
        password
    ):
        return Response(
            {
                "detail":
                "Password must contain at least one uppercase letter."
            },
            status=400
        )

    # At least one lowercase letter
    if not re.search(
        r"[a-z]",
        password
    ):
        return Response(
            {
                "detail":
                "Password must contain at least one lowercase letter."
            },
            status=400
        )

    # At least one number
    if not re.search(
        r"[0-9]",
        password
    ):
        return Response(
            {
                "detail":
                "Password must contain at least one number."
            },
            status=400
        )

    # At least one special character
    if not re.search(
        r"[^A-Za-z0-9]",
        password
    ):
        return Response(
            {
                "detail":
                "Password must contain at least one special character."
            },
            status=400
        )

    # Confirm password
    if password != confirm_password:
        return Response(
            {
                "detail":
                "Passwords do not match."
            },
            status=400
        )

    # IMPORTANT:
    # ADMIN is deliberately NOT allowed here.
    if role not in [
        "STAFF",
        "MANAGER"
    ]:
        return Response(
            {
                "detail":
                "Admin can create only Staff or Manager accounts."
            },
            status=400
        )

    if User.objects.filter(
        username=username
    ).exists():
        return Response(
            {
                "detail":
                "Username already exists."
            },
            status=400
        )

    if User.objects.filter(
        email=email
    ).exists():
        return Response(
            {
                "detail":
                "Email already exists."
            },
            status=400
        )

    # -------------------------------------------------
    # CREATE USER
    # -------------------------------------------------

    name_parts = full_name.split(
        " ",
        1
    )

    first_name = name_parts[0]

    last_name = (
        name_parts[1]
        if len(name_parts) > 1
        else ""
    )

    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        AccountProfile.objects.create(
            user=user,
            role=role
        )

    except IntegrityError:
        return Response(
            {
                "detail":
                "Username or email already exists."
            },
            status=400
        )

    return Response(
        {
            "success": True,
            "message": f"{role} account created successfully.",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": full_name,
                "role": role,
            },
        },
        status=status.HTTP_201_CREATED,
    )


# =====================================================
# ADMIN DELETE USER
# =====================================================


@api_view(["DELETE"])
@permission_classes([IsAdmin])
def admin_delete_user_view(
    request,
    user_id
):

    try:

        user = User.objects.get(
            id=user_id
        )

    except User.DoesNotExist:

        return Response(
            {
                "detail":
                "User not found."
            },
            status=404
        )

    # -------------------------------------------------
    # NEVER DELETE AN ADMIN FROM THIS PAGE
    # -------------------------------------------------

    profile = getattr(
        user,
        "profile",
        None
    )

    if profile and profile.role == "ADMIN":

        return Response(
            {
                "detail":
                "Admin accounts cannot be deleted here."
            },
            status=400
        )

    # -------------------------------------------------
    # DO NOT ALLOW ADMIN TO DELETE HIMSELF
    # -------------------------------------------------

    if user.id == request.user.id:

        return Response(
            {
                "detail":
                "You cannot delete your own account."
            },
            status=400
        )

    username = user.username

    user.delete()

    return Response(
        {
            "success": True,
            "message":
                f"User '{username}' deleted successfully."
        },
        status=status.HTTP_200_OK
    )

# =====================================================
# LOGOUT
# =====================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):

    Token.objects.filter(
        user=request.user
    ).delete()

    return Response(

        {
            "message":
            "Logout successful."
        },

        status=status.HTTP_200_OK
    )
