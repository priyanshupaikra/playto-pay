"""
PayoutService — the most important file in the system.
Handles payout creation with idempotency, concurrency-safe balance checks,
and state machine transitions with DB-level guards.
"""
from datetime import timedelta

from django.db import transaction
from django.db.models import Sum, Q
from django.db.models.functions import Coalesce
from django.utils import timezone

from merchants.models import Merchant, BankAccount
from ledger.models import LedgerEntry
from .models import IdempotencyKey, Payout, PayoutEvent
from .serializers import PayoutSerializer


# ─── Custom Exceptions ───────────────────────────────────────────────────────

class InsufficientBalanceError(Exception):
    def __init__(self, available, requested):
        self.available = available
        self.requested = requested
        available_formatted = f"₹{available / 100:,.2f}"
        requested_formatted = f"₹{requested / 100:,.2f}"
        super().__init__(
            f"Available balance is {available_formatted}. "
            f"Requested {requested_formatted}."
        )


class StalePayoutError(Exception):
    pass


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _event_description(new_status, failure_reason=''):
    descriptions = {
        'PROCESSING': 'Worker picked up payout.',
        'COMPLETED': 'Bank settlement successful.',
        'FAILED': f'Payout failed. {failure_reason}'.strip(),
    }
    return descriptions.get(new_status.upper(), f'Status changed to {new_status}.')


# ─── PayoutService ────────────────────────────────────────────────────────────

class PayoutService:

    @staticmethod
    def create_payout(merchant_id, amount_paise, bank_account_id,
                      idempotency_key_str):
        """
        Full flow with concurrency safety and idempotency.
        """
        # Avoid circular import — import task lazily
        from .tasks import process_payout_task

        # STEP 1: Idempotency check
        # Use get inside atomic to handle race on key creation.
        # If key exists and is not expired, return cached response immediately.
        # Do NOT proceed to balance check if key already exists.
        with transaction.atomic():
            try:
                idem_key = IdempotencyKey.objects.get(
                    merchant_id=merchant_id,
                    key=idempotency_key_str,
                    expires_at__gt=timezone.now()
                )
                # Key seen before — return cached response, status 200
                return idem_key.response_body, 200
            except IdempotencyKey.DoesNotExist:
                pass  # New key, continue below

        # STEP 2: Lock the merchant row to prevent concurrent overdraw.
        # SELECT FOR UPDATE acquires a row-level lock in PostgreSQL.
        # No other transaction can read-modify-write this merchant row
        # until this transaction commits. This is the ONLY correct way.
        with transaction.atomic():
            merchant = Merchant.objects.select_for_update().get(
                pk=merchant_id
            )

            # STEP 3: Calculate balance using DB aggregation.
            # Never fetch rows and sum in Python.
            # This query runs inside the locked transaction.
            balance = LedgerEntry.objects.filter(
                merchant=merchant
            ).aggregate(
                total_credits=Coalesce(
                    Sum('amount_paise', filter=Q(entry_type='CREDIT')), 0
                ),
                total_debits=Coalesce(
                    Sum('amount_paise', filter=Q(entry_type='DEBIT')), 0
                )
            )
            credits = balance['total_credits']
            debits = balance['total_debits']

            # Held balance = sum of all pending/processing payout amounts
            held = Payout.objects.filter(
                merchant=merchant,
                status__in=['pending', 'processing']
            ).aggregate(
                total=Coalesce(Sum('amount_paise'), 0)
            )['total']

            available = credits - debits - held

            # STEP 4: Check balance
            if available < amount_paise:
                raise InsufficientBalanceError(available, amount_paise)

            # STEP 5: Validate bank account belongs to this merchant
            bank_account = BankAccount.objects.get(
                pk=bank_account_id,
                merchant=merchant
            )

            # STEP 6: Create the payout row
            payout = Payout.objects.create(
                merchant=merchant,
                bank_account=bank_account,
                amount_paise=amount_paise,
                status=Payout.PENDING
            )

            # STEP 7: Create DEBIT ledger entry to hold funds
            LedgerEntry.objects.create(
                merchant=merchant,
                entry_type=LedgerEntry.DEBIT,
                amount_paise=amount_paise,
                description=f'Funds held for payout {payout.id}',
                payout=payout
            )

            # STEP 8: Create audit event
            PayoutEvent.objects.create(
                payout=payout,
                event='CREATED',
                description='Payout created. Funds held from available balance.'
            )

            # STEP 9: Build response and store in idempotency key table
            response_data = PayoutSerializer(payout).data

            idem_obj = IdempotencyKey.objects.create(
                merchant=merchant,
                key=idempotency_key_str,
                response_body=response_data,
                response_status=201,
                expires_at=timezone.now() + timedelta(hours=24)
            )

            # Link the idempotency key to the payout
            payout.idempotency_key = idem_obj
            payout.save(update_fields=['idempotency_key'])

            # Update response to include the idempotency key string
            response_data['idempotency_key'] = idempotency_key_str

            # STEP 10: Prepare payout ID for background worker dispatch
            # (dispatched AFTER transaction commits — see below)
            payout_id_for_task = str(payout.id)

        # Task dispatch happens OUTSIDE the atomic block.
        # If Redis is down, the payout is still created and committed.
        # The retry_stale_payouts beat task will pick it up later.
        try:
            process_payout_task.delay(payout_id_for_task)
        except Exception:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(
                f"Failed to dispatch task for payout {payout_id_for_task}. "
                f"Will be picked up by retry_stale_payouts."
            )

        return response_data, 201

    @staticmethod
    def transition_payout(payout_id, new_status, failure_reason=''):
        """
        Safe state transition with DB-level guard.
        For FAILED: atomically returns funds in the same transaction.
        """
        with transaction.atomic():
            # Lock the payout row itself
            payout = Payout.objects.select_for_update().get(pk=payout_id)

            # Python-level state machine check
            payout.transition_to(new_status)

            old_status = payout.status
            payout.attempt_count += 1

            if new_status == Payout.PROCESSING:
                payout.processing_at = timezone.now()

            if new_status == Payout.COMPLETED:
                payout.completed_at = timezone.now()

            if new_status == Payout.FAILED:
                payout.failure_reason = failure_reason
                payout.completed_at = timezone.now()

                # Atomically return held funds:
                # Create a CREDIT entry to reverse the DEBIT that held funds.
                # This must happen in the same transaction as the status change.
                LedgerEntry.objects.create(
                    merchant=payout.merchant,
                    entry_type=LedgerEntry.CREDIT,
                    amount_paise=payout.amount_paise,
                    description=f'Funds returned from failed payout {payout.id}',
                    payout=payout
                )

            # DB-level guard: UPDATE only if status is still old_status
            # If another worker already changed it, rows_updated = 0
            rows_updated = Payout.objects.filter(
                pk=payout_id,
                status=old_status  # guard clause
            ).update(
                status=new_status,
                attempt_count=payout.attempt_count,
                failure_reason=payout.failure_reason,
                processing_at=payout.processing_at,
                completed_at=payout.completed_at,
                updated_at=timezone.now()
            )

            if rows_updated == 0:
                raise StalePayoutError(
                    f"Payout {payout_id} was already transitioned by "
                    f"another worker. Expected status: {old_status}."
                )

            PayoutEvent.objects.create(
                payout=payout,
                event=new_status.upper(),
                description=_event_description(new_status, failure_reason)
            )

            return payout
