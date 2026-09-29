from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import PaymentTransaction
from .serializers import PaymentTransactionSerializer, AdminPaymentTransactionSerializer
from .services import (
    create_pending_transaction, mark_transaction_success,
    build_payme_checkout_url, build_click_checkout_url,
)

class PaymentTransactionViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "head"]

    def get_queryset(self):
        return PaymentTransaction.objects.filter(user=self.request.user).select_related("plan")

    def create(self, request, *args, **kwargs):
        """POST /payments/transactions/  {plan: id, provider: 'payme'|'click'} -> checkout_url"""
        from django.conf import settings
        from apps.accounts.models import SubscriptionPlan
        try:
            plan = SubscriptionPlan.objects.get(id=request.data.get("plan"))
        except (SubscriptionPlan.DoesNotExist, ValueError, TypeError):
            return Response({"detail": "Ko'rsatilgan reja (plan) topilmadi. Avval SubscriptionPlan yaratilganini tekshiring."}, status=status.HTTP_400_BAD_REQUEST)
        provider = request.data["provider"]
        txn = create_pending_transaction(request.user, plan, provider)

        merchant_configured = (
            settings.PAYME_MERCHANT_ID if provider == "payme" else settings.CLICK_MERCHANT_ID
        )
        if not merchant_configured:
            # Haqiqiy Payme/Click merchant ID sozlanmagan — demo rejim: to'lovni darhol muvaffaqiyatli deb belgilaymiz.
            mark_transaction_success(txn, provider_transaction_id="mock-demo")
            return Response(
                {**PaymentTransactionSerializer(txn).data, "checkout_url": None, "mock": True},
                status=status.HTTP_201_CREATED,
            )

        checkout_url = build_payme_checkout_url(txn) if provider == "payme" else build_click_checkout_url(txn)
        return Response({**PaymentTransactionSerializer(txn).data, "checkout_url": checkout_url, "mock": False}, status=status.HTTP_201_CREATED)


class AdminPaymentTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /payments/admin/transactions/ — barcha foydalanuvchilar tranzaksiyalari (admin uchun)."""
    queryset = PaymentTransaction.objects.select_related("user", "plan").order_by("-created_at")
    serializer_class = AdminPaymentTransactionSerializer
    permission_classes = [permissions.IsAdminUser]
