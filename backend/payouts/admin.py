from django.contrib import admin
from .models import Payout, PayoutEvent, IdempotencyKey


@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    list_display = ['id', 'merchant', 'amount_paise', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['merchant__name']


@admin.register(PayoutEvent)
class PayoutEventAdmin(admin.ModelAdmin):
    list_display = ['payout', 'event', 'description', 'created_at']
    list_filter = ['event']


@admin.register(IdempotencyKey)
class IdempotencyKeyAdmin(admin.ModelAdmin):
    list_display = ['merchant', 'key', 'response_status', 'created_at', 'expires_at']
