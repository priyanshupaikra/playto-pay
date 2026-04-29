import api from './config';

export const getDashboard = (merchantId) =>
  api.get(`/merchants/${merchantId}/dashboard/`).then((r) => r.data);
