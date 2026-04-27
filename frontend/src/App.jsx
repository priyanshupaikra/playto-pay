import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Ledger from './pages/Ledger';
import PayoutDetails from './pages/PayoutDetails';
import PayoutHistory from './pages/PayoutHistory';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ledger" element={<Ledger />} />
        <Route path="/payouts" element={<PayoutHistory />} />
        <Route path="/payouts/:id" element={<PayoutDetails />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
