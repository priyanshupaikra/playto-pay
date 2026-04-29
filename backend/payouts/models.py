import uuid
from django.db import models


class IdempotencyKey(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    merchant = models.ForeignKey(
        'merchants.Merchant',
        on_delete=models.CASCADE
    )
    key = models.CharField(max_length=255)
    response_body = models.JSONField()
    response_status = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = 'idempotency_keys'
        unique_together = [('merchant', 'key')]
        # This UNIQUE constraint is the actual safety mechanism.
        # Do not rely on Python-level checks alone.

    def __str__(self):
        return f"{self.merchant_id}:{self.key}"


class Payout(models.Model):
    PENDING = 'pending'
    PROCESSING = 'processing'
    COMPLETED = 'completed'
    FAILED = 'failed'
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (PROCESSING, 'Processing'),
        (COMPLETED, 'Completed'),
        (FAILED, 'Failed'),
    ]

    # Legal transitions ONLY:
    # pending -> processing -> completed
    # pending -> processing -> failed
    # Everything else must be rejected.
    LEGAL_TRANSITIONS = {
        PENDING: [PROCESSING],
        PROCESSING: [COMPLETED, FAILED],
        COMPLETED: [],   # terminal
        FAILED: [],      # terminal
    }

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    merchant = models.ForeignKey(
        'merchants.Merchant',
        on_delete=models.CASCADE,
        related_name='payouts'
    )
    bank_account = models.ForeignKey(
        'merchants.BankAccount',
        on_delete=models.PROTECT
    )
    amount_paise = models.BigIntegerField()
    # NEVER FloatField. NEVER DecimalField.
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=PENDING
    )
    attempt_count = models.IntegerField(default=0)
    failure_reason = models.CharField(max_length=500, blank=True)
    idempotency_key = models.ForeignKey(
        IdempotencyKey,
        null=True,
        on_delete=models.SET_NULL
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processing_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payouts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['merchant', 'status'], name='idx_payout_merchant_status'),
            models.Index(fields=['merchant', '-created_at'], name='idx_payout_merchant_date'),
            models.Index(fields=['status', 'processing_at'], name='idx_payout_stale'),
        ]

    def __str__(self):
        return f"Payout {self.id} — {self.status} — {self.amount_paise} paise"

    def transition_to(self, new_status):
        """
        Enforce state machine. Raise ValueError on illegal transitions.
        This check runs in Python but the UPDATE query also uses
        WHERE status = current_status to prevent races.
        """
        if new_status not in self.LEGAL_TRANSITIONS.get(self.status, []):
            raise ValueError(
                f"Illegal transition: {self.status} -> {new_status}"
            )


class PayoutEvent(models.Model):
    """Audit log — append only, never updated."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    payout = models.ForeignKey(
        Payout,
        on_delete=models.CASCADE,
        related_name='events'
    )
    event = models.CharField(max_length=100)
    description = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payout_events'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.payout_id}: {self.event}"
