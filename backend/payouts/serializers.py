from rest_framework import serializers
from .models import Payout, PayoutEvent
from merchants.serializers import BankAccountBriefSerializer


class PayoutEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayoutEvent
        fields = ['event', 'description', 'created_at']


class CreatePayoutSerializer(serializers.Serializer):
    amount_paise = serializers.IntegerField(min_value=100)  # minimum 1 rupee
    bank_account_id = serializers.UUIDField()


class PayoutSerializer(serializers.ModelSerializer):
    bank_account = BankAccountBriefSerializer(read_only=True)
    idempotency_key = serializers.SerializerMethodField()
    events = PayoutEventSerializer(many=True, read_only=True)

    class Meta:
        model = Payout
        fields = [
            'id', 'status', 'amount_paise', 'bank_account',
            'attempt_count', 'failure_reason',
            'created_at', 'updated_at', 'processing_at', 'completed_at',
            'idempotency_key', 'events'
        ]

    def get_idempotency_key(self, obj):
        if obj.idempotency_key:
            return obj.idempotency_key.key
        return None


class PayoutListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list view (no events)."""
    bank_account = BankAccountBriefSerializer(read_only=True)
    idempotency_key = serializers.SerializerMethodField()

    class Meta:
        model = Payout
        fields = [
            'id', 'status', 'amount_paise', 'bank_account',
            'attempt_count', 'failure_reason',
            'created_at', 'updated_at', 'processing_at', 'completed_at',
            'idempotency_key'
        ]

    def get_idempotency_key(self, obj):
        if obj.idempotency_key:
            return obj.idempotency_key.key
        return None
