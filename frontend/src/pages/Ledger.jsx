import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMerchant } from '../context/MerchantContext';
import { getBalance, getLedger } from '../api/merchants';
import { formatPaise, formatDateFull, truncateId } from '../utils/format';

export default function Ledger() {
  const { currentMerchant } = useMerchant();
  const [balance, setBalance] = useState(null);
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const merchantId = currentMerchant?.id;
  const pageSize = 20;

  useEffect(() => {
    if (!merchantId) return;
    setLoading(true);
    Promise.all([
      getBalance(merchantId),
      getLedger(merchantId, page),
    ])
      .then(([bal, ledger]) => {
        setBalance(bal);
        setEntries(ledger.results || ledger);
        setTotalCount(ledger.count || (ledger.results || ledger).length);
        setNextPage(ledger.next);
        setPrevPage(ledger.previous);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [merchantId, page]);

  // Reset to page 1 when merchant changes
  useEffect(() => { setPage(1); }, [merchantId]);

  const startEntry = (page - 1) * pageSize + 1;
  const endEntry = Math.min(page * pageSize, totalCount);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-12">
          <div className="h-14 bg-surface-container-highest rounded w-1/4 mb-4"></div>
          <div className="h-5 bg-surface-container-highest rounded w-2/3"></div>
        </div>
        <div className="brutalist-border-t brutalist-border-b grid grid-cols-3 mb-16">
          {[1,2,3].map(i => (
            <div key={i} className="p-8 brutalist-border-r h-32 flex flex-col justify-between">
              <div className="h-3 bg-surface-container-highest rounded w-1/2"></div>
              <div className="h-8 bg-surface-container-highest rounded w-2/3"></div>
            </div>
          ))}
        </div>
        {[1,2,3,4,5].map(i => (
          <div key={i} className="grid grid-cols-5 h-[64px] items-center brutalist-border-b gap-4 px-4">
            <div className="h-4 bg-surface-container-highest rounded"></div>
            <div className="h-4 bg-surface-container-highest rounded"></div>
            <div className="h-4 bg-surface-container-highest rounded"></div>
            <div className="h-4 bg-surface-container-highest rounded"></div>
            <div className="h-4 bg-surface-container-highest rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Header Section */}
      <header className="mb-12">
        <h1 className="font-editorial-display text-editorial-display mb-4">Ledger.</h1>
        <p className="font-editorial-h2 text-editorial-h2 opacity-60 italic max-w-2xl">
          Balance is derived entirely from this ledger. Credits minus debits. Always.
        </p>
      </header>

      {/* Summary Bar */}
      <section className="brutalist-border-t brutalist-border-b grid grid-cols-1 sm:grid-cols-3 mb-16">
        <div className="p-6 sm:p-8 brutalist-border-b sm:brutalist-border-b-0 sm:brutalist-border-r flex flex-col justify-between sm:h-32 hover-invert transition-none">
          <span className="font-ui-label-bold text-ui-label-bold uppercase tracking-wider">TOTAL CREDITS</span>
          <span className="font-data-lg text-data-lg font-bold mt-2 sm:mt-0">
            + {formatPaise(balance?.total_credits_paise || 0)}
          </span>
        </div>
        <div className="p-6 sm:p-8 brutalist-border-b sm:brutalist-border-b-0 sm:brutalist-border-r flex flex-col justify-between sm:h-32 hover-invert transition-none">
          <span className="font-ui-label-bold text-ui-label-bold uppercase tracking-wider">TOTAL DEBITS</span>
          <span className="font-data-lg text-data-lg mt-2 sm:mt-0">
            - {formatPaise(balance?.total_debits_paise || 0)}
          </span>
        </div>
        <div className="p-6 sm:p-8 flex flex-col justify-between sm:h-32 hover-invert transition-none">
          <span className="font-ui-label-bold text-ui-label-bold uppercase tracking-wider">NET BALANCE</span>
          <span className="font-data-lg text-data-lg font-bold mt-2 sm:mt-0">
            {balance?.available_formatted || '₹0.00'}
          </span>
        </div>
      </section>

      {/* Ledger Table */}
      <section className="mb-8">
        <div className="w-full">
          {/* Table Header */}
          <div className="grid grid-cols-3 md:grid-cols-5 border-b-2 border-black pb-4 mb-2 font-ui-label-bold text-ui-label-bold uppercase tracking-wider text-xs">
            <div className="pl-4">DATE</div>
            <div>TYPE</div>
            <div className="text-right">AMOUNT</div>
            <div className="text-right hidden md:block">RUNNING BALANCE</div>
            <div className="text-right pr-4 hidden md:block">LINKED PAYOUT</div>
          </div>

          {entries.length === 0 && (
            <div className="p-8 text-center opacity-50 font-data-md text-data-md">No ledger entries yet.</div>
          )}

          {entries.map((entry) => {
            const isDebit = entry.entry_type === 'DEBIT';
            return (
              <div
                key={entry.id}
                className={`grid grid-cols-3 md:grid-cols-5 min-h-[56px] md:h-[64px] items-center brutalist-border-b hover-invert transition-none cursor-pointer py-3 md:py-0 ${isDebit ? 'opacity-80' : ''}`}
              >
                <div className="pl-4 font-data-md text-data-md text-xs md:text-sm">{formatDateFull(entry.created_at)}</div>
                <div className="font-data-md text-data-md text-xs md:text-sm">
                  {entry.entry_type === 'CREDIT' ? 'DEPOSIT' : 'PAYOUT'}
                </div>
                <div className={`text-right font-data-md text-data-md text-xs md:text-sm ${isDebit ? 'font-light opacity-80' : 'font-bold'}`}>
                  {isDebit ? '- ' : '+ '}{formatPaise(entry.amount_paise)}
                </div>
                <div className="text-right font-data-md text-data-md hidden md:block">
                  {entry.running_balance_paise != null ? formatPaise(entry.running_balance_paise) : '—'}
                </div>
                <div className="text-right pr-4 hidden md:block">
                  {entry.payout_id ? (
                    <Link
                      className="font-data-md text-data-md underline underline-offset-4"
                      to={`/payouts/${entry.payout_id}`}
                    >
                      {truncateId(entry.payout_id)} -&gt;
                    </Link>
                  ) : (
                    <span className="font-data-md text-data-md underline underline-offset-4 opacity-50">N/A</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-8 gap-4">
        <div className="font-ui-label-bold text-ui-label-bold uppercase tracking-widest text-xs">
          {totalCount > 0 ? `SHOWING ${startEntry}-${endEntry} OF ${totalCount} ENTRIES` : 'NO ENTRIES'}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => prevPage && setPage(page - 1)}
            disabled={!prevPage}
            className={`px-6 py-3 brutalist-border font-ui-label-bold text-ui-label-bold uppercase tracking-wider ${!prevPage ? 'opacity-50 cursor-not-allowed' : 'hover-invert transition-none'}`}
          >
            PREV
          </button>
          <button
            onClick={() => nextPage && setPage(page + 1)}
            disabled={!nextPage}
            className={`px-6 py-3 brutalist-border font-ui-label-bold text-ui-label-bold uppercase tracking-wider ${!nextPage ? 'opacity-50 cursor-not-allowed' : 'hover-invert transition-none'}`}
          >
            NEXT
          </button>
        </div>
      </div>
    </>
  );
}
