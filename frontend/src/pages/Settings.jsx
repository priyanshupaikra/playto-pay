import React, { useState, useEffect } from 'react';
import { useMerchant } from '../context/MerchantContext';
import { useAuth } from '../context/AuthContext';
import { getBankAccounts, addBankAccount, deleteBankAccount } from '../api/bankAccounts';

export default function Settings() {
  const { currentMerchant } = useMerchant();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [form, setForm] = useState({ account_holder: '', account_number: '', ifsc: '', bank_name: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('bank_accounts');

  const merchantId = currentMerchant?.id;

  const fetchAccounts = () => {
    if (!merchantId) return;
    getBankAccounts(merchantId).then(setAccounts).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); fetchAccounts(); }, [merchantId]);

  const handleDelete = async (id) => {
    if (!confirm('Remove this bank account?')) return;
    try {
      await deleteBankAccount(id);
      fetchAccounts();
    } catch { setMsg({ type: 'error', text: 'Failed to remove.' }); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addBankAccount(merchantId, form);
      setShowPanel(false);
      setForm({ account_holder: '', account_number: '', ifsc: '', bank_name: '' });
      fetchAccounts();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to add account.' });
    } finally { setSaving(false); }
  };

  const tabs = [
    { id: 'profile', label: 'PROFILE', icon: 'person' },
    { id: 'bank_accounts', label: 'BANK ACCOUNTS', icon: 'account_balance' },
    { id: 'api_keys', label: 'API KEYS', icon: 'key' },
  ];

  if (loading) return (
    <div className="animate-pulse">
      <header className="w-full border-b border-primary p-6 md:p-12">
        <div className="h-14 bg-surface-container-highest rounded w-1/4"></div>
      </header>
      <div className="flex overflow-x-auto border-b border-primary">
        {[1,2,3].map(i => <div key={i} className="p-4 min-w-[120px]"><div className="h-4 bg-surface-container-highest rounded w-2/3"></div></div>)}
      </div>
      <div className="p-6 md:p-8">
        <div className="h-6 bg-surface-container-highest rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-surface-container-highest rounded w-2/3 mb-8"></div>
        {[1,2].map(i => (
          <div key={i} className="border-b border-primary p-6 flex justify-between items-center">
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-5 bg-surface-container-highest rounded w-1/3"></div>
              <div className="h-4 bg-surface-container-highest rounded w-1/2"></div>
            </div>
            <div className="h-4 bg-surface-container-highest rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Page Header */}
      <header className="w-full border-b border-primary p-6 md:p-12">
        <h1 className="font-editorial-display text-editorial-display text-on-surface">Settings.</h1>
      </header>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 w-full">

        {/* Tab Navigation — horizontal on mobile, sidebar on desktop */}
        <div className="lg:col-span-3 lg:border-r border-primary">
          <nav className="flex lg:flex-col overflow-x-auto border-b lg:border-b-0 border-primary">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 lg:py-4 whitespace-nowrap lg:border-b border-primary font-ui-label-bold text-ui-label-bold uppercase text-xs lg:text-sm lg:justify-between transition-none flex-shrink-0
                  ${activeTab === tab.id
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface hover:bg-primary hover:text-on-primary'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  {tab.label}
                </span>
                <span className="material-symbols-outlined text-[16px] hidden lg:block">arrow_forward</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 flex flex-col">

          {/* === PROFILE TAB === */}
          {activeTab === 'profile' && (
            <>
              <div className="p-6 md:p-8 border-b border-primary bg-surface-container-low">
                <h2 className="font-data-lg text-data-lg uppercase">PROFILE</h2>
                <p className="font-data-md text-data-md text-outline mt-2">Your account information.</p>
              </div>
              <div className="flex flex-col">
                <div className="border-b border-primary p-6 md:p-8 flex flex-col gap-2">
                  <span className="font-ui-label-bold text-ui-label-bold uppercase text-xs tracking-wider opacity-60">FULL NAME</span>
                  <span className="font-editorial-h2 text-editorial-h2">{user?.full_name || user?.username || '—'}</span>
                </div>
                <div className="border-b border-primary p-6 md:p-8 flex flex-col gap-2">
                  <span className="font-ui-label-bold text-ui-label-bold uppercase text-xs tracking-wider opacity-60">EMAIL</span>
                  <span className="font-data-lg text-data-lg">{user?.email || '—'}</span>
                </div>
                <div className="border-b border-primary p-6 md:p-8 flex flex-col gap-2">
                  <span className="font-ui-label-bold text-ui-label-bold uppercase text-xs tracking-wider opacity-60">MERCHANT</span>
                  <span className="font-data-lg text-data-lg">{currentMerchant?.name || '—'}</span>
                </div>
                <div className="border-b border-primary p-6 md:p-8 flex flex-col gap-2">
                  <span className="font-ui-label-bold text-ui-label-bold uppercase text-xs tracking-wider opacity-60">MERCHANT ID</span>
                  <span className="font-data-md text-data-md break-all">{currentMerchant?.id || '—'}</span>
                </div>
              </div>
            </>
          )}

          {/* === BANK ACCOUNTS TAB === */}
          {activeTab === 'bank_accounts' && (
            <>
              <div className="p-6 md:p-8 border-b border-primary bg-surface-container-low">
                <h2 className="font-data-lg text-data-lg uppercase">BANK ACCOUNTS</h2>
                <p className="font-data-md text-data-md text-outline mt-2">Manage your payout destinations. Primary accounts are used by default.</p>
              </div>

              {msg && (
                <div className={`p-4 m-6 border text-xs uppercase ${msg.type === 'error' ? 'border-red-500 text-red-600' : 'border-green-500 text-green-600'}`}>{msg.text}</div>
              )}

              <div className="flex flex-col">
                {accounts.length === 0 && (
                  <div className="p-8 text-center opacity-50">No bank accounts added yet.</div>
                )}
                {accounts.map((acct) => (
                  <div key={acct.id} className="border-b border-primary p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-primary hover:text-on-primary group transition-none cursor-pointer">
                    <div className="flex flex-col gap-2 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-editorial-h2 text-editorial-h2 group-hover:text-on-primary">{acct.bank_name}</h3>
                        {acct.is_primary && (
                          <span className="border border-primary group-hover:border-on-primary px-2 py-0.5 font-status-completed text-status-completed group-hover:text-on-primary text-xs">PRIMARY</span>
                        )}
                      </div>
                      <div className="font-data-md text-data-md text-on-surface-variant group-hover:text-on-primary flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm">
                        <span>{acct.masked_number}</span>
                        <span>IFSC: {acct.ifsc}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <button onClick={() => handleDelete(acct.id)} className="font-ui-label-bold text-ui-label-bold uppercase underline hover:no-underline text-error group-hover:text-error-container text-xs">REMOVE</button>
                    </div>
                  </div>
                ))}
                <div className="p-6 md:p-8">
                  <button onClick={() => setShowPanel(true)} className="w-full border border-primary p-4 font-ui-label-bold text-ui-label-bold uppercase flex justify-between items-center hover:bg-primary hover:text-on-primary transition-none text-xs md:text-sm">
                    <span>ADD BANK ACCOUNT</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* === API KEYS TAB === */}
          {activeTab === 'api_keys' && (
            <>
              <div className="p-6 md:p-8 border-b border-primary bg-surface-container-low">
                <h2 className="font-data-lg text-data-lg uppercase">API KEYS</h2>
                <p className="font-data-md text-data-md text-outline mt-2">Manage your API credentials for integrating with the Playto payout engine.</p>
              </div>
              <div className="flex flex-col">
                <div className="border-b border-primary p-6 md:p-8 flex flex-col gap-2">
                  <span className="font-ui-label-bold text-ui-label-bold uppercase text-xs tracking-wider opacity-60">MERCHANT API KEY</span>
                  <div className="flex items-center gap-3 flex-wrap">
                    <code className="font-data-md text-data-md bg-surface-container-highest px-3 py-2 break-all text-xs md:text-sm">{currentMerchant?.id || '—'}</code>
                  </div>
                </div>
                <div className="border-b border-primary p-6 md:p-8 flex flex-col gap-2">
                  <span className="font-ui-label-bold text-ui-label-bold uppercase text-xs tracking-wider opacity-60">ENVIRONMENT</span>
                  <span className="font-data-lg text-data-lg">PRODUCTION</span>
                </div>
                <div className="border-b border-primary p-6 md:p-8 flex flex-col gap-2">
                  <span className="font-ui-label-bold text-ui-label-bold uppercase text-xs tracking-wider opacity-60">API BASE URL</span>
                  <code className="font-data-md text-data-md bg-surface-container-highest px-3 py-2 break-all text-xs md:text-sm">https://playto-pay-dtei.onrender.com/api/v1/</code>
                </div>
                <div className="p-6 md:p-8 opacity-50">
                  <p className="font-data-md text-data-md text-xs uppercase">Full API key management coming soon. Use the merchant ID above for authenticated requests.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Slide-over Panel */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-surface-container-highest/80 backdrop-blur-sm" onClick={() => setShowPanel(false)}></div>
          <div className="relative w-full max-w-md bg-surface-container-lowest h-full border-l border-primary shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-primary">
              <h2 className="font-data-lg text-data-lg uppercase">ADD BANK ACCOUNT</h2>
              <button onClick={() => setShowPanel(false)} className="font-ui-label-bold uppercase flex items-center gap-1 hover:text-outline transition-none">X CLOSE</button>
            </div>
            <form onSubmit={handleAdd} className="flex-grow p-6 overflow-y-auto flex flex-col gap-6">
              {['account_holder', 'account_number', 'ifsc', 'bank_name'].map((field) => (
                <div key={field} className="flex flex-col gap-2">
                  <label className="font-data-md text-data-md uppercase text-xs">{field.replace('_', ' ')}</label>
                  <input
                    className="w-full border border-primary p-3 bg-transparent font-data-md text-data-md rounded-none"
                    placeholder={field === 'ifsc' ? 'ABCD0001234' : ''}
                    type="text"
                    required
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  />
                </div>
              ))}
              <div className="mt-auto p-6 border-t border-primary">
                <button type="submit" disabled={saving} className="w-full bg-primary text-on-primary border border-primary p-4 font-ui-label-bold uppercase flex justify-center items-center gap-2 hover:bg-surface-container-lowest hover:text-on-surface transition-none disabled:opacity-50">
                  {saving ? 'SAVING...' : 'SAVE BANK ACCOUNT'} <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
