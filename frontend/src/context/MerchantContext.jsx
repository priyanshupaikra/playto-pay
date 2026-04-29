import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMerchants } from '../api/merchants';
import { useAuth } from './AuthContext';

const MerchantContext = createContext(null);

export function MerchantProvider({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [merchants, setMerchants] = useState([]);
  const [currentMerchant, setCurrentMerchant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch merchants when the user is authenticated
    if (authLoading) return;

    if (!isAuthenticated) {
      setMerchants([]);
      setCurrentMerchant(null);
      setLoading(false);
      sessionStorage.removeItem('merchants');
      return;
    }

    // Use cached merchants for instant render
    let hasCachedData = false;
    const cached = sessionStorage.getItem('merchants');
    if (cached) {
      try {
        const list = JSON.parse(cached);
        setMerchants(list);
        if (list.length > 0) setCurrentMerchant(list[0]);
        hasCachedData = true;
        setLoading(false); // Unblock UI immediately
      } catch { /* ignore parse errors */ }
    }

    if (!hasCachedData) setLoading(true);

    // Fetch fresh data (background refresh if cached)
    getMerchants()
      .then((data) => {
        const list = data.results || data;
        setMerchants(list);
        sessionStorage.setItem('merchants', JSON.stringify(list));
        if (list.length > 0) {
          setCurrentMerchant(list[0]);
        }
      })
      .catch((err) => console.error('Failed to load merchants:', err))
      .finally(() => {
        if (!hasCachedData) setLoading(false);
      });
  }, [isAuthenticated, authLoading]);

  const switchMerchant = (merchantId) => {
    const m = merchants.find((m) => m.id === merchantId);
    if (m) setCurrentMerchant(m);
  };

  return (
    <MerchantContext.Provider
      value={{ merchants, currentMerchant, switchMerchant, loading }}
    >
      {children}
    </MerchantContext.Provider>
  );
}

export function useMerchant() {
  const ctx = useContext(MerchantContext);
  if (!ctx) throw new Error('useMerchant must be used within MerchantProvider');
  return ctx;
}
