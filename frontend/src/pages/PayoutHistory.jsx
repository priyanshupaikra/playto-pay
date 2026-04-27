import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function PayoutHistory() {
  const [filter, setFilter] = useState('ALL');

  const showCompleted = filter === 'ALL' || filter === 'COMPLETED';
  const showProcessing = filter === 'ALL' || filter === 'PROCESSING';
  const showPending = filter === 'ALL' || filter === 'PENDING';
  const showFailed = filter === 'ALL' || filter === 'FAILED';

  const getFilterClass = (status) => {
    if (filter === status) {
      return "underline decoration-2 underline-offset-4 font-bold text-primary";
    }
    return "opacity-70 hover:opacity-100 hover:text-primary transition-opacity";
  };

  return (
    <>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-primary pb-8">
        <h1 className="font-editorial-display text-editorial-display">Payout History.</h1>
        <div className="font-data-md text-data-md opacity-70 mt-4 md:mt-0">Live updates every 10s</div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-8 mb-8 font-data-md text-data-md uppercase text-xs">
        <button className={getFilterClass('ALL')} onClick={() => setFilter('ALL')}>ALL</button>
        <button className={getFilterClass('PENDING')} onClick={() => setFilter('PENDING')}>PENDING</button>
        <button className={getFilterClass('PROCESSING')} onClick={() => setFilter('PROCESSING')}>PROCESSING</button>
        <button className={getFilterClass('COMPLETED')} onClick={() => setFilter('COMPLETED')}>COMPLETED</button>
        <button className={getFilterClass('FAILED')} onClick={() => setFilter('FAILED')}>FAILED</button>
      </div>

      {/* Data Table */}
      <div className="w-full border border-primary font-data-md text-data-md">
        {/* Table Header */}
        <div className="grid grid-cols-5 bg-surface-container-lowest border-b border-primary p-4 text-xs font-ui-label-bold text-ui-label-bold uppercase">
          <div>ID</div>
          <div>BANK ACCOUNT</div>
          <div>AMOUNT</div>
          <div>STATUS</div>
          <div className="text-right">DATE</div>
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          
          {showCompleted && (
            <div className="grid grid-cols-5 items-center border-b border-primary border-opacity-10 p-4 hover:bg-primary hover:text-on-primary transition-colors cursor-pointer group">
              <div className="truncate pr-4">PO_09218A</div>
              <div className="truncate pr-4">JPM Chase ****4912</div>
              <div>$42,500.00</div>
              <div className="font-status-completed text-status-completed uppercase">COMPLETED</div>
              <div className="text-right opacity-70 group-hover:opacity-100">Oct 12, 14:32</div>
            </div>
          )}

          {showProcessing && (
            <div className="grid grid-cols-5 items-center border-b border-primary border-opacity-10 p-4 hover:bg-primary hover:text-on-primary transition-colors cursor-pointer group">
              <div className="truncate pr-4">PO_09218B</div>
              <div className="truncate pr-4">Wells Fargo ****1190</div>
              <div>$8,100.00</div>
              <div className="font-status-processing text-status-processing italic">Processing...</div>
              <div className="text-right opacity-70 group-hover:opacity-100">Oct 12, 14:28</div>
            </div>
          )}

          {showPending && (
            <div className="grid grid-cols-5 items-center border-b border-primary border-opacity-10 p-4 hover:bg-primary hover:text-on-primary transition-colors cursor-pointer group">
              <div className="truncate pr-4">PO_09218C</div>
              <div className="truncate pr-4">Bank of America ****8821</div>
              <div>$12,450.00</div>
              <div className="font-status-pending text-status-pending opacity-50 group-hover:opacity-100">Pending</div>
              <div className="text-right opacity-70 group-hover:opacity-100">Oct 12, 14:15</div>
            </div>
          )}

          {/* Expanded Row Example (Processing) */}
          {showProcessing && (
            <div className="flex flex-col border-b border-primary border-opacity-10">
              <div className="grid grid-cols-5 items-center p-4 bg-surface-container-high border-b border-primary border-opacity-10 cursor-pointer">
                <div className="truncate pr-4 font-bold">PO_09218D</div>
                <div className="truncate pr-4">Citibank ****3314</div>
                <div className="font-bold">$150,000.00</div>
                <div className="font-status-processing text-status-processing italic">Processing...</div>
                <div className="text-right">Oct 12, 14:00</div>
              </div>
              {/* Expanded Content */}
              <div className="p-8 bg-surface-container-lowest grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Details */}
                <div className="flex flex-col gap-4">
                  <div className="font-ui-label-bold text-ui-label-bold uppercase border-b border-primary pb-2">Attempt History</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="opacity-70">Initiated:</span> <span>System User</span>
                    <span className="opacity-70">Source:</span> <span>Main Operating Acct</span>
                    <span className="opacity-70">Attempts:</span> <span>1 / 3</span>
                    <span className="opacity-70">Est. Settlement:</span> <span>Oct 13, EOD</span>
                  </div>
                </div>
                {/* Stepper */}
                <div className="flex flex-col gap-4 justify-center">
                  <div className="flex items-center justify-between relative">
                    {/* Track */}
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-primary opacity-20 -z-10"></div>
                    <div className="absolute top-1/2 left-0 w-1/2 h-[1px] bg-primary -z-10"></div>
                    {/* Steps */}
                    <div className="flex flex-col items-center gap-2 bg-surface-container-lowest px-2">
                      <div className="w-2 h-2 bg-primary border border-primary"></div>
                      <span className="text-[10px] font-bold uppercase">Created</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 bg-surface-container-lowest px-2">
                      <div className="w-2 h-2 bg-surface-container-lowest border border-primary border-2"></div>
                      <span className="text-[10px] italic">Processing</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 bg-surface-container-lowest px-2">
                      <div className="w-2 h-2 bg-surface-container-lowest border border-primary opacity-20"></div>
                      <span className="text-[10px] opacity-50 uppercase">Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showFailed && (
            <div className="grid grid-cols-5 items-center border-b border-primary border-opacity-10 p-4 hover:bg-primary hover:text-on-primary transition-colors cursor-pointer group opacity-50">
              <div className="truncate pr-4 line-through">PO_09218E</div>
              <div className="truncate pr-4 line-through">Silicon Valley Bank ****0012</div>
              <div className="line-through">$5,000.00</div>
              <div className="font-data-md text-data-md uppercase line-through">FAILED</div>
              <div className="text-right line-through">Oct 12, 10:05</div>
            </div>
          )}

          {showCompleted && (
            <div className="grid grid-cols-5 items-center p-4 hover:bg-primary hover:text-on-primary transition-colors cursor-pointer group">
              <div className="truncate pr-4">PO_09217A</div>
              <div className="truncate pr-4">Goldman Sachs ****7765</div>
              <div>$92,000.00</div>
              <div className="font-status-completed text-status-completed uppercase">COMPLETED</div>
              <div className="text-right opacity-70 group-hover:opacity-100">Oct 11, 16:45</div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
