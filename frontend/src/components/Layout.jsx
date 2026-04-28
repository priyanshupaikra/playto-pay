import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMerchant } from '../context/MerchantContext';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { merchants, currentMerchant, switchMerchant, loading } = useMerchant();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinkClass = (path, isMobile = false) => {
    const isActive = location.pathname.startsWith(path);
    if (isMobile) {
      if (isActive) {
        return "bg-primary text-on-primary flex flex-col items-center justify-center h-full w-full font-data-md text-[10px] uppercase";
      }
      return "flex flex-col items-center justify-center h-full w-full text-on-surface font-data-md text-[10px] uppercase hover:bg-primary hover:text-on-primary";
    }

    // Desktop
    if (isActive) {
      return "flex items-center gap-4 px-4 py-3 border-b border-primary bg-primary text-on-primary font-data-md text-data-md text-xs uppercase tracking-tighter";
    }
    return "flex items-center gap-4 px-4 py-3 border-b border-primary text-on-surface hover:bg-primary hover:text-on-primary font-data-md text-data-md text-xs uppercase tracking-tighter transition-colors";
  };

  if (loading) {
    return (
      <div className="bg-surface-container-lowest text-on-surface min-h-screen flex items-center justify-center">
        <span className="font-data-lg text-data-lg uppercase tracking-widest animate-pulse">Loading...</span>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest text-on-surface font-ui-label-reg antialiased min-h-screen border-x border-primary max-w-[1920px] mx-auto flex flex-col md:flex-row">
      
      {/* SideNavBar (Hidden on Mobile) */}
      <div className="hidden md:flex flex-col w-48 shrink-0 h-screen border-r border-primary bg-surface-container-lowest sticky top-0">
        <div className="p-4 border-b border-primary">
          <div className="font-editorial-h2 text-editorial-h2 pb-4">PLAYTO</div>
          <div className="font-data-md text-data-md text-xs">FINANCIAL OPS</div>
        </div>

        {/* Merchant Switcher */}
        <div className="border-b border-primary p-3">
          <select
            className="w-full bg-transparent font-data-md text-[10px] uppercase tracking-wider border border-primary p-2 cursor-pointer focus:outline-none"
            value={currentMerchant?.id || ''}
            onChange={(e) => switchMerchant(e.target.value)}
          >
            {merchants.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <nav className="flex flex-col flex-1">
          <Link className={getLinkClass('/dashboard')} to="/dashboard">
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            DASHBOARD
          </Link>
          <Link className={getLinkClass('/payouts')} to="/payouts">
            <span className="material-symbols-outlined text-[18px]">payments</span>
            PAYOUTS
          </Link>
          <Link className={getLinkClass('/ledger')} to="/ledger">
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            LEDGER
          </Link>
          <Link className={getLinkClass('/settings')} to="/settings">
            <span className="material-symbols-outlined text-[18px]">settings</span>
            SETTINGS
          </Link>
        </nav>

        {/* Logout Button */}
        <div className="mt-auto border-t border-primary p-3">
          {user && (
            <div className="font-data-md text-[10px] uppercase tracking-wider opacity-50 mb-2 truncate">
              {user.email || user.full_name}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-on-surface hover:bg-primary hover:text-on-primary font-data-md text-data-md text-xs uppercase tracking-tighter transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            LOGOUT
          </button>
        </div>
      </div>

      {/* Main Content Canvas */}
      <main className="flex-1 w-full pb-32 md:pb-0 px-4 md:px-12 pt-8 md:pt-12 min-h-[calc(100vh-64px)] overflow-x-hidden">
        <Outlet />
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-16 flex justify-around z-50 overflow-hidden bg-surface-container-lowest text-on-surface border-t border-primary">
        <Link className={getLinkClass('/dashboard', true)} to="/dashboard">
          <span className="material-symbols-outlined text-[20px] mb-1">dashboard</span>
          DASH
        </Link>
        <Link className={getLinkClass('/payouts', true)} to="/payouts">
          <span className="material-symbols-outlined text-[20px] mb-1">payments</span>
          PAY
        </Link>
        <Link className={getLinkClass('/ledger', true)} to="/ledger">
          <span className="material-symbols-outlined text-[20px] mb-1">receipt_long</span>
          LEDGER
        </Link>
        <Link className={getLinkClass('/settings', true)} to="/settings">
          <span className="material-symbols-outlined text-[20px] mb-1">settings</span>
          SET
        </Link>
      </div>

    </div>
  );
}
