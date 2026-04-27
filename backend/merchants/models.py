import uuid
from django.db import models


class Merchant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'merchants'

    def __str__(self):
        return self.name


class BankAccount(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    merchant = models.ForeignKey(
        Merchant,
        on_delete=models.CASCADE,
        related_name='bank_accounts'
    )
    account_number = models.CharField(max_length=20)
    ifsc = models.CharField(max_length=11)
    bank_name = models.CharField(max_length=100)
    account_holder = models.CharField(max_length=255)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bank_accounts'

    def __str__(self):
        return f"{self.bank_name} - {self.masked_number}"

    @property
    def last4(self):
        return self.account_number[-4:]

    @property
    def masked_number(self):
        return '•' * (len(self.account_number) - 4) + self.account_number[-4:]
