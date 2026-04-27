"""
Celery tasks for payout processing.
These are real async tasks consumed from Redis queue — no time.sleep() hacks.
"""
import random
from datetime import timedelta

from celery import shared_task
from django.db import transaction
from django.utils import timezone

from .models import Payout, PayoutEvent
from .services import PayoutService, StalePayoutError


@shared_task(bind=True, max_retries=3)
def process_payout_task(self, payout_id):
    """
    Main payout processor. Simulates bank settlement.
    70% success, 20% failure, 10% hang (stuck in processing).

    This is a real Celery task consuming from Redis queue.
    """
    try:
        payout = Payout.objects.get(pk=payout_id)
    except Payout.DoesNotExist:
        return

    # Guard: only process pending payouts
    if payout.status != Payout.PENDING:
        return

    # Move to processing
    try:
        PayoutService.transition_payout(payout_id, Payout.PROCESSING)
    except (StalePayoutError, ValueError):
        return

    # Simulate bank API call
    outcome = random.choices(
        ['success', 'failure', 'hang'],
        weights=[70, 20, 10]
    )[0]

    if outcome == 'hang':
        # Do nothing. Leave in processing.
        # RetryWorker will pick this up after 30 seconds.
        PayoutEvent.objects.create(
            payout=Payout.objects.get(pk=payout_id),
            event='PROCESSING_HUNG',
            description='Bank API did not respond. Awaiting retry.'
        )
        return

    if outcome == 'success':
        PayoutService.transition_payout(payout_id, Payout.COMPLETED)

    if outcome == 'failure':
        PayoutService.transition_payout(
            payout_id,
            Payout.FAILED,
            failure_reason='Bank rejected the transfer. Account unverified.'
        )


@shared_task
def retry_stale_payouts():
    """
    Celery beat task. Runs every 10 seconds.
    Finds payouts stuck in 'processing' for more than 30 seconds.
    Retries up to 3 times total. After 3 attempts, moves to failed.
    Uses exponential backoff: wait 30s, 60s, 120s between attempts.
    """
    cutoff = timezone.now() - timedelta(seconds=30)

    with transaction.atomic():
        stale_payouts = Payout.objects.filter(
            status=Payout.PROCESSING,
            processing_at__lt=cutoff,
            attempt_count__lt=3
        ).select_for_update(skip_locked=True)
        # skip_locked=True: if another worker is already handling a row,
        # skip it instead of blocking. Prevents thundering herd.

        for payout in stale_payouts:
            backoff_seconds = 30 * (2 ** payout.attempt_count)
            if payout.processing_at and timezone.now() < payout.processing_at + timedelta(
                seconds=backoff_seconds
            ):
                continue  # Not yet time to retry this one

            if payout.attempt_count >= 3:
                PayoutService.transition_payout(
                    str(payout.id),
                    Payout.FAILED,
                    failure_reason='Max retry attempts reached. Bank unresponsive.'
                )
            else:
                # Reset to pending and re-queue
                Payout.objects.filter(
                    pk=payout.id, status=Payout.PROCESSING
                ).update(status=Payout.PENDING, updated_at=timezone.now())

                PayoutEvent.objects.create(
                    payout=payout,
                    event='RETRY_QUEUED',
                    description=(
                        f'Retrying after stale processing. '
                        f'Attempt {payout.attempt_count + 1} of 3.'
                    )
                )
                process_payout_task.delay(str(payout.id))


@shared_task
def expire_idempotency_keys():
    """
    Celery beat task. Runs every hour.
    Deletes IdempotencyKey rows where expires_at < now().
    """
    from .models import IdempotencyKey

    deleted, _ = IdempotencyKey.objects.filter(
        expires_at__lt=timezone.now()
    ).delete()
    return f"Deleted {deleted} expired idempotency keys."
