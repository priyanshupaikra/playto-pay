import api from './config';

export const getBankAccounts = (merchantId) =>
  api.get(`/bank-accounts/?merchant_id=${merchantId}`).then((r) => r.data);

export const addBankAccount = (merchantId, data) =>
  api.post(`/bank-accounts/?merchant_id=${merchantId}`, data).then((r) => r.data);

export const deleteBankAccount = (accountId) =>
  api.delete(`/bank-accounts/${accountId}/`);
