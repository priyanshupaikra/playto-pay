import React from 'react';
import { Link } from 'react-router-dom';

export default function Settings() {
  return (
    <>
      
{/* Page Header */}
<header className="w-full border-b border-primary p-8 md:p-12">
<h1 className="font-editorial-display text-editorial-display text-on-surface">Settings.</h1>
</header>
<div className="flex-grow grid grid-cols-1 lg:grid-cols-12 w-full">
{/* Settings Navigation (In-page) */}
<div className="lg:col-span-3 border-r border-primary border-b lg:border-b-0 hidden lg:block">
<nav className="flex flex-col">
<Link  className="p-4 border-b border-primary font-ui-label-bold text-ui-label-bold uppercase hover:bg-primary hover:text-on-primary transition-none flex justify-between items-center" to="#">
                        PROFILE
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</Link>
<Link  className="p-4 border-b border-primary bg-primary text-on-primary font-ui-label-bold text-ui-label-bold uppercase flex justify-between items-center" to="#">
                        BANK ACCOUNTS
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</Link>
<Link  className="p-4 border-b border-primary font-ui-label-bold text-ui-label-bold uppercase hover:bg-primary hover:text-on-primary transition-none flex justify-between items-center" to="#">
                        API KEYS
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</Link>
<Link  className="p-4 border-b border-primary font-ui-label-bold text-ui-label-bold uppercase hover:bg-primary hover:text-on-primary transition-none flex justify-between items-center text-error hover:bg-error hover:text-on-error" to="#">
                        DANGER ZONE
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</Link>
</nav>
</div>
{/* Settings Content */}
<div className="lg:col-span-9 flex flex-col">
{/* Section Header */}
<div className="p-6 md:p-8 border-b border-primary bg-surface-container-low">
<h2 className="font-data-lg text-data-lg uppercase text-on-surface">BANK ACCOUNTS</h2>
<p className="font-data-md text-data-md text-outline mt-2">Manage your payout destinations. Primary accounts are used by default.</p>
</div>
{/* Accounts List */}
<div className="flex flex-col">
{/* Account Item 1 (Primary) */}
<div className="border-b border-primary p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-primary hover:text-on-primary group transition-none cursor-pointer">
<div className="flex flex-col gap-2">
<div className="flex items-center gap-3">
<h3 className="font-editorial-h2 text-editorial-h2 group-hover:text-on-primary">JPMorgan Chase</h3>
<span className="border border-primary group-hover:border-on-primary px-2 py-0.5 font-status-completed text-status-completed group-hover:text-on-primary">PRIMARY</span>
</div>
<div className="font-data-md text-data-md text-on-surface-variant group-hover:text-on-primary flex gap-4">
<span>**** **** **** 4920</span>
<span>IFSC: JPMC0000123</span>
</div>
</div>
<div className="flex items-center gap-4">
<button className="font-ui-label-bold text-ui-label-bold uppercase underline hover:no-underline text-error group-hover:text-error-container">REMOVE</button>
</div>
</div>
{/* Account Item 2 */}
<div className="border-b border-primary p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-primary hover:text-on-primary group transition-none cursor-pointer">
<div className="flex flex-col gap-2">
<div className="flex items-center gap-3">
<h3 className="font-editorial-h2 text-editorial-h2 group-hover:text-on-primary">Silicon Valley Bank</h3>
</div>
<div className="font-data-md text-data-md text-on-surface-variant group-hover:text-on-primary flex gap-4">
<span>**** **** **** 8812</span>
<span>IFSC: SVBK0000012</span>
</div>
</div>
<div className="flex items-center gap-4">
<button className="font-ui-label-bold text-ui-label-bold uppercase underline hover:no-underline group-hover:text-on-primary">SET PRIMARY</button>
<button className="font-ui-label-bold text-ui-label-bold uppercase underline hover:no-underline text-error group-hover:text-error-container">REMOVE</button>
</div>
</div>
{/* Add New Button Row */}
<div className="p-6 md:p-8">
<button className="w-full border border-primary p-4 font-ui-label-bold text-ui-label-bold uppercase flex justify-between items-center hover:bg-primary hover:text-on-primary transition-none">
<span>ADD BANK ACCOUNT</span>
<span className="material-symbols-outlined">arrow_forward</span>
</button>
</div>
</div>
</div>
</div>

      {/* BottomNavBar (Mobile) */}

{/* Slide-over Panel (Add Bank Account) - Hidden by default, rendered for demonstration */}
<div className="fixed inset-0 z-50 flex justify-end pointer-events-none hidden">
{/* Backdrop */}
<div className="absolute inset-0 bg-surface-container-highest/80 backdrop-blur-sm pointer-events-auto"></div>
{/* Panel */}
<div className="relative w-full max-w-md bg-surface-container-lowest h-full border-l border-primary shadow-2xl flex flex-col pointer-events-auto">
<div className="flex justify-between items-center p-6 border-b border-primary">
<h2 className="font-data-lg text-data-lg uppercase text-on-surface">ADD BANK ACCOUNT</h2>
<button className="font-ui-label-bold text-ui-label-bold uppercase flex items-center gap-1 hover:text-outline transition-none">
                    X CLOSE
                </button>
</div>
<div className="flex-grow p-6 overflow-y-auto flex flex-col gap-6">
<div className="flex flex-col gap-2">
<label className="font-data-md text-data-md uppercase text-on-surface">Account Holder Name</label>
<input className="w-full border border-primary p-3 bg-transparent font-data-md text-data-md focus:border-primary focus:ring-0 focus:border-b-2 placeholder:text-outline placeholder:opacity-50 transition-none rounded-none" placeholder="PLAYTO LLC" type="text"/>
</div>
<div className="flex flex-col gap-2">
<label className="font-data-md text-data-md uppercase text-on-surface">Account Number</label>
<input className="w-full border border-primary p-3 bg-transparent font-data-md text-data-md focus:border-primary focus:ring-0 focus:border-b-2 placeholder:text-outline placeholder:opacity-50 transition-none rounded-none" placeholder="0000000000" type="text"/>
</div>
<div className="flex flex-col gap-2">
<label className="font-data-md text-data-md uppercase text-on-surface">IFSC Code</label>
<input className="w-full border border-primary p-3 bg-transparent font-data-md text-data-md focus:border-primary focus:ring-0 focus:border-b-2 placeholder:text-outline placeholder:opacity-50 transition-none rounded-none" placeholder="ABCD0001234" type="text"/>
</div>
</div>
<div className="p-6 border-t border-primary bg-surface-container-lowest mt-auto">
<button className="w-full bg-primary text-on-primary border border-primary p-4 font-ui-label-bold text-ui-label-bold uppercase flex justify-center items-center gap-2 hover:bg-surface-container-lowest hover:text-on-surface transition-none">
                    SAVE BANK ACCOUNT <span className="material-symbols-outlined">arrow_forward</span>
</button>
</div>
</div>
</div>
    </>
  );
}
