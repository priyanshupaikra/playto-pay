"""
Test idempotency key behavior.
"""
from django.test import TestCase

from merchants.models import Merchant, BankAccount
from ledger.models import LedgerEntry
from payouts.models import Payout
from payouts.services import PayoutService


class IdempotencyTest(TestCase):

    def setUp(self):
        self.merchant = Merchant.objects.create(
            name='Test Merchant', email='test2@example.com'
        )
        self.bank = BankAccount.objects.create(
            merchant=self.merchant,
            account_number='98765432101234',
            ifsc='ICIC0001234',
            bank_name='ICICI Bank',
            account_holder='Test Merchant'
        )
        LedgerEntry.objects.create(
            merchant=self.merchant,
            entry_type='CREDIT',
            amount_paise=50000,
            description='Seed credit'
        )

    def test_same_idempotency_key_returns_same_response(self):
        key = 'idem-test-key-abc123'

        r1, s1 = PayoutService.create_payout(
            merchant_id=str(self.merchant.id),
            amount_paise=5000,
            bank_account_id=str(self.bank.id),
            idempotency_key_str=key
        )
        r2, s2 = PayoutService.create_payout(
            merchant_id=str(self.merchant.id),
            amount_paise=5000,
            bank_account_id=str(self.bank.id),
            idempotency_key_str=key
        )

        # Only 1 payout row should exist
        count = Payout.objects.filter(merchant=self.merchant).count()
        self.assertEqual(count, 1, "Duplicate payout created on same key.")

        # Second call returns status 200, not 201
        self.assertEqual(s2, 200)

        # Both responses are identical
        self.assertEqual(r1['id'], r2['id'])
        self.assertEqual(r1['amount_paise'], r2['amount_paise'])

    def test_different_merchants_same_key_creates_separate_payouts(self):
        """Keys are scoped per merchant."""
        merchant2 = Merchant.objects.create(
            name='Other Merchant', email='other@example.com'
        )
        bank2 = BankAccount.objects.create(
            merchant=merchant2,
            account_number='11111111111111',
            ifsc='SBIN0001234',
            bank_name='SBI',
            account_holder='Other Merchant'
        )
        LedgerEntry.objects.create(
            merchant=merchant2,
            entry_type='CREDIT',
            amount_paise=50000,
            description='Seed credit'
        )

        shared_key = 'shared-key-across-merchants'

        r1, _ = PayoutService.create_payout(
            str(self.merchant.id), 5000, str(self.bank.id), shared_key
        )
        r2, _ = PayoutService.create_payout(
            str(merchant2.id), 5000, str(bank2.id), shared_key
        )

        # Should be two different payouts
        self.assertNotEqual(r1['id'], r2['id'])
        # Scope to only the merchants created in this test
        test_payout_count = Payout.objects.filter(
            merchant__in=[self.merchant, merchant2]
        ).count()
        self.assertEqual(test_payout_count, 2)
