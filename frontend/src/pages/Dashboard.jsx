import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <>
      
{/* Hero Section */}
<section className="flex flex-col md:flex-row border-b border-primary w-full">
{/* Left: Hero Headline & Balance */}
<div className="w-full md:w-1/2 p-4 md:p-12 border-b md:border-b-0 md:border-r border-primary flex flex-col justify-center">
<h1 className="font-editorial-display text-editorial-display tracking-tighter mb-12 break-words">Payout Engine.</h1>
<div className="mt-auto border border-primary p-6 hover:bg-primary hover:text-on-primary transition-none group cursor-default">
<span className="font-data-md text-data-md block mb-4 group-hover:text-on-primary opacity-70 group-hover:opacity-100">merchant balance</span>
<span className="font-data-lg text-[48px] leading-none block mb-2">₹4,320.00</span>
<span className="font-data-md text-data-md block opacity-50 group-hover:opacity-100">available · ₹1,200.00 held</span>
</div>
</div>
{/* Right: Stats Grid */}
<div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2">
{/* Stat 01 */}
<div className="border-b sm:border-r border-primary p-8 hover:bg-primary hover:text-on-primary transition-none flex flex-col justify-between group cursor-default min-h-[200px]">
<span className="font-data-md text-data-md block opacity-50 group-hover:opacity-100 mb-8">01</span>
<div>
<h2 className="font-editorial-h2 text-editorial-h2 mb-2">Total Credits</h2>
<span className="font-data-lg text-data-lg block font-bold group-hover:text-on-primary">₹12,450.00</span>
</div>
</div>
{/* Stat 02 */}
<div className="border-b border-primary p-8 hover:bg-primary hover:text-on-primary transition-none flex flex-col justify-between group cursor-default min-h-[200px]">
<span className="font-data-md text-data-md block opacity-50 group-hover:opacity-100 mb-8">02</span>
<div>
<h2 className="font-editorial-h2 text-editorial-h2 mb-2">Total Withdrawals</h2>
<span className="font-data-lg text-data-lg block font-bold group-hover:text-on-primary">-₹8,130.00</span>
</div>
</div>
{/* Stat 03 */}
<div className="border-b sm:border-b-0 sm:border-r border-primary p-8 hover:bg-primary hover:text-on-primary transition-none flex flex-col justify-between group cursor-default min-h-[200px]">
<span className="font-data-md text-data-md block opacity-50 group-hover:opacity-100 mb-8">03</span>
<div>
<h2 className="font-editorial-h2 text-editorial-h2 mb-2">Pending Payouts</h2>
<span className="font-data-lg text-data-lg block font-bold group-hover:text-on-primary">2</span>
</div>
</div>
{/* Stat 04 */}
<div className="p-8 hover:bg-primary hover:text-on-primary transition-none flex flex-col justify-between group cursor-default min-h-[200px]">
<span className="font-data-md text-data-md block opacity-50 group-hover:opacity-100 mb-8">04</span>
<div>
<h2 className="font-editorial-h2 text-editorial-h2 mb-2">Net Growth</h2>
<span className="font-data-lg text-data-lg block font-bold group-hover:text-on-primary">+14.2%</span>
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
{/* Table Header */}
<div className="grid grid-cols-4 border-b border-primary p-4 bg-surface-container-low">
<span className="font-ui-label-bold text-ui-label-bold uppercase">Date</span>
<span className="font-ui-label-bold text-ui-label-bold uppercase col-span-2">Type</span>
<span className="font-ui-label-bold text-ui-label-bold uppercase text-right">Amount</span>
</div>
{/* Row 1 */}
<div className="grid grid-cols-4 border-b border-primary p-4 hover:bg-primary hover:text-on-primary transition-none cursor-default group items-center">
<span className="font-data-md text-data-md">Oct 24</span>
<span className="font-data-md text-data-md font-bold col-span-2">CREDIT</span>
<span className="font-data-md text-data-md text-right">+₹5,000.00</span>
</div>
{/* Row 2 */}
<div className="grid grid-cols-4 border-b border-primary p-4 hover:bg-primary hover:text-on-primary transition-none cursor-default group items-center">
<span className="font-data-md text-data-md">Oct 23</span>
<span className="font-data-md text-data-md opacity-50 group-hover:opacity-100 col-span-2">DEBIT</span>
<span className="font-data-md text-data-md text-right opacity-50 group-hover:opacity-100">-₹1,200.00</span>
</div>
{/* Row 3 */}
<div className="grid grid-cols-4 border-b border-primary p-4 hover:bg-primary hover:text-on-primary transition-none cursor-default group items-center">
<span className="font-data-md text-data-md">Oct 21</span>
<span className="font-data-md text-data-md font-bold col-span-2">CREDIT</span>
<span className="font-data-md text-data-md text-right">+₹2,500.00</span>
</div>
{/* Row 4 */}
<div className="grid grid-cols-4 border-b border-primary p-4 hover:bg-primary hover:text-on-primary transition-none cursor-default group items-center">
<span className="font-data-md text-data-md">Oct 19</span>
<span className="font-data-md text-data-md opacity-50 group-hover:opacity-100 col-span-2">DEBIT</span>
<span className="font-data-md text-data-md text-right opacity-50 group-hover:opacity-100">-₹500.00</span>
</div>
</div>
</div>
{/* Withdraw Funds Form */}
<div className="w-full md:w-[40%] border-l md:border-l-primary flex flex-col">
<div className="border-b border-t md:border-t-0 border-primary p-4 bg-surface-container-highest">
<h2 className="font-data-lg text-data-lg uppercase">Withdraw Funds</h2>
</div>
<div className="p-8 flex flex-col gap-8 flex-1">
<div className="flex flex-col gap-2">
<div className="flex justify-between items-center">
  <label className="font-ui-label-bold text-ui-label-bold uppercase">Amount (₹)</label>
  <span className="text-[10px] opacity-50 uppercase">Stored as paise backend</span>
