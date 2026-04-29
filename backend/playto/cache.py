"""
Redis-backed caching utilities for frequently read data.
Uses Django's cache framework — no raw redis-py needed.
"""
from django.core.cache import cache

# Cache TTLs (seconds)
BALANCE_TTL = 5         # Balance changes on every payout — short TTL
MERCHANT_LIST_TTL = 300  # Merchant list rarely changes — 5 minutes
BANK_ACCOUNTS_TTL = 60   # Bank accounts rarely change — 1 minute


def get_cached_balance(merchant_id):
    return cache.get(f"balance:{merchant_id}")


def set_cached_balance(merchant_id, balance_data):
    cache.set(f"balance:{merchant_id}", balance_data, BALANCE_TTL)


def invalidate_balance(merchant_id):
    cache.delete(f"balance:{merchant_id}")


def get_cached_merchant_list(user_id):
    return cache.get(f"merchants:{user_id}")


def set_cached_merchant_list(user_id, data):
    cache.set(f"merchants:{user_id}", data, MERCHANT_LIST_TTL)


def invalidate_merchant_cache(user_id):
    cache.delete(f"merchants:{user_id}")
