from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView

from merchants.models import BankAccount
from .models import Payout
from .serializers import CreatePayoutSerializer, PayoutSerializer, PayoutListSerializer
from .services import PayoutService, InsufficientBalanceError


class PayoutListCreateView(APIView):
    """
    POST /api/v1/payouts/  — create payout (idempotency required)
    GET  /api/v1/payouts/  — list payouts for a merchant
    """

    def post(self, request):
        # Require Idempotency-Key header
        idempotency_key = request.headers.get('Idempotency-Key')
        if not idempotency_key:
            return Response(
                {
                    'error': 'MISSING_IDEMPOTENCY_KEY',
                    'message': 'Idempotency-Key header is required.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CreatePayoutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        merchant_id = request.query_params.get('merchant_id')
        if not merchant_id:
            return Response(
                {'error': 'merchant_id query param is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        amount_paise = serializer.validated_data['amount_paise']
        bank_account_id = serializer.validated_data['bank_account_id']

        try:
            response_data, status_code = PayoutService.create_payout(
                merchant_id=merchant_id,
                amount_paise=amount_paise,
                bank_account_id=bank_account_id,
                idempotency_key_str=idempotency_key
            )
            return Response(response_data, status=status_code)

        except InsufficientBalanceError as e:
            return Response(
                {
                    'error': 'INSUFFICIENT_BALANCE',
                    'message': str(e),
                    'available_paise': e.available,
                    'requested_paise': e.requested
                },
                status=status.HTTP_402_PAYMENT_REQUIRED
            )
        except BankAccount.DoesNotExist:
            return Response(
                {'error': 'BANK_ACCOUNT_NOT_FOUND'},
                status=status.HTTP_404_NOT_FOUND
            )

    def get(self, request):
        merchant_id = request.query_params.get('merchant_id')
        if not merchant_id:
            return Response(
                {'error': 'merchant_id query param is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        payouts = Payout.objects.filter(
            merchant_id=merchant_id
        ).select_related('bank_account', 'idempotency_key')

        serializer = PayoutListSerializer(payouts, many=True)
        return Response(serializer.data)


class PayoutDetailView(APIView):
    """GET /api/v1/payouts/<id>/ — get single payout with events."""

    def get(self, request, payout_id):
        try:
            payout = Payout.objects.select_related(
                'bank_account', 'idempotency_key'
            ).prefetch_related('events').get(pk=payout_id)
        except Payout.DoesNotExist:
            return Response(
                {'error': 'PAYOUT_NOT_FOUND'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = PayoutSerializer(payout)
        return Response(serializer.data)
