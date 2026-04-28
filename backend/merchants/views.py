from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from .models import Merchant, BankAccount
from .serializers import (
    MerchantSerializer,
    BankAccountSerializer,
    BankAccountCreateSerializer,
)
from .services import LedgerService
from ledger.serializers import LedgerEntrySerializer


class MerchantListView(ListAPIView):
    """GET /api/v1/merchants/ — list merchants owned by the authenticated user."""
    serializer_class = MerchantSerializer
    pagination_class = None  # No pagination for merchant list

    def get_queryset(self):
        return Merchant.objects.filter(user=self.request.user)


class MerchantBalanceView(APIView):
    """GET /api/v1/merchants/<id>/balance/"""

    def get(self, request, merchant_id):
        try:
            Merchant.objects.get(pk=merchant_id, user=request.user)
        except Merchant.DoesNotExist:
            return Response(
                {'error': 'MERCHANT_NOT_FOUND'},
                status=status.HTTP_404_NOT_FOUND
            )

        balance = LedgerService.get_balance(merchant_id)
        return Response(balance)


class MerchantLedgerView(ListAPIView):
    """GET /api/v1/merchants/<id>/ledger/ — paginated ledger entries."""
    serializer_class = LedgerEntrySerializer

    def get_queryset(self):
        merchant_id = self.kwargs['merchant_id']
        # Verify ownership
        if not Merchant.objects.filter(pk=merchant_id, user=self.request.user).exists():
            return []
        return LedgerService.get_ledger_with_running_balance(merchant_id)


class BankAccountListCreateView(APIView):
    """
    GET  /api/v1/bank-accounts/?merchant_id=<uuid>
    POST /api/v1/bank-accounts/
    """

    def get(self, request):
        merchant_id = request.query_params.get('merchant_id')
        if not merchant_id:
            return Response(
                {'error': 'merchant_id query param is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Only allow access to user's own merchants
        if not Merchant.objects.filter(pk=merchant_id, user=request.user).exists():
            return Response(
                {'error': 'MERCHANT_NOT_FOUND'},
                status=status.HTTP_404_NOT_FOUND
            )
        accounts = BankAccount.objects.filter(merchant_id=merchant_id)
        serializer = BankAccountSerializer(accounts, many=True)
        return Response(serializer.data)

    def post(self, request):
        merchant_id = request.query_params.get('merchant_id')
        if not merchant_id:
            merchant_id = request.data.get('merchant_id')
        if not merchant_id:
            return Response(
                {'error': 'merchant_id is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            merchant = Merchant.objects.get(pk=merchant_id, user=request.user)
        except Merchant.DoesNotExist:
            return Response(
                {'error': 'MERCHANT_NOT_FOUND'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = BankAccountCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        bank_account = serializer.save(merchant=merchant)
        return Response(
            BankAccountSerializer(bank_account).data,
            status=status.HTTP_201_CREATED
        )


class BankAccountDeleteView(APIView):
    """DELETE /api/v1/bank-accounts/<id>/"""

    def delete(self, request, account_id):
        try:
            account = BankAccount.objects.get(pk=account_id)
        except BankAccount.DoesNotExist:
            return Response(
                {'error': 'BANK_ACCOUNT_NOT_FOUND'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Verify ownership through merchant
        if account.merchant.user != request.user:
            return Response(
                {'error': 'BANK_ACCOUNT_NOT_FOUND'},
                status=status.HTTP_404_NOT_FOUND
            )

        account.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
