# Playto Backend — EXPLAINER

## The Ledger

### Balance Query
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

### Why DB Aggregation Instead of a Stored Column?

A stored `balance` column on the Merchant model would introduce a read-modify-write race condition. Two concurrent transactions could both read balance=1000, both subtract 600, and both write balance=400 — resulting in a -200 overdraw. By deriving balance from `SUM(credits) - SUM(debits)` inside a locked transaction, we guarantee the balance is always consistent with the actual ledger history. The ledger is the single source of truth — never a cached column.

---

## The Lock

### The Exact Code
```python
with transaction.atomic():
    merchant = Merchant.objects.select_for_update().get(pk=merchant_id)
    # ... balance check and payout creation happen here
```

### What Happens at the PostgreSQL Level

`select_for_update()` translates to `SELECT ... FOR UPDATE` in SQL. When Transaction A executes this, PostgreSQL acquires an **exclusive row-level lock** on the merchant row. If Transaction B arrives and also calls `SELECT ... FOR UPDATE` on the same row, PostgreSQL **blocks** Transaction B until Transaction A either COMMITs or ROLLBACKs. This serializes access to the merchant's balance check. Transaction B can only proceed after A has committed its payout and debit ledger entry — at which point B's balance query will see A's changes and correctly report insufficient funds.

---

## The Idempotency

### How We Detect a Duplicate Key

The `idempotency_keys` table has a `UNIQUE(merchant_id, key)` constraint at the database level. Before creating a payout, we first query:
```python
IdempotencyKey.objects.get(
    merchant_id=merchant_id,
    key=idempotency_key_str,
    expires_at__gt=timezone.now()
)
```
If found, we return the cached `response_body` with status 200 (not 201). If not found, we proceed with payout creation and store the response.

### What Prevents Duplicates Under Concurrency?

If Request A is mid-transaction creating the payout, and Request B arrives with the same key, there are two cases:
1. **A's idempotency check hasn't committed yet**: B won't find the key in its own check, but when B tries to `INSERT` into `idempotency_keys`, the `UNIQUE` constraint raises `IntegrityError`, which rolls back B's transaction.
2. **A's transaction has committed**: B's check finds the key and returns the cached response immediately (status 200).

The DB-level `UNIQUE` constraint is the actual safety net — the Python-level check is an optimization to avoid unnecessary work, not the safety mechanism.

---

## The State Machine

### Blocking Illegal Transitions

```python
def transition_to(self, new_status):
    if new_status not in self.LEGAL_TRANSITIONS.get(self.status, []):
        raise ValueError(
            f"Illegal transition: {self.status} -> {new_status}"
        )
```

For example, `failed → completed` is blocked because `LEGAL_TRANSITIONS['failed'] = []` — an empty list means no transitions are allowed from terminal states.

### The DB-Level Guard (WHERE Clause)

```python
rows_updated = Payout.objects.filter(
    pk=payout_id,
    status=old_status  # ← THIS is the guard
).update(
    status=new_status,
    ...
)

if rows_updated == 0:
    raise StalePayoutError(...)
```

Even if two workers pass the Python-level `transition_to()` check simultaneously, only one's `UPDATE ... WHERE status = 'pending'` will match. The other gets `rows_updated = 0` and raises `StalePayoutError`. This is the **DB-level guard** that prevents race conditions on status transitions.

---

## The AI Audit

### Example: Incorrect Locking Scope

**What AI generated initially:**
```python
# AI's first attempt — WRONG
def create_payout(merchant_id, amount_paise, ...):
    merchant = Merchant.objects.get(pk=merchant_id)  # No lock!
    balance = calculate_balance(merchant)             # Race window
    if balance >= amount_paise:
        Payout.objects.create(...)                    # Double-spend possible
```

**What was wrong:** The `Merchant.objects.get()` call does not acquire any lock. Two concurrent requests can both read the same balance, both pass the check, and both create payouts — resulting in an overdraw. There is a race window between reading the balance and creating the payout.

**What we replaced it with:**
```python
with transaction.atomic():
    merchant = Merchant.objects.select_for_update().get(pk=merchant_id)
    # Balance check now happens inside the locked transaction
    # Second request blocks here until first commits
```

The `select_for_update()` acquires a PostgreSQL row-level lock. The second request physically cannot read the balance until the first transaction commits. This eliminates the race condition entirely.
