from django.db.models import Sum, Q, F, Case, When, BigIntegerField, Window
from django.db.models.functions import Coalesce

from ledger.models import LedgerEntry
from payouts.models import Payout


def format_paise(paise):
    """Convert paise integer to formatted rupee string like ₹4,320.00"""
    rupees = paise / 100
    # Use Indian-style formatting
    if rupees < 0:
        sign = '-'
        rupees = abs(rupees)
    else:
        sign = ''

    rupee_str = f"{rupees:,.2f}"
    return f"{sign}₹{rupee_str}"


class LedgerService:

    @staticmethod
    def get_balance(merchant_id):
        """
        Balance is ALWAYS derived from DB aggregation.
        Never cached on a column. Never computed in Python from fetched rows.
        This is the single source of truth.
        """
        result = LedgerEntry.objects.filter(
            merchant_id=merchant_id
        ).aggregate(
            total_credits=Coalesce(
                Sum('amount_paise', filter=Q(entry_type='CREDIT')), 0,
                output_field=BigIntegerField()
            ),
            total_debits=Coalesce(
                Sum('amount_paise', filter=Q(entry_type='DEBIT')), 0,
                output_field=BigIntegerField()
            )
        )

        held = Payout.objects.filter(
            merchant_id=merchant_id,
            status__in=[Payout.PENDING, Payout.PROCESSING]
        ).aggregate(
            total=Coalesce(
                Sum('amount_paise'), 0,
                output_field=BigIntegerField()
            )
        )['total']

        total_credits = result['total_credits']
        total_debits = result['total_debits']
        available = total_credits - total_debits - held

        return {
            'available_paise': available,
            'held_paise': held,
            'total_credits_paise': total_credits,
            'total_debits_paise': total_debits,
            'available_formatted': format_paise(available),
            'held_formatted': format_paise(held),
        }

    @staticmethod
    def get_ledger_with_running_balance(merchant_id):
        """
        Returns ledger entries with a running balance column.
        Running balance uses a window function — pure SQL, no Python loops.
        """
        entries = LedgerEntry.objects.filter(
            merchant_id=merchant_id
        ).annotate(
            signed_amount=Case(
                When(entry_type='CREDIT', then=F('amount_paise')),
                When(entry_type='DEBIT', then=-F('amount_paise')),
                output_field=BigIntegerField()
            )
        ).annotate(
            running_balance_paise=Window(
                expression=Sum('signed_amount'),
                order_by=F('created_at').asc()
            )
        ).order_by('-created_at')

        return entries
