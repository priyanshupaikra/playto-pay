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
      return;
    }

    setLoading(true);
    getMerchants()
      .then((data) => {
        // data could be paginated or a plain array
        const list = data.results || data;
        setMerchants(list);
        if (list.length > 0) {
          // Default to first merchant
          setCurrentMerchant(list[0]);
        }
      })
      .catch((err) => console.error('Failed to load merchants:', err))
      .finally(() => setLoading(false));
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
