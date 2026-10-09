
from django.contrib.auth.models import User
from django.db import models


class AccountProfile(models.Model):

    ROLE_CHOICES = [

        ("ADMIN", "Admin"),
        ("MANAGER", "Manager"),
        ("STAFF", "Staff"),

    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="STAFF"
    )

    def __str__(self):

        return f"{self.user.username} - {self.role}"
