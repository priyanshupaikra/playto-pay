import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useMerchant } from '../context/MerchantContext';
import { getBalance, getLedger } from '../api/merchants';
import { getPayouts, createPayout } from '../api/payouts';
import { getBankAccounts } from '../api/bankAccounts';
import { formatPaise, formatDate, generateIdempotencyKey, truncateId } from '../utils/format';

export default function Dashboard() {
  const { currentMerchant } = useMerchant();
  const [balance, setBalance] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [recentPayouts, setRecentPayouts] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Withdraw form state
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(generateIdempotencyKey());
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const merchantId = currentMerchant?.id;

  const fetchData = useCallback(() => {
    if (!merchantId) return;
    Promise.all([
      getBalance(merchantId),
      getLedger(merchantId, 1),
      getPayouts(merchantId),
      getBankAccounts(merchantId),
    ])
      .then(([bal, ledger, payouts, banks]) => {
        setBalance(bal);
        setRecentEntries((ledger.results || ledger).slice(0, 4));
        setRecentPayouts(payouts.slice(0, 5));
        setBankAccounts(banks);
        if (banks.length > 0 && !selectedBank) {
          setSelectedBank(banks[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [merchantId]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  // Auto-refresh payouts every 5s
  useEffect(() => {
    if (!merchantId) return;
    const interval = setInterval(() => {
      getPayouts(merchantId).then((p) => setRecentPayouts(p.slice(0, 5))).catch(() => {});
      getBalance(merchantId).then(setBalance).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [merchantId]);

  const handlePayout = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    const amountPaise = Math.round(parseFloat(amount) * 100);
    if (!amountPaise || amountPaise < 100) {
      setMessage({ type: 'error', text: 'Minimum amount is ₹1.00' });
      setSubmitting(false);
      return;
    }

    try {
      const res = await createPayout(merchantId, {
        amount_paise: amountPaise,
        bank_account_id: selectedBank,
      }, idempotencyKey);

      if (res.status === 201) {
        setMessage({ type: 'success', text: `Payout created! ID: ${truncateId(res.data.id)}` });
      } else if (res.status === 200) {
        setMessage({ type: 'info', text: 'Duplicate request — payout already exists.' });
      }
      setAmount('');
      setIdempotencyKey(generateIdempotencyKey());
      fetchData();
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 402) {
        setMessage({ type: 'error', text: data.message || 'Insufficient balance.' });
      } else if (err.response?.status === 400) {
        setMessage({ type: 'error', text: data.message || data.error || 'Bad request.' });
      } else {
        setMessage({ type: 'error', text: 'Payout failed. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = recentPayouts.filter((p) => p.status === 'pending' || p.status === 'processing').length;

  if (loading) {
    return <div className="font-data-lg text-data-lg uppercase tracking-widest animate-pulse p-12">Loading dashboard...</div>;
  }

  return (
    <>
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row border-b border-primary w-full">
        {/* Left: Hero Headline & Balance */}
        <div className="w-full md:w-1/2 p-4 md:p-12 border-b md:border-b-0 md:border-r border-primary flex flex-col justify-center">
          <h1 className="font-editorial-display text-editorial-display tracking-tighter mb-12 break-words">Payout Engine.</h1>
          <div className="mt-auto border border-primary p-6 hover:bg-primary hover:text-on-primary transition-none group cursor-default">
            <span className="font-data-md text-data-md block mb-4 group-hover:text-on-primary opacity-70 group-hover:opacity-100">merchant balance</span>
            <span className="font-data-lg text-[48px] leading-none block mb-2">
              {balance?.available_formatted || '₹0.00'}
            </span>
            <span className="font-data-md text-data-md block opacity-50 group-hover:opacity-100">
              available · {balance?.held_formatted || '₹0.00'} held
            </span>
          </div>
        </div>
        {/* Right: Stats Grid */}
        <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2">
          <div className="border-b sm:border-r border-primary p-8 hover:bg-primary hover:text-on-primary transition-none flex flex-col justify-between group cursor-default min-h-[200px]">
            <span className="font-data-md text-data-md block opacity-50 group-hover:opacity-100 mb-8">01</span>
            <div>
              <h2 className="font-editorial-h2 text-editorial-h2 mb-2">Total Credits</h2>
              <span className="font-data-lg text-data-lg block font-bold group-hover:text-on-primary">
                {formatPaise(balance?.total_credits_paise || 0)}
              </span>
            </div>
          </div>
          <div className="border-b border-primary p-8 hover:bg-primary hover:text-on-primary transition-none flex flex-col justify-between group cursor-default min-h-[200px]">
            <span className="font-data-md text-data-md block opacity-50 group-hover:opacity-100 mb-8">02</span>
            <div>
              <h2 className="font-editorial-h2 text-editorial-h2 mb-2">Total Withdrawals</h2>
              <span className="font-data-lg text-data-lg block font-bold group-hover:text-on-primary">
                -{formatPaise(balance?.total_debits_paise || 0)}
              </span>
            </div>
          </div>
          <div className="border-b sm:border-b-0 sm:border-r border-primary p-8 hover:bg-primary hover:text-on-primary transition-none flex flex-col justify-between group cursor-default min-h-[200px]">
            <span className="font-data-md text-data-md block opacity-50 group-hover:opacity-100 mb-8">03</span>
            <div>
              <h2 className="font-editorial-h2 text-editorial-h2 mb-2">Pending Payouts</h2>
              <span className="font-data-lg text-data-lg block font-bold group-hover:text-on-primary">{pendingCount}</span>
            </div>
          </div>
          <div className="p-8 hover:bg-primary hover:text-on-primary transition-none flex flex-col justify-between group cursor-default min-h-[200px]">
            <span className="font-data-md text-data-md block opacity-50 group-hover:opacity-100 mb-8">04</span>
            <div>
              <h2 className="font-editorial-h2 text-editorial-h2 mb-2">Net Balance</h2>
              <span className="font-data-lg text-data-lg block font-bold group-hover:text-on-primary">
                {balance?.available_formatted || '₹0.00'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Lower Section: Transactions & Actions */}
      <section className="flex flex-col md:flex-row flex-1">
        {/* Recent Transactions */}
        <div className="w-full md:w-[60%] flex flex-col">
          <div className="border-b border-primary p-4 bg-primary text-on-primary">
            <h2 className="font-data-lg text-data-lg uppercase">Recent Transactions</h2>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-4 border-b border-primary p-4 bg-surface-container-low">
              <span className="font-ui-label-bold text-ui-label-bold uppercase">Date</span>
              <span className="font-ui-label-bold text-ui-label-bold uppercase col-span-2">Type</span>
              <span className="font-ui-label-bold text-ui-label-bold uppercase text-right">Amount</span>
            </div>
            {recentEntries.length === 0 && (
              <div className="p-8 text-center opacity-50 font-data-md text-data-md">No transactions yet.</div>
            )}
            {recentEntries.map((entry) => (
              <div key={entry.id} className="grid grid-cols-4 border-b border-primary p-4 hover:bg-primary hover:text-on-primary transition-none cursor-default group items-center">
                <span className="font-data-md text-data-md">{formatDate(entry.created_at)}</span>
                <span className={`font-data-md text-data-md col-span-2 ${entry.entry_type === 'DEBIT' ? 'opacity-50 group-hover:opacity-100' : 'font-bold'}`}>
                  {entry.entry_type}
                </span>
                <span className={`font-data-md text-data-md text-right ${entry.entry_type === 'DEBIT' ? 'opacity-50 group-hover:opacity-100' : ''}`}>
                  {entry.entry_type === 'CREDIT' ? '+' : '-'}{formatPaise(entry.amount_paise)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Withdraw Funds Form */}
        <div className="w-full md:w-[40%] border-l md:border-l-primary flex flex-col">
          <div className="border-b border-t md:border-t-0 border-primary p-4 bg-surface-container-highest">
            <h2 className="font-data-lg text-data-lg uppercase">Withdraw Funds</h2>
          </div>
          <form onSubmit={handlePayout} className="p-8 flex flex-col gap-8 flex-1">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-ui-label-bold text-ui-label-bold uppercase">Amount (₹)</label>
                <span className="text-[10px] opacity-50 uppercase">Stored as paise backend</span>
              </div>
              <input
                className="w-full border border-primary p-4 font-data-md text-data-md bg-transparent rounded-none focus:border-2 focus:border-primary placeholder-black/30"
                placeholder="₹0.00"
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-ui-label-bold text-ui-label-bold uppercase">Destination Bank</label>
              <select
                className="w-full border border-primary p-4 font-data-md text-data-md bg-transparent rounded-none focus:border-2 focus:border-primary cursor-pointer"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
              >
                {bankAccounts.map((ba) => (
                  <option key={ba.id} value={ba.id}>
                    {ba.bank_name} (****{ba.last4})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-ui-label-bold text-ui-label-bold uppercase">Idempotency Key</label>
              <div className="flex">
                <input
                  className="w-full border border-primary border-r-0 p-4 font-data-md text-data-md bg-surface-container-low rounded-none opacity-70 text-xs"
                  readOnly
                  type="text"
                  value={idempotencyKey}
                />
                <button
                  type="button"
                  onClick={() => setIdempotencyKey(generateIdempotencyKey())}
                  className="border border-primary bg-white text-black hover:bg-black hover:text-white px-4 font-ui-label-bold text-ui-label-bold uppercase transition-none rounded-none whitespace-nowrap"
                >
                  REGENERATE
                </button>
              </div>
            </div>

            {message && (
              <div className={`p-4 border font-data-md text-data-md text-xs uppercase tracking-wider ${
                message.type === 'error' ? 'border-red-500 bg-red-50 text-red-700' :
                message.type === 'success' ? 'border-green-600 bg-green-50 text-green-700' :
                'border-blue-500 bg-blue-50 text-blue-700'
              }`}>
                {message.text}
              </div>
            )}

            <div className="mt-auto pt-8 border-t border-primary border-dashed">
              <button
                type="submit"
                disabled={submitting}
                className="w-full border border-primary bg-primary text-on-primary hover:bg-white hover:text-primary p-6 font-ui-label-bold text-ui-label-bold uppercase transition-none rounded-none text-center flex justify-between items-center group disabled:opacity-50"
              >
                <span>{submitting ? 'PROCESSING...' : 'REQUEST PAYOUT'}</span>
                <span className="material-symbols-outlined transform group-hover:translate-x-2 transition-transform">arrow_forward</span>
              </button>
              <p className="font-data-md text-[10px] uppercase text-center mt-4 opacity-50 tracking-widest">
                FUNDS HELD UNTIL SETTLEMENT
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* Live Payout Status Section */}
      <section className="flex flex-col border-b border-primary w-full">
        <div className="border-b border-primary p-4 bg-surface-container-highest flex justify-between items-center">
          <h2 className="font-data-lg text-data-lg uppercase">Live Payout Status</h2>
          <span className="font-data-md text-[10px] uppercase opacity-70 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-completed animate-pulse"></span>
            Updates every 5s
          </span>
        </div>
        <div className="w-full font-data-md text-data-md">
          <div className="grid grid-cols-4 bg-surface-container-low border-b border-primary p-4 text-xs font-ui-label-bold text-ui-label-bold uppercase">
            <div>ID / KEY</div>
            <div>AMOUNT</div>
            <div>STATUS</div>
            <div className="text-right">TIME</div>
          </div>
          {recentPayouts.length === 0 && (
            <div className="p-8 text-center opacity-50 font-data-md text-data-md">No payouts yet.</div>
          )}
          {recentPayouts.map((payout) => {
            const isFailed = payout.status === 'failed';
            return (
              <Link
                to={`/payouts/${payout.id}`}
                key={payout.id}
                className={`grid grid-cols-4 items-center border-b border-primary border-opacity-10 p-4 hover:bg-primary hover:text-on-primary transition-none cursor-pointer group ${isFailed ? 'opacity-50' : ''}`}
              >
                <div className={`truncate pr-4 text-xs ${isFailed ? 'line-through' : ''}`}>
                  {truncateId(payout.idempotency_key || payout.id)}
                </div>
                <div className={isFailed ? 'line-through' : ''}>
                  {formatPaise(payout.amount_paise)}
                </div>
                <div className={
                  payout.status === 'completed' ? 'font-status-completed text-status-completed uppercase' :
                  payout.status === 'processing' ? 'font-status-processing text-status-processing italic' :
                  payout.status === 'pending' ? 'font-status-pending text-status-pending opacity-50 group-hover:opacity-100' :
                  'font-data-md text-data-md uppercase line-through'
                }>
                  {payout.status === 'processing' ? 'Processing...' : payout.status.toUpperCase()}
                </div>
                <div className="text-right opacity-70 group-hover:opacity-100">
                  {formatDate(payout.created_at)}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
