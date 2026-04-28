import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MerchantProvider } from './context/MerchantContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Ledger from './pages/Ledger';
import PayoutDetails from './pages/PayoutDetails';
import PayoutHistory from './pages/PayoutHistory';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MerchantProvider>
          <Routes>
            {/* Public Auth Routes (no sidebar/nav) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected App Routes (with sidebar/nav) */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="ledger" element={<Ledger />} />
              <Route path="payouts" element={<PayoutHistory />} />
              <Route path="payouts/:id" element={<PayoutDetails />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </MerchantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
