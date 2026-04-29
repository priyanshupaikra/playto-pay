import uuid
from django.db import models


class LedgerEntry(models.Model):
    CREDIT = 'CREDIT'
    DEBIT = 'DEBIT'
    ENTRY_TYPES = [(CREDIT, 'Credit'), (DEBIT, 'Debit')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    merchant = models.ForeignKey(
        'merchants.Merchant',
        on_delete=models.CASCADE,
        related_name='ledger_entries'
    )
    entry_type = models.CharField(max_length=6, choices=ENTRY_TYPES)
    amount_paise = models.BigIntegerField()
    # NEVER FloatField. NEVER DecimalField. Always BigIntegerField.
    description = models.CharField(max_length=500, blank=True)
    payout = models.ForeignKey(
        'payouts.Payout',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='ledger_entries'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ledger_entries'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['merchant', 'entry_type'], name='idx_ledger_merchant_type'),
            models.Index(fields=['merchant', '-created_at'], name='idx_ledger_merchant_date'),
        ]

    def __str__(self):
        return f"{self.entry_type} {self.amount_paise} paise — {self.merchant}"
