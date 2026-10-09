from django.contrib.auth.models import User
from rest_framework import serializers

from .models import AccountProfile


class RegisterSerializer(serializers.Serializer):

    full_name = serializers.CharField(
        max_length=150
    )

    username = serializers.CharField(
        max_length=150
    )

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    confirm_password = serializers.CharField(
        write_only=True
    )

    role = serializers.ChoiceField(
        choices=[
            ("STAFF", "Staff"),
            ("MANAGER", "Manager"),
        ]
    )

    def validate_username(self, value):

        value = value.strip()

        if User.objects.filter(
            username=value
        ).exists():

            raise serializers.ValidationError(
                "Username already exists."
            )

        return value

    def validate_password(self, value):

        import re

        if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-\[\]\\/;\'`~+=]', value):

            raise serializers.ValidationError(
                "Password must contain at least one special character "
                "(e.g. ! @ # $ %)."
            )
        return value

    def validate_email(self, value):

        value = value.strip()

        if User.objects.filter(
            email=value
        ).exists():

            raise serializers.ValidationError(
                "Email already exists."
            )

        return value

    def validate(self, data):

        password = data.get(
            "password"
        )

        confirm_password = data.get(
            "confirm_password"
        )

        if password != confirm_password:

            raise serializers.ValidationError({
                "confirm_password":
                    "Passwords do not match."
            })
        return data

    def create(self, validated_data):

        full_name = validated_data[
            "full_name"
        ]

        username = validated_data[
            "username"
        ]

        email = validated_data[
            "email"
        ]

        password = validated_data[
            "password"
        ]

        role = validated_data[
            "role"
        ]

        user = User.objects.create_user(

            username=username,

            email=email,

            password=password

        )

        name_parts = full_name.split(
            " ",
            1
        )

        user.first_name = name_parts[0]

        if len(name_parts) > 1:

            user.last_name = name_parts[1]

        else:

            user.last_name = ""

        user.save()

        AccountProfile.objects.create(
            user=user,
            role=role
        )

        return user
