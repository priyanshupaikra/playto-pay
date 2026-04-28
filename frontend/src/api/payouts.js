import api from './config';

export const createPayout = (merchantId, data, idempotencyKey) =>
  api.post(`/payouts/?merchant_id=${merchantId}`, data, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });

export const getPayouts = (merchantId) =>
  api.get(`/payouts/?merchant_id=${merchantId}`).then((r) => r.data);

export const getPayoutDetail = (payoutId) =>
  api.get(`/payouts/${payoutId}/`).then((r) => r.data);
