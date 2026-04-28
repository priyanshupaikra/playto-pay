import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMerchant } from '../context/MerchantContext';
import { getPayouts } from '../api/payouts';
import { formatPaise, formatDate } from '../utils/format';

export default function PayoutHistory() {
  const { currentMerchant } = useMerchant();
  const [filter, setFilter] = useState('ALL');
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const merchantId = currentMerchant?.id;

  const fetchPayouts = () => {
    if (!merchantId) return;
    getPayouts(merchantId)
      .then(setPayouts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    fetchPayouts();
  }, [merchantId]);

  // Auto-refresh every 10s
  useEffect(() => {
    if (!merchantId) return;
    const interval = setInterval(() => {
      getPayouts(merchantId).then(setPayouts).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [merchantId]);

  const filtered = filter === 'ALL'
    ? payouts
    : payouts.filter((p) => p.status.toUpperCase() === filter);

  const getFilterClass = (status) => {
    if (filter === status) {
      return "underline decoration-2 underline-offset-4 font-bold text-primary";
    }
    return "opacity-70 hover:opacity-100 hover:text-primary transition-opacity";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'font-status-completed text-status-completed uppercase';
      case 'processing': return 'font-status-processing text-status-processing italic';
      case 'pending': return 'font-status-pending text-status-pending opacity-50 group-hover:opacity-100';
      case 'failed': return 'font-data-md text-data-md uppercase line-through';
      default: return '';
    }
  };

  if (loading) {
    return <div className="font-data-lg text-data-lg uppercase tracking-widest animate-pulse p-12">Loading payouts...</div>;
  }

  return (
    <>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-primary pb-8">
        <h1 className="font-editorial-display text-editorial-display">Payout History.</h1>
        <div className="font-data-md text-data-md opacity-70 mt-4 md:mt-0">Live updates every 10s</div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-8 mb-8 font-data-md text-data-md uppercase text-xs">
        {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].map((s) => (
          <button key={s} className={getFilterClass(s)} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>

      {/* Data Table */}
      <div className="w-full border border-primary font-data-md text-data-md">
        {/* Table Header */}
        <div className="grid grid-cols-5 bg-surface-container-lowest border-b border-primary p-4 text-xs font-ui-label-bold text-ui-label-bold uppercase">
          <div>ID</div>
          <div>BANK ACCOUNT</div>
          <div>AMOUNT</div>
          <div>STATUS</div>
          <div className="text-right">DATE</div>
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          {filtered.length === 0 && (
            <div className="p-8 text-center opacity-50 font-data-md text-data-md">No payouts found.</div>
          )}
          {filtered.map((payout) => {
            const isFailed = payout.status === 'failed';
            return (
              <Link
                to={`/payouts/${payout.id}`}
                key={payout.id}
                className={`grid grid-cols-5 items-center border-b border-primary border-opacity-10 p-4 hover:bg-primary hover:text-on-primary transition-colors cursor-pointer group ${isFailed ? 'opacity-50' : ''}`}
              >
                <div className={`truncate pr-4 ${isFailed ? 'line-through' : ''}`}>
                  {String(payout.id).slice(0, 8)}
                </div>
                <div className={`truncate pr-4 ${isFailed ? 'line-through' : ''}`}>
                  {payout.bank_account?.bank_name || '—'} ****{payout.bank_account?.last4 || ''}
                </div>
                <div className={isFailed ? 'line-through' : ''}>
                  {formatPaise(payout.amount_paise)}
                </div>
                <div className={getStatusClass(payout.status)}>
                  {payout.status === 'processing' ? 'Processing...' : payout.status.toUpperCase()}
                </div>
                <div className="text-right opacity-70 group-hover:opacity-100">
                  {formatDate(payout.created_at)}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
