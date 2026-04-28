"""
Seed script for Playto.
Run with: python manage.py seed
OR:       python manage.py shell < seeds/seed.py
"""
import uuid
from datetime import timedelta
from django.utils import timezone

# Ensure Django is set up if running via shell <
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'playto.settings.development')
try:
    django.setup()
except RuntimeError:
    pass  # Already configured

from merchants.models import Merchant, BankAccount
from ledger.models import LedgerEntry
from payouts.models import Payout, PayoutEvent


def run_seed():
    print("[SEED] Seeding Playto database...")

    # ─── Clear existing data ─────────────────────────────────────────────
    PayoutEvent.objects.all().delete()
    Payout.objects.all().delete()
    LedgerEntry.objects.all().delete()
    BankAccount.objects.all().delete()
    Merchant.objects.all().delete()
    print("  [OK] Cleared existing data")

    # ─── Create Merchants ────────────────────────────────────────────────
    arjun = Merchant.objects.create(
        name='Arjun Sharma',
        email='arjun@example.com'
    )
    priya = Merchant.objects.create(
        name='Priya Mehta',
        email='priya@example.com'
    )
    rohan = Merchant.objects.create(
        name='Rohan Verma',
        email='rohan@example.com'
    )
    merchants = [arjun, priya, rohan]
    print(f"  [OK] Created {len(merchants)} merchants")

    # ─── Create Bank Accounts (2 per merchant) ──────────────────────────
    banks_data = {
        arjun: [
            {'account_number': '50100123456789', 'ifsc': 'HDFC0001234',
             'bank_name': 'HDFC Bank', 'account_holder': 'Arjun Sharma',
             'is_primary': True},
            {'account_number': '91234567890123', 'ifsc': 'ICIC0005678',
             'bank_name': 'ICICI Bank', 'account_holder': 'Arjun Sharma',
             'is_primary': False},
        ],
        priya: [
            {'account_number': '30100987654321', 'ifsc': 'SBIN0009012',
             'bank_name': 'State Bank of India', 'account_holder': 'Priya Mehta',
             'is_primary': True},
            {'account_number': '60200123498765', 'ifsc': 'KKBK0003456',
             'bank_name': 'Kotak Mahindra Bank', 'account_holder': 'Priya Mehta',
             'is_primary': False},
        ],
        rohan: [
            {'account_number': '40300567890123', 'ifsc': 'UTIB0007890',
             'bank_name': 'Axis Bank', 'account_holder': 'Rohan Verma',
             'is_primary': True},
            {'account_number': '70400987651234', 'ifsc': 'PUNB0001234',
             'bank_name': 'Punjab National Bank', 'account_holder': 'Rohan Verma',
             'is_primary': False},
        ],
    }

    bank_accounts = {}
    for merchant, accounts in banks_data.items():
        bank_accounts[merchant.id] = []
        for acct in accounts:
            ba = BankAccount.objects.create(merchant=merchant, **acct)
            bank_accounts[merchant.id].append(ba)
    print("  [OK] Created bank accounts")

    # ─── Create Credit History ───────────────────────────────────────────
    now = timezone.now()

    # Arjun: 5 credits totalling ~₹18,500 (1850000 paise)
    arjun_credits = [
        (500000, 'Customer payment from Acme Corp', now - timedelta(days=15)),
        (350000, 'Invoice #INV-2024-042 settled', now - timedelta(days=12)),
        (420000, 'Freelance project — UI redesign', now - timedelta(days=8)),
        (280000, 'Customer payment from TechStar', now - timedelta(days=4)),
        (300000, 'Monthly retainer — Acme Corp', now - timedelta(days=1)),
    ]

    # Priya: 4 credits totalling ~₹24,000 (2400000 paise)
    priya_credits = [
        (800000, 'Enterprise contract — Q1 delivery', now - timedelta(days=20)),
        (650000, 'Customer payment from GlobalTech', now - timedelta(days=14)),
        (550000, 'Consulting engagement — FinServ', now - timedelta(days=7)),
        (400000, 'Project milestone payment', now - timedelta(days=2)),
    ]

    # Rohan: 3 credits totalling ~₹9,200 (920000 paise)
    rohan_credits = [
        (380000, 'Freelance gig — mobile app', now - timedelta(days=18)),
        (320000, 'Customer payment from StartupXYZ', now - timedelta(days=10)),
        (220000, 'Bug bounty reward', now - timedelta(days=3)),
    ]

    credit_data = [
        (arjun, arjun_credits),
        (priya, priya_credits),
        (rohan, rohan_credits),
    ]

    for merchant, credits in credit_data:
        for amount, desc, created in credits:
            entry = LedgerEntry.objects.create(
                merchant=merchant,
                entry_type=LedgerEntry.CREDIT,
                amount_paise=amount,
                description=desc,
            )
            # Backdate the created_at
            LedgerEntry.objects.filter(pk=entry.pk).update(created_at=created)

    print("  [OK] Created credit history")

    # ─── Create Payout History ───────────────────────────────────────────
    def create_payout_with_history(merchant, bank_account, amount_paise,
                                   final_status, days_ago):
        """Create a payout with matching ledger entries and events."""
        created = now - timedelta(days=days_ago)

        payout = Payout.objects.create(
            merchant=merchant,
            bank_account=bank_account,
            amount_paise=amount_paise,
            status=final_status,
        )
        # Backdate
        Payout.objects.filter(pk=payout.pk).update(
            created_at=created,
            updated_at=created + timedelta(minutes=2),
            processing_at=created + timedelta(seconds=5),
            completed_at=created + timedelta(minutes=2) if final_status in ['completed', 'failed'] else None,
        )

        # DEBIT entry for funds held
        debit = LedgerEntry.objects.create(
            merchant=merchant,
            entry_type=LedgerEntry.DEBIT,
            amount_paise=amount_paise,
            description=f'Funds held for payout {payout.id}',
            payout=payout,
        )
        LedgerEntry.objects.filter(pk=debit.pk).update(created_at=created)

        # Events
        PayoutEvent.objects.create(
            payout=payout,
            event='CREATED',
            description='Payout created. Funds held from available balance.',
        )
        PayoutEvent.objects.create(
            payout=payout,
            event='PROCESSING',
            description='Worker picked up payout.',
        )

        if final_status == 'completed':
            PayoutEvent.objects.create(
                payout=payout,
                event='COMPLETED',
                description='Bank settlement successful.',
            )

        if final_status == 'failed':
            PayoutEvent.objects.create(
                payout=payout,
                event='FAILED',
                description='Payout failed. Bank rejected the transfer.',
            )
            # CREDIT reversal for failed payout
            reversal = LedgerEntry.objects.create(
                merchant=merchant,
                entry_type=LedgerEntry.CREDIT,
                amount_paise=amount_paise,
                description=f'Funds returned from failed payout {payout.id}',
                payout=payout,
            )
            LedgerEntry.objects.filter(pk=reversal.pk).update(
                created_at=created + timedelta(minutes=2)
            )

        # pending: no extra events/entries — it's still pending
        return payout

    # Arjun: 1 completed, 1 failed, 1 pending
    arjun_bank = bank_accounts[arjun.id][0]
    create_payout_with_history(arjun, arjun_bank, 200000, 'completed', 10)
    create_payout_with_history(arjun, arjun_bank, 150000, 'failed', 6)
    create_payout_with_history(arjun, arjun_bank, 120000, 'pending', 0)

    # Priya: 1 completed, 1 failed, 1 pending
    priya_bank = bank_accounts[priya.id][0]
    create_payout_with_history(priya, priya_bank, 300000, 'completed', 12)
    create_payout_with_history(priya, priya_bank, 250000, 'failed', 5)
    create_payout_with_history(priya, priya_bank, 180000, 'pending', 0)

    # Rohan: 1 completed, 1 failed, 1 pending
    rohan_bank = bank_accounts[rohan.id][0]
    create_payout_with_history(rohan, rohan_bank, 100000, 'completed', 15)
    create_payout_with_history(rohan, rohan_bank, 80000, 'failed', 8)
    create_payout_with_history(rohan, rohan_bank, 60000, 'pending', 0)

    print("  [OK] Created payout history with ledger entries and events")

    # ─── Summary ─────────────────────────────────────────────────────────
    print()
    print("--- Seed Summary ---")
    print(f"  Merchants:      {Merchant.objects.count()}")
    print(f"  Bank Accounts:  {BankAccount.objects.count()}")
    print(f"  Ledger Entries:  {LedgerEntry.objects.count()}")
    print(f"  Payouts:        {Payout.objects.count()}")
    print(f"  Payout Events:  {PayoutEvent.objects.count()}")
    print()
    print("[DONE] Seeding complete!")


# Only run when executed directly (not when imported)
if __name__ == '__main__':
    run_seed()