</div>
<input className="w-full border border-primary p-4 font-data-md text-data-md bg-transparent rounded-none focus:border-2 focus:border-primary placeholder-black/30" placeholder="₹0.00" type="text"/>
</div>
<div className="flex flex-col gap-2">
<label className="font-ui-label-bold text-ui-label-bold uppercase">Destination Bank</label>
<select className="w-full border border-primary p-4 font-data-md text-data-md bg-transparent rounded-none focus:border-2 focus:border-primary cursor-pointer">
<option>HDFC Bank (****1234)</option>
<option>SBI (****5678)</option>
</select>
</div>
<div className="flex flex-col gap-2">
<label className="font-ui-label-bold text-ui-label-bold uppercase">Idempotency Key</label>
<div className="flex">
<input className="w-full border border-primary border-r-0 p-4 font-data-md text-data-md bg-surface-container-low rounded-none opacity-70 text-xs" readonly="" type="text" value="550e8400-e29b-41d4-a716-446655440000"/>
<button className="border border-primary bg-white text-black hover:bg-black hover:text-white px-4 font-ui-label-bold text-ui-label-bold uppercase transition-none rounded-none whitespace-nowrap">
                                REGENERATE
                            </button>
</div>
</div>
<div className="mt-auto pt-8 border-t border-primary border-dashed">
<button className="w-full border border-primary bg-primary text-on-primary hover:bg-white hover:text-primary p-6 font-ui-label-bold text-ui-label-bold uppercase transition-none rounded-none text-center flex justify-between items-center group">
<span>REQUEST PAYOUT</span>
<span className="material-symbols-outlined transform group-hover:translate-x-2 transition-transform">arrow_forward</span>
</button>
<p className="font-data-md text-[10px] uppercase text-center mt-4 opacity-50 tracking-widest">
                            FUNDS HELD UNTIL SETTLEMENT
                        </p>
</div>
</div>
</div>
</section>
{/* Live Payout History Section */}
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
{/* Processing Row */}
<div className="grid grid-cols-4 items-center border-b border-primary border-opacity-10 p-4 hover:bg-primary hover:text-on-primary transition-none cursor-default group">
<div className="truncate pr-4 text-xs">550e8400...4001</div>
<div>₹8,100.00</div>
<div className="font-status-processing text-status-processing italic">Processing...</div>
<div className="text-right opacity-70 group-hover:opacity-100">Oct 24, 14:28</div>
</div>
{/* Completed Row */}
<div className="grid grid-cols-4 items-center border-b border-primary border-opacity-10 p-4 hover:bg-primary hover:text-on-primary transition-none cursor-default group">
<div className="truncate pr-4 text-xs">550e8400...4002</div>
<div>₹42,500.00</div>
<div className="font-status-completed text-status-completed uppercase">COMPLETED</div>
<div className="text-right opacity-70 group-hover:opacity-100">Oct 24, 11:15</div>
</div>
{/* Failed Row */}
<div className="grid grid-cols-4 items-center p-4 hover:bg-primary hover:text-on-primary transition-none cursor-default group opacity-50">
<div className="truncate pr-4 text-xs line-through">550e8400...4003</div>
<div className="line-through">₹5,000.00</div>
<div className="font-data-md text-data-md uppercase line-through">FAILED</div>
<div className="text-right line-through">Oct 23, 10:05</div>
</div>
</div>
</section>

      
    </>
  );
}
