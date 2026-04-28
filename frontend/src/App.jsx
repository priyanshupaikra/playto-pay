import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MerchantProvider } from './context/MerchantContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Ledger from './pages/Ledger';
import PayoutDetails from './pages/PayoutDetails';
import PayoutHistory from './pages/PayoutHistory';
import Settings from './pages/Settings';

function App() {
  return (
    <MerchantProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="ledger" element={<Ledger />} />
            <Route path="payouts" element={<PayoutHistory />} />
            <Route path="payouts/:id" element={<PayoutDetails />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MerchantProvider>
  );
}

export default App;
