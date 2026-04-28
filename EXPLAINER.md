# EXPLAINER.md — Playto Payout Engine

---

## 1. The Ledger

### Balance Calculation Query

This is the actual query that runs every time we need a merchant's balance. It lives in `merchants/services.py` → `LedgerService.get_balance()`:

```python
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
    total=Coalesce(Sum('amount_paise'), 0, output_field=BigIntegerField())
)['total']

available = total_credits - total_debits - held
```

### Why I modeled credits and debits this way

I have a single `LedgerEntry` table with an `entry_type` field that is either `CREDIT` or `DEBIT`. Every money movement in the system creates a row here. When a customer pays, that's a CREDIT. When a payout is requested, that's a DEBIT (funds get held). If the payout fails, we create another CREDIT to return the money.

The balance is never stored as a column on the Merchant model. It's always derived by doing `SUM(credits) - SUM(debits)` at the database level. I did it this way because if I stored balance as a column, I'd have a classic read-modify-write race condition — two transactions could both read balance=1000, both subtract 600, both write 400, and now we've given away ₹1200 from a ₹1000 balance. By deriving it from the ledger every time (inside a locked transaction), the balance is always correct and consistent with the actual history.

Also, all amounts are stored as `BigIntegerField` in paise (1 rupee = 100 paise). No floats, no decimals. Floats have precision issues (0.1 + 0.2 ≠ 0.3 in floating point), and for a money system that's unacceptable. Paise as integers means every calculation is exact.

---

## 2. The Lock

### The exact code that prevents concurrent overdraw

This is from `payouts/services.py` → `PayoutService.create_payout()`:

```python
with transaction.atomic():
    # STEP 1: Lock the merchant row
    merchant = Merchant.objects.select_for_update().get(pk=merchant_id)

    # STEP 2: Calculate balance (inside the lock)
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

    held = Payout.objects.filter(
        merchant=merchant,
        status__in=['pending', 'processing']
    ).aggregate(total=Coalesce(Sum('amount_paise'), 0))['total']

    available = credits - debits - held

    # STEP 3: Check and create (still inside the lock)
    if available < amount_paise:
        raise InsufficientBalanceError(available, amount_paise)

    payout = Payout.objects.create(...)
    LedgerEntry.objects.create(...)  # DEBIT to hold funds
```

### What database primitive it relies on

`select_for_update()` translates to PostgreSQL's `SELECT ... FOR UPDATE`. What this does is acquire an exclusive row-level lock on that merchant row. So if two requests come in at the same time for the same merchant:

