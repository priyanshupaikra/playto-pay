import React from 'react';
import { Link } from 'react-router-dom';

export default function Ledger() {
  return (
    <>
      
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

      {/* BottomNavBar (Mobile Only) - Hidden on md up */}

    </>
  );
}
