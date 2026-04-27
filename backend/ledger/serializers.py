from rest_framework import serializers
from .models import LedgerEntry


class LedgerEntrySerializer(serializers.ModelSerializer):
    payout_id = serializers.UUIDField(read_only=True, allow_null=True)
    running_balance_paise = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = LedgerEntry
        fields = [
            'id', 'entry_type', 'amount_paise', 'description',
            'payout_id', 'created_at', 'running_balance_paise'
        ]
