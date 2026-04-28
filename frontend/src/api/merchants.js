import api from './config';

export const getMerchants = () =>
  api.get('/merchants/').then((r) => r.data);

export const getBalance = (merchantId) =>
  api.get(`/merchants/${merchantId}/balance/`).then((r) => r.data);

export const getLedger = (merchantId, page = 1) =>
  api.get(`/merchants/${merchantId}/ledger/?page=${page}`).then((r) => r.data);
