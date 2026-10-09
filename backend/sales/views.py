from decimal import Decimal

from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import (
    viewsets,
    status
)

from rest_framework.permissions import IsAuthenticated

from rest_framework.response import Response

from rest_framework.exceptions import ValidationError

from .models import (
    Sale,
    SaleDetail
)

from .serializers import (
    SaleSerializer,
    SaleCreateSerializer
)

from beverages.models import Beverage

from inventory.models import Inventory


class SaleViewSet(viewsets.ModelViewSet):

    queryset = (
        Sale.objects
        .select_related("created_by")
        .prefetch_related(
            "details__beverage"
        )
        .all()
        .order_by("-sale_date")
    )

    serializer_class = SaleSerializer

    permission_classes = [
        IsAuthenticated
    ]

    # =====================================================
    # CREATE SALE
    # =====================================================

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        # =================================================
        # VALIDATE REQUEST
        # =================================================

        serializer = SaleCreateSerializer(
                data=request.data
            )

        serializer.is_valid(
            raise_exception=True
        )

        validated_data = serializer.validated_data

        # =================================================
        # DATABASE TRANSACTION
        # =================================================

        with transaction.atomic():

            # =============================================
            # CREATE SALE
            # =============================================

            sale = Sale.objects.create(

                created_by=request.user,

                # IMPORTANT:
                # Save customer name here
                customer_name=validated_data[
                        "customer_name"
                    ],

                payment_method=validated_data[
                        "payment_method"
                    ],

                total_amount=Decimal(
                    "0.00"
                )
            )

            total = Decimal("0.00")

            # =============================================
            # PROCESS EACH BEVERAGE
            # =============================================

            for item in (
                validated_data[
                    "details"
                ]
            ):

                beverage = get_object_or_404(
                        Beverage,
                        pk=item[
                            "beverage"
                        ]
                    )

                quantity = int(
                        item[
                            "quantity"
                        ]
                    )

                # =========================================
                # GET INVENTORY
                # =========================================

                inventory = (
                    Inventory.objects
                    .select_for_update()
                    .filter(
                        beverage=beverage
                    )
                    .first()
                )

                # =========================================
                # CHECK STOCK
                # =========================================

                if not inventory:

                    raise ValidationError(
                        {
                            "stock":
                                (
                                    f"No inventory record "
                                    f"exists for "
                                    f"{beverage.beverage_name}."
                                )
                        }
                    )

                if (
                    inventory.quantity_in_stock
                    < quantity
                ):

                    raise ValidationError(
                        {
                            "stock":
                                (
                                    f"Insufficient stock "
                                    f"for "
                                    f"{beverage.beverage_name}. "
                                    f"Available: "
                                    f"{inventory.quantity_in_stock}"
                                )
                        }
                    )

                # =========================================
                # CALCULATE PRICE
                # =========================================

                custom_amount = item.get(
                        "amount"
                    )

                if custom_amount not in (
                    None,
                    ""
                ):

                    try:

                        subtotal = Decimal(
                                str(
                                    custom_amount
                                )
                            ).quantize(
                                Decimal(
                                    "0.01"
                                )
                            )

                    except Exception:

                        raise ValidationError(
                            {
                                "amount":
                                    "Invalid amount."
                            }
                        )

                    if subtotal <= 0:

                        raise ValidationError(
                            {
                                "amount":
                                    "Amount must be greater than zero."
                            }
                        )

                    unit_price = (
                        subtotal /
                        quantity
                    ).quantize(
                        Decimal(
                            "0.01"
                        )
                    )

                else:

                    unit_price = beverage.unit_price

                    subtotal = (
                        unit_price *
                        quantity
                    ).quantize(
                        Decimal(
                            "0.01"
                        )
                    )

                # =========================================
                # CREATE SALE DETAIL
                # =========================================

                SaleDetail.objects.create(

                    sale=sale,

                    beverage=beverage,

                    quantity=quantity,

                    unit_price=unit_price,

                    subtotal=subtotal

                )

                # =========================================
                # REDUCE INVENTORY
                # =========================================

                inventory.quantity_in_stock -= (
                    quantity
                )

                inventory.save()

                # =========================================
                # ADD TO TOTAL
                # =========================================

                total += subtotal

            # =============================================
            # UPDATE SALE TOTAL
            # =============================================

            sale.total_amount = total

            sale.save(
                update_fields=[
                    "total_amount"
                ]
            )

        # =================================================
        # RETURN CREATED SALE
        # =================================================

        return Response(

            SaleSerializer(
                sale
            ).data,

            status=status.HTTP_201_CREATED

        )
