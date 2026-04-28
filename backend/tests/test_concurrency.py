"""
Test concurrent overdraw prevention.
Uses TransactionTestCase (not TestCase) because we need real DB transactions
that can be seen across threads. TestCase wraps everything in one
transaction which makes concurrent testing impossible.
"""
import threading
from django.test import TransactionTestCase

from merchants.models import Merchant, BankAccount
from ledger.models import LedgerEntry
from payouts.models import Payout
from payouts.services import PayoutService, InsufficientBalanceError


class ConcurrencyTest(TransactionTestCase):

    def setUp(self):
        self.merchant = Merchant.objects.create(
            name='Test Merchant', email='test@example.com'
        )
        self.bank = BankAccount.objects.create(
            merchant=self.merchant,
            account_number='12345678901234',
            ifsc='HDFC0001234',
            bank_name='HDFC Bank',
            account_holder='Test Merchant'
        )
        # Seed exactly 100 rupees = 10000 paise
        LedgerEntry.objects.create(
            merchant=self.merchant,
            entry_type='CREDIT',
            amount_paise=10000,
            description='Seed credit'
        )

    def test_concurrent_overdraw_prevented(self):
        """
        Two simultaneous 60-rupee payout requests on a 100-rupee balance.
        Exactly one must succeed. The other must get INSUFFICIENT_BALANCE.
        Zero tolerance for both succeeding (that is a critical bug).
        """
        results = []
        errors = []

        def make_request(key_suffix):
            try:
                data, status_code = PayoutService.create_payout(
                    merchant_id=str(self.merchant.id),
                    amount_paise=6000,
                    bank_account_id=str(self.bank.id),
                    idempotency_key_str=f'test-key-{key_suffix}'
                )
                results.append((data, status_code))
            except InsufficientBalanceError as e:
                errors.append(e)
            except Exception as e:
                errors.append(e)

        t1 = threading.Thread(target=make_request, args=('a',))
        t2 = threading.Thread(target=make_request, args=('b',))
        t1.start()
        t2.start()
        t1.join()
        t2.join()

        total_payouts = Payout.objects.filter(merchant=self.merchant).count()

        # Assert exactly 1 payout created
        self.assertEqual(
            total_payouts, 1,
            f"Expected 1 payout, got {total_payouts}. "
            f"Race condition detected."
        )

        # Assert exactly 1 success and 1 failure
        self.assertEqual(len(results), 1)
        self.assertEqual(len(errors), 1)
