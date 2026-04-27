import React from 'react';
import { Link } from 'react-router-dom';

export default function PayoutDetails() {
  return (
    <>
      
<div className="px-8 pb-8">
<Link  className="inline-flex items-center space-x-2 text-on-surface opacity-50 hover:opacity-100 transition-opacity" to="/payouts">
<span className="material-symbols-outlined text-sm">arrow_back</span>
<span className="font-data-md text-data-md tracking-widest uppercase">&lt;- BACK TO PAYOUTS</span>
</Link>
<h1 className="font-editorial-h1 text-editorial-h1 mt-8 pb-8 border-b border-tertiary">Payout #PAY-0042.</h1>
</div>
<div className="flex-grow flex flex-col md:flex-row w-full border-t border-tertiary mt-[-1px]">
{/* Left Column: Details */}
<div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-tertiary flex flex-col">
<div className="p-8 border-b border-tertiary flex flex-col md:flex-row justify-between items-start md:items-center">
<span className="font-data-md text-data-md opacity-50 uppercase tracking-widest">AMOUNT</span>
<span className="font-ui-label-bold text-ui-label-bold text-xl mt-2 md:mt-0">$12,450.00</span>
</div>
<div className="p-8 border-b border-tertiary flex flex-col md:flex-row justify-between items-start md:items-center">
<span className="font-data-md text-data-md opacity-50 uppercase tracking-widest">STATUS</span>
<span className="font-status-completed text-status-completed uppercase mt-2 md:mt-0">COMPLETED</span>
</div>
<div className="p-8 border-b border-tertiary flex flex-col md:flex-row justify-between items-start md:items-center">
<span className="font-data-md text-data-md opacity-50 uppercase tracking-widest">BANK ACCOUNT</span>
<span className="font-ui-label-bold text-ui-label-bold mt-2 md:mt-0">CHASE •••• 4092</span>
</div>
<div className="p-8 border-b border-tertiary flex flex-col md:flex-row justify-between items-start md:items-center">
<span className="font-data-md text-data-md opacity-50 uppercase tracking-widest">IDEMPOTENCY KEY</span>
<span className="font-data-md text-data-md mt-2 md:mt-0 break-all text-right">req_93kd92jd83js82k</span>
</div>
<div className="p-8 border-b border-tertiary flex flex-col md:flex-row justify-between items-start md:items-center">
<span className="font-data-md text-data-md opacity-50 uppercase tracking-widest">CREATED</span>
<span className="font-data-md text-data-md mt-2 md:mt-0 text-right">OCT 24, 2023 - 14:02:11 UTC</span>
</div>
<div className="p-8 border-b border-tertiary flex flex-col md:flex-row justify-between items-start md:items-center">
<span className="font-data-md text-data-md opacity-50 uppercase tracking-widest">UPDATED</span>
<span className="font-data-md text-data-md mt-2 md:mt-0 text-right">OCT 25, 2023 - 09:15:44 UTC</span>
</div>
{/* Failed / Action Box Example */}
{/* <div className="m-8 border border-tertiary p-6 flex items-center justify-center bg-surface-container-highest">
                    <span className="font-data-md text-data-md uppercase text-center">FUNDS RETURNED TO BALANCE</span>
                </div> */}
</div>
{/* Right Column: Timeline */}
<div className="w-full md:w-1/2 p-8 md:pl-12 flex flex-col bg-surface-bright">
<h2 className="font-data-md text-data-md uppercase tracking-widest mb-12 opacity-50">PAYOUT LIFECYCLE</h2>
<div className="relative border-l border-tertiary ml-3 flex flex-col space-y-12 pb-12">
{/* Step 1 */}
<div className="relative pl-10 flex flex-col items-start">
<div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-tertiary border border-tertiary"></div>
<span className="font-data-md text-data-md opacity-50 mb-2">OCT 24, 14:02:11 UTC</span>
<h3 className="font-editorial-h2 text-editorial-h2 mb-2">Initiated</h3>
<p className="font-data-md text-data-md opacity-70">Payout request received via API.</p>
</div>
{/* Step 2 */}
<div className="relative pl-10 flex flex-col items-start">
<div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-tertiary border border-tertiary"></div>
<span className="font-data-md text-data-md opacity-50 mb-2">OCT 24, 14:05:22 UTC</span>
<h3 className="font-editorial-h2 text-editorial-h2 mb-2">Processing</h3>
<p className="font-data-md text-data-md opacity-70">Funds debited from platform ledger and transmitted to banking partner.</p>
</div>
{/* Step 3 */}
<div className="relative pl-10 flex flex-col items-start">
<div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-tertiary border border-tertiary"></div>
<span className="font-data-md text-data-md opacity-50 mb-2">OCT 25, 09:15:44 UTC</span>
<h3 className="font-editorial-h2 text-editorial-h2 mb-2">Settled</h3>
<p className="font-data-md text-data-md opacity-70">Banking partner confirmed successful deposit to destination account.</p>
</div>
</div>
</div>
</div>

      
    </>
  );
}
