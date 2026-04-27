from django.contrib import admin
from .models import Merchant, BankAccount


@admin.register(Merchant)
class MerchantAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'created_at']
    search_fields = ['name', 'email']


@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display = ['merchant', 'bank_name', 'last4', 'is_primary', 'created_at']
    list_filter = ['bank_name', 'is_primary']
