from django.urls import path
from .views import (
    MerchantListView,
    MerchantBalanceView,
    MerchantLedgerView,
    BankAccountListCreateView,
    BankAccountDeleteView,
    DashboardView,
)

urlpatterns = [
    path('merchants/', MerchantListView.as_view(), name='merchant-list'),
    path('merchants/<uuid:merchant_id>/balance/', MerchantBalanceView.as_view(), name='merchant-balance'),
    path('merchants/<uuid:merchant_id>/ledger/', MerchantLedgerView.as_view(), name='merchant-ledger'),
    path('merchants/<uuid:merchant_id>/dashboard/', DashboardView.as_view(), name='merchant-dashboard'),
    path('bank-accounts/', BankAccountListCreateView.as_view(), name='bank-account-list-create'),
    path('bank-accounts/<uuid:account_id>/', BankAccountDeleteView.as_view(), name='bank-account-delete'),
]
