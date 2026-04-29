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
    return (
      <div className="animate-pulse">
        <div className="flex justify-between items-end mb-12 border-b border-primary pb-8">
          <div className="h-14 bg-surface-container-highest rounded w-1/3"></div>
          <div className="h-4 bg-surface-container-highest rounded w-1/6"></div>
        </div>
        <div className="flex gap-8 mb-8">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-4 bg-surface-container-highest rounded w-16"></div>
          ))}
        </div>
        <div className="w-full border border-primary">
          <div className="grid grid-cols-5 border-b border-primary p-4 gap-4">
            {[1,2,3,4,5].map(i => <div key={i} className="h-3 bg-surface-container-highest rounded"></div>)}
          </div>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="grid grid-cols-5 border-b border-primary p-4 gap-4">
              {[1,2,3,4,5].map(j => <div key={j} className="h-4 bg-surface-container-highest rounded"></div>)}
            </div>
          ))}
        </div>
      </div>
    );
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
        <div className="grid grid-cols-3 md:grid-cols-5 bg-surface-container-lowest border-b border-primary p-4 text-xs font-ui-label-bold text-ui-label-bold uppercase">
          <div>ID</div>
          <div className="hidden md:block">BANK ACCOUNT</div>
          <div>AMOUNT</div>
          <div>STATUS</div>
          <div className="text-right hidden md:block">DATE</div>
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
                className={`grid grid-cols-3 md:grid-cols-5 items-center border-b border-primary border-opacity-10 p-4 hover:bg-primary hover:text-on-primary transition-colors cursor-pointer group ${isFailed ? 'opacity-50' : ''}`}
              >
                <div className={`truncate pr-2 text-xs md:text-sm ${isFailed ? 'line-through' : ''}`}>
                  {String(payout.id).slice(0, 8)}
                </div>
                <div className={`truncate pr-4 hidden md:block ${isFailed ? 'line-through' : ''}`}>
                  {payout.bank_account?.bank_name || '—'} ****{payout.bank_account?.last4 || ''}
                </div>
                <div className={`text-xs md:text-sm ${isFailed ? 'line-through' : ''}`}>
                  {formatPaise(payout.amount_paise)}
                </div>
                <div className={`text-xs md:text-sm ${getStatusClass(payout.status)}`}>
                  {payout.status === 'processing' ? 'Processing...' : payout.status.toUpperCase()}
                </div>
                <div className="text-right opacity-70 group-hover:opacity-100 hidden md:block">
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