- Request A hits `select_for_update()` first and grabs the lock.
- Request B hits `select_for_update()` and gets **blocked** — it literally waits.
- Request A calculates balance, creates the payout, commits.
- Now Request B unblocks, calculates balance again (this time it sees A's debit), and correctly gets "insufficient balance."

The important thing is that the balance check and the payout creation happen inside the same `transaction.atomic()` block. The lock isn't released until the whole block commits. So there's no window where two requests can both see the same balance.

I also have a test for this in `tests/test_concurrency.py` — it spins up two threads, both trying to withdraw ₹60 from a ₹100 balance. Exactly one succeeds, the other gets rejected.

---

## 3. The Idempotency

### How the system knows it has seen a key before

There's an `IdempotencyKey` model with a `UNIQUE(merchant_id, key)` constraint at the database level. Before creating any payout, I check:

```python
idem_key = IdempotencyKey.objects.get(
    merchant_id=merchant_id,
    key=idempotency_key_str,
    expires_at__gt=timezone.now()
)
# If found → return the cached response immediately (status 200, not 201)
return idem_key.response_body, 200
```

If the key doesn't exist, I proceed with payout creation and then save the full response body into the `IdempotencyKey` table. Next time the same key comes in, I just return the cached response. Keys are scoped per merchant, so two different merchants can use the same UUID without conflicts. Keys expire after 24 hours — a Celery beat task cleans them up every hour.

### What happens if the first request is still in-flight when the second arrives

This is the tricky part. Two scenarios:

1. **First request hasn't committed yet**: The second request does its own `IdempotencyKey.objects.get()`, doesn't find anything (because the first hasn't committed), and tries to proceed. But when it tries to INSERT its own idempotency key row, the `UNIQUE` constraint on `(merchant_id, key)` will cause an `IntegrityError` and the whole transaction rolls back. No duplicate payout created.

2. **First request has already committed**: The second request finds the key in the database, returns the cached response immediately. Done.

The Python-level check is just an optimization to avoid doing unnecessary work. The real safety net is the database `UNIQUE` constraint — that's what actually prevents duplicates even under concurrency.

---

## 4. The State Machine

### Where failed-to-completed is blocked

It's in the `Payout` model itself (`payouts/models.py`):

```python
LEGAL_TRANSITIONS = {
    'pending':    ['processing'],
    'processing': ['completed', 'failed'],
    'completed':  [],   # terminal — nothing allowed
    'failed':     [],   # terminal — nothing allowed
}

def transition_to(self, new_status):
    if new_status not in self.LEGAL_TRANSITIONS.get(self.status, []):
        raise ValueError(
            f"Illegal transition: {self.status} -> {new_status}"
        )
```

So if someone tries `failed → completed`, the code checks `LEGAL_TRANSITIONS['failed']` which is `[]` (empty list). `'completed'` is not in `[]`, so it raises `ValueError`. Same thing blocks `completed → pending` or any other backwards transition.

But I don't just rely on this Python check. In `PayoutService.transition_payout()`, there's also a DB-level guard:

```python
rows_updated = Payout.objects.filter(
    pk=payout_id,
    status=old_status   # ← WHERE clause guard
).update(
    status=new_status,
    ...
)

if rows_updated == 0:
    raise StalePayoutError(...)
```

Even if two Celery workers somehow both pass the Python check at the same time (unlikely but possible), only one's UPDATE will match the WHERE clause. The other gets `rows_updated = 0` and raises a `StalePayoutError`. So it's two layers of protection — Python validates the logic, the database enforces it.

Also, when a payout moves to `failed`, the fund return happens atomically in the same transaction:

```python
if new_status == Payout.FAILED:
    LedgerEntry.objects.create(
        merchant=payout.merchant,
        entry_type=LedgerEntry.CREDIT,
        amount_paise=payout.amount_paise,
        description=f'Funds returned from failed payout {payout.id}',
        payout=payout
    )
```

This CREDIT and the status change are in the same `transaction.atomic()` block. Either both happen or neither happens. No scenario where the status changes to failed but the money doesn't come back.

---

## 5. The AI Audit

### What AI got wrong: No locking on balance check

**What AI generated:**
```python
def create_payout(merchant_id, amount_paise, ...):
    merchant = Merchant.objects.get(pk=merchant_id)  # No lock!
    balance = calculate_balance(merchant)             # Race window open
    if balance >= amount_paise:
        Payout.objects.create(...)                    # Both requests get here
```

**What was wrong:** There's no lock on the merchant row. Two concurrent requests can both call `Merchant.objects.get()` at the same time, both see the same balance (say ₹1000), both pass the `if balance >= amount_paise` check, and both create payouts. Now the merchant has two ₹600 payouts on a ₹1000 balance — that's a ₹200 overdraw. This is the classic check-then-act race condition.

**What I caught:** The `objects.get()` is just a regular SELECT — it doesn't acquire any lock in PostgreSQL. There's a gap between reading the balance and creating the payout where another transaction can slip in.

**What I replaced it with:**
```python
with transaction.atomic():
    merchant = Merchant.objects.select_for_update().get(pk=merchant_id)
    # Now this merchant row is locked — second request waits here
    balance = calculate_balance(merchant)
    if balance >= amount_paise:
        Payout.objects.create(...)
```

`select_for_update()` acquires a row-level exclusive lock in PostgreSQL. The second request can't even read the merchant row until the first transaction finishes. This completely eliminates the race condition. It's the difference between Python-level "checking" and database-level "locking" — the database is the only thing that can actually serialize concurrent access.

---

## Bonus: Retry Logic

Payouts stuck in `processing` for more than 30 seconds get retried by a Celery beat task (`retry_stale_payouts`) that runs every 10 seconds. It uses `select_for_update(skip_locked=True)` to avoid thundering herd — if one worker is already handling a stale payout, other workers skip it.

Exponential backoff: waits 30s, 60s, 120s between retries. After 3 total attempts, moves the payout to `failed` and returns the funds.

```python
stale_payouts = Payout.objects.filter(
    status=Payout.PROCESSING,
    processing_at__lt=cutoff,
    attempt_count__lt=3
).select_for_update(skip_locked=True)
```

## Bonus: Audit Log

Every payout state change creates a `PayoutEvent` row — append-only, never updated. This gives a full audit trail: CREATED → PROCESSING → COMPLETED (or FAILED), with timestamps and descriptions. You can trace exactly what happened to any payout and when.

---

## Stack Summary

- **Backend:** Django + DRF, PostgreSQL (NeonDB), Celery + Redis for background jobs
- **Frontend:** React + Vite
- **Deployment:** Render (both services), NeonDB for hosted Postgres
- **Tests:** `test_concurrency.py` (threading-based overdraw test), `test_idempotency.py` (duplicate key + cross-merchant key scoping)
