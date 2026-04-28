import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPayoutDetail } from '../api/payouts';
import { formatPaise, formatDateFull } from '../utils/format';

export default function PayoutDetails() {
  const { id } = useParams();
  const [payout, setPayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getPayoutDetail(id)
      .then(setPayout)
      .catch((err) => setError(err.response?.data?.error || 'Failed to load.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!payout || payout.status === 'completed' || payout.status === 'failed') return;
    const interval = setInterval(() => {
      getPayoutDetail(id).then(setPayout).catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [id, payout?.status]);

  if (loading) return <div className="animate-pulse p-12 font-data-lg uppercase">Loading...</div>;
  if (error || !payout) return (
    <div className="p-12">
      <Link className="opacity-50 hover:opacity-100 uppercase text-xs" to="/payouts">&lt;- BACK</Link>
      <p className="mt-8 text-red-500">{error || 'Not found.'}</p>
    </div>
  );

  const statusCls = { completed: 'text-status-completed uppercase', processing: 'text-status-processing italic', pending: 'text-status-pending', failed: 'text-red-500 uppercase' };

  const details = [
    { label: 'AMOUNT', value: formatPaise(payout.amount_paise), bold: true },
    { label: 'STATUS', value: payout.status.toUpperCase(), cls: statusCls[payout.status] },
    { label: 'BANK ACCOUNT', value: `${payout.bank_account?.bank_name || '—'} •••• ${payout.bank_account?.last4 || ''}` },
    { label: 'IDEMPOTENCY KEY', value: payout.idempotency_key || '—' },
    { label: 'CREATED', value: formatDateFull(payout.created_at) },
    { label: 'UPDATED', value: formatDateFull(payout.updated_at) },
    { label: 'ATTEMPTS', value: payout.attempt_count },
  ];
  if (payout.failure_reason) details.push({ label: 'FAILURE REASON', value: payout.failure_reason, cls: 'text-red-500' });

  return (
    <>
      <div className="px-8 pb-8">
        <Link className="inline-flex items-center space-x-2 opacity-50 hover:opacity-100" to="/payouts">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span className="font-data-md text-data-md tracking-widest uppercase">&lt;- BACK TO PAYOUTS</span>
        </Link>
        <h1 className="font-editorial-h1 text-editorial-h1 mt-8 pb-8 border-b border-tertiary">
          Payout #{String(payout.id).slice(0, 8)}.
        </h1>
      </div>
      <div className="flex-grow flex flex-col md:flex-row w-full border-t border-tertiary mt-[-1px]">
        <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-tertiary flex flex-col">
          {details.map((d, i) => (
            <div key={i} className="p-8 border-b border-tertiary flex flex-col md:flex-row justify-between items-start md:items-center">
              <span className="font-data-md text-data-md opacity-50 uppercase tracking-widest">{d.label}</span>
              <span className={`${d.bold ? 'font-ui-label-bold text-xl' : 'font-data-md text-data-md'} ${d.cls || ''} mt-2 md:mt-0 text-right break-all`}>{d.value}</span>
            </div>
          ))}
          {payout.status === 'failed' && (
            <div className="m-8 border border-tertiary p-6 flex items-center justify-center bg-surface-container-highest">
              <span className="font-data-md uppercase text-center">FUNDS RETURNED TO BALANCE</span>
            </div>
          )}
        </div>
        <div className="w-full md:w-1/2 p-8 md:pl-12 flex flex-col bg-surface-bright">
          <h2 className="font-data-md uppercase tracking-widest mb-12 opacity-50">PAYOUT LIFECYCLE</h2>
          <div className="relative border-l border-tertiary ml-3 flex flex-col space-y-12 pb-12">
            {(!payout.events || payout.events.length === 0) && (
              <div className="pl-10 opacity-50">No events yet.</div>
            )}
            {payout.events?.map((ev, i) => (
              <div key={i} className="relative pl-10 flex flex-col items-start">
                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-tertiary border border-tertiary"></div>
                <span className="font-data-md opacity-50 mb-2">{formatDateFull(ev.created_at)}</span>
                <h3 className="font-editorial-h2 text-editorial-h2 mb-2">{ev.event}</h3>
                <p className="font-data-md opacity-70">{ev.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
