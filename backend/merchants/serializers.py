from rest_framework import serializers
from .models import Merchant, BankAccount


class MerchantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Merchant
        fields = ['id', 'name', 'email', 'created_at']


class BankAccountSerializer(serializers.ModelSerializer):
    last4 = serializers.CharField(read_only=True)
    masked_number = serializers.CharField(read_only=True)

    class Meta:
        model = BankAccount
        fields = [
            'id', 'merchant', 'account_number', 'ifsc',
            'bank_name', 'account_holder', 'is_primary',
            'last4', 'masked_number', 'created_at'
        ]
        extra_kwargs = {
            'account_number': {'write_only': True},
        }


class BankAccountCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = [
            'account_number', 'ifsc', 'bank_name',
            'account_holder', 'is_primary'
        ]


class BankAccountBriefSerializer(serializers.ModelSerializer):
    """Used for nested display in payout responses."""
    last4 = serializers.CharField(read_only=True)

    class Meta:
        model = BankAccount
        fields = ['id', 'last4', 'ifsc', 'bank_name']
