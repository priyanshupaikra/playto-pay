import React from 'react';
import { Link } from 'react-router-dom';

export default function Ledger() {
  return (
    <div  className="bg-white text-black min-h-screen flex flex-col font-data-md text-data-md selection:bg-black selection:text-white">
      
{/* TopNavBar (Shared Component) */}
<nav className="bg-white dark:bg-black text-black dark:text-white font-mono uppercase tracking-widest text-sm border-b border-black dark:border-white flex justify-between items-center w-full px-8 h-16 shrink-0">
<div className="font-serif text-2xl font-bold italic text-black dark:text-white">Playto.</div>
<div className="flex space-x-8">
<Link  className="text-black dark:text-white opacity-70 hover:bg-black hover:text-white transition-colors duration-75 px-2 py-1 scale-100 active:bg-black active:text-white" to="/dashboard">DASHBOARD</Link>
<Link  className="text-black dark:text-white opacity-70 hover:bg-black hover:text-white transition-colors duration-75 px-2 py-1 scale-100 active:bg-black active:text-white" to="/payouts">PAYOUTS</Link>
<Link  className="underline decoration-2 underline-offset-4 font-bold hover:bg-black hover:text-white transition-colors duration-75 px-2 py-1 scale-100 active:bg-black active:text-white" to="/ledger">LEDGER</Link>
<Link  className="text-black dark:text-white opacity-70 hover:bg-black hover:text-white transition-colors duration-75 px-2 py-1 scale-100 active:bg-black active:text-white" to="/settings">SETTINGS</Link>
</div>
</nav>
{/* Main Content Canvas */}
<main className="flex-grow w-full px-12 pt-16 pb-24">
{/* Header Section */}
<header className="mb-12">
<h1 className="font-editorial-display text-editorial-display mb-4">Ledger.</h1>
<p className="font-editorial-h2 text-editorial-h2 opacity-60 italic max-w-2xl">Balance is derived entirely from this ledger. Credits minus debits. Always.</p>
</header>
{/* Summary Bar */}
<section className="brutalist-border-t brutalist-border-b grid grid-cols-3 mb-16">
<div className="p-8 brutalist-border-r flex flex-col justify-between h-32 hover-invert transition-none">
<span className="font-ui-label-bold text-ui-label-bold uppercase tracking-wider">TOTAL CREDITS</span>
<span className="font-data-lg text-data-lg font-bold">+ $14,250,000.00</span>
</div>
<div className="p-8 brutalist-border-r flex flex-col justify-between h-32 hover-invert transition-none">
<span className="font-ui-label-bold text-ui-label-bold uppercase tracking-wider">TOTAL DEBITS</span>
<span className="font-data-lg text-data-lg">- $9,842,150.00</span>
</div>
<div className="p-8 flex flex-col justify-between h-32 hover-invert transition-none">
<span className="font-ui-label-bold text-ui-label-bold uppercase tracking-wider">NET BALANCE</span>
<span className="font-data-lg text-data-lg font-bold">$4,407,850.00</span>
</div>
</section>
{/* Ledger Table */}
<section className="mb-8">
<div className="w-full">
{/* Table Header */}
<div className="grid grid-cols-5 border-b-2 border-black pb-4 mb-2 font-ui-label-bold text-ui-label-bold uppercase tracking-wider">
<div className="pl-4">DATE</div>
<div>TYPE</div>
<div className="text-right">AMOUNT</div>
<div className="text-right">RUNNING BALANCE</div>
<div className="text-right pr-4">LINKED PAYOUT</div>
</div>
{/* Table Rows */}
{/* Credit Row */}
<div className="grid grid-cols-5 h-[64px] items-center brutalist-border-b hover-invert transition-none cursor-pointer">
<div className="pl-4 font-data-md text-data-md">2023-10-27 14:32:01</div>
<div className="font-data-md text-data-md">DEPOSIT</div>
<div className="text-right font-data-md text-data-md font-bold">+ $500,000.00</div>
<div className="text-right font-data-md text-data-md">$4,407,850.00</div>
<div className="text-right pr-4"><span className="font-data-md text-data-md underline underline-offset-4 opacity-50">N/A</span></div>
</div>
{/* Debit Row (60% opacity per spec, but hover should still invert clearly) */}
<div className="grid grid-cols-5 h-[64px] items-center brutalist-border-b hover-invert transition-none cursor-pointer opacity-80">
<div className="pl-4 font-data-md text-data-md">2023-10-26 09:15:22</div>
<div className="font-data-md text-data-md">PAYOUT_BATCH</div>
<div className="text-right font-data-md text-data-md font-light opacity-80">- $125,400.00</div>
<div className="text-right font-data-md text-data-md">$3,907,850.00</div>
<div className="text-right pr-4"><Link  className="font-data-md text-data-md underline underline-offset-4" to="/payouts/PAY-0042">PAY-0042 -&gt;</Link></div>
</div>
{/* Debit Row */}
<div className="grid grid-cols-5 h-[64px] items-center brutalist-border-b hover-invert transition-none cursor-pointer opacity-80">
<div className="pl-4 font-data-md text-data-md">2023-10-25 18:45:10</div>
<div className="font-data-md text-data-md">FEE_DEDUCTION</div>
<div className="text-right font-data-md text-data-md font-light opacity-80">- $4,200.00</div>
<div className="text-right font-data-md text-data-md">$4,033,250.00</div>
<div className="text-right pr-4"><span className="font-data-md text-data-md underline underline-offset-4 opacity-50">N/A</span></div>
</div>
{/* Credit Row */}
<div className="grid grid-cols-5 h-[64px] items-center brutalist-border-b hover-invert transition-none cursor-pointer">
<div className="pl-4 font-data-md text-data-md">2023-10-24 10:00:00</div>
<div className="font-data-md text-data-md">DEPOSIT</div>
<div className="text-right font-data-md text-data-md font-bold">+ $1,000,000.00</div>
<div className="text-right font-data-md text-data-md">$4,037,450.00</div>
<div className="text-right pr-4"><span className="font-data-md text-data-md underline underline-offset-4 opacity-50">N/A</span></div>
</div>
{/* Debit Row */}
<div className="grid grid-cols-5 h-[64px] items-center brutalist-border-b hover-invert transition-none cursor-pointer opacity-80">
<div className="pl-4 font-data-md text-data-md">2023-10-23 11:20:45</div>
<div className="font-data-md text-data-md">PAYOUT_BATCH</div>
<div className="text-right font-data-md text-data-md font-light opacity-80">- $890,500.00</div>
<div className="text-right font-data-md text-data-md">$3,037,450.00</div>
<div className="text-right pr-4"><Link  className="font-data-md text-data-md underline underline-offset-4" to="/payouts/PAY-0042">PAY-0041 -&gt;</Link></div>
</div>
</div>
</section>
{/* Pagination */}
<div className="flex justify-between items-center pt-8">
<div className="font-ui-label-bold text-ui-label-bold uppercase tracking-widest">
                SHOWING 1-20 OF 84 ENTRIES
            </div>
<div className="flex space-x-4">
<button className="px-6 py-3 brutalist-border font-ui-label-bold text-ui-label-bold uppercase tracking-wider hover-invert opacity-50 cursor-not-allowed">
                    PREV
                </button>
<button className="px-6 py-3 brutalist-border font-ui-label-bold text-ui-label-bold uppercase tracking-wider hover-invert transition-none">
                    NEXT
                </button>
</div>
</div>
</main>
{/* BottomNavBar (Mobile Only) - Hidden on md up */}
<nav className="md:hidden fixed bottom-0 left-0 w-full h-16 flex justify-around z-50 overflow-hidden bg-white dark:bg-black border-t border-black dark:border-white">
<Link  className="flex flex-col items-center justify-center h-full w-full text-black dark:text-white hover:bg-black hover:text-white" to="/dashboard">
<span className="material-symbols-outlined mb-1">dashboard</span>
<span className="font-mono uppercase text-[10px]">DASH</span>
</Link>
<Link  className="flex flex-col items-center justify-center h-full w-full text-black dark:text-white hover:bg-black hover:text-white" to="/payouts">
<span className="material-symbols-outlined mb-1">payments</span>
<span className="font-mono uppercase text-[10px]">PAY</span>
</Link>
<Link  className="bg-black text-white dark:bg-white dark:text-black flex flex-col items-center justify-center h-full w-full" to="/ledger">
<span className="material-symbols-outlined mb-1">receipt_long</span>
<span className="font-mono uppercase text-[10px]">LEDGER</span>
</Link>
<Link  className="flex flex-col items-center justify-center h-full w-full text-black dark:text-white hover:bg-black hover:text-white" to="/settings">
<span className="material-symbols-outlined mb-1">settings</span>
<span className="font-mono uppercase text-[10px]">SET</span>
</Link>
</nav>

    </div>
  );
}
