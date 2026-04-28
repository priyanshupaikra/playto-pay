import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.detail) {
        setError(data.detail);
      } else if (data?.email) {
        setError(Array.isArray(data.email) ? data.email[0] : data.email);
      } else {
        setError('AUTHENTICATION FAILED. VERIFY CREDENTIALS.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white text-black font-[Inter] antialiased min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="flex justify-between items-center w-full px-8 h-16 bg-white border-b border-black sticky top-0 z-50">
        <div className="text-2xl font-black uppercase tracking-widest text-black">PLAYTO</div>
        <div className="flex gap-8">
          <Link
            to="/login"
            className="font-[Inter] font-bold uppercase tracking-tighter text-black underline decoration-black decoration-2 underline-offset-8"
          >
            LOGIN
          </Link>
          <Link
            to="/register"
            className="font-[Inter] font-bold uppercase tracking-tighter text-gray-400 hover:text-black transition-none"
          >
            REGISTER
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col md:flex-row min-h-[calc(100vh-64px-52px)]">
        {/* LEFT COLUMN: Identity & Context */}
        <section className="flex-1 flex flex-col justify-between p-8 md:p-12 border-b md:border-b-0 md:border-r border-black">
          <div>
            <span
              className="font-[JetBrains_Mono] text-sm text-black uppercase tracking-widest block mb-4"
              style={{ fontWeight: 400 }}
            >
              MERCHANT PORTAL
            </span>
            <h1
              className="font-[Lora] text-black mb-12"
              style={{ fontSize: '64px', lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 400 }}
            >
              Sign Back In.
            </h1>

            <div className="space-y-0 border-t border-black max-w-md">
              {/* System Uptime */}
              <div className="py-6 border-b border-black flex justify-between items-baseline group hover:bg-black hover:text-white cursor-default">
                <div>
                  <p className="font-[JetBrains_Mono] text-sm uppercase" style={{ fontWeight: 400 }}>
                    SYSTEM_UPTIME
                  </p>
                  <p className="font-[JetBrains_Mono] text-xs font-bold">99.998%</p>
                </div>
                <span className="font-[JetBrains_Mono] text-xs font-bold">ONLINE</span>
              </div>

              {/* Last Login */}
              <div className="py-6 border-b border-black flex justify-between items-baseline group hover:bg-black hover:text-white cursor-default">
                <div>
                  <p className="font-[JetBrains_Mono] text-sm uppercase" style={{ fontWeight: 400 }}>
                    LAST_LOGIN
                  </p>
                  <p className="font-[JetBrains_Mono] text-xs" style={{ fontWeight: 400 }}>
                    12 OCT 2024 — 14:32 UTC
                  </p>
                </div>
                <span className="font-[JetBrains_Mono] text-xs italic" style={{ fontWeight: 400 }}>
                  PARIS_HQ
                </span>
              </div>

              {/* Active Nodes */}
              <div className="py-6 border-b border-black flex justify-between items-baseline group hover:bg-black hover:text-white cursor-default">
                <div>
                  <p className="font-[JetBrains_Mono] text-sm uppercase" style={{ fontWeight: 400 }}>
                    ACTIVE_NODES
                  </p>
                  <p className="font-[JetBrains_Mono] text-xs italic" style={{ fontWeight: 400 }}>
                    Processing 1,242 requests...
                  </p>
                </div>
                <span className="material-symbols-outlined text-sm">hub</span>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <p
              className="font-[JetBrains_Mono] text-sm opacity-50 max-w-xs leading-tight"
              style={{ fontWeight: 400 }}
            >
              PLAYTO FINANCIAL STRUCTURES PROVIDE UNCOMPROMISING DATA INTEGRITY FOR MODERN MERCHANT
              TRANSACTIONS.
            </p>
          </div>
        </section>

        {/* RIGHT COLUMN: Login Form */}
        <section className="flex-1 flex flex-col justify-center items-center p-8 md:p-24 bg-white">
          <div className="w-full max-w-md border border-black p-8 md:p-12">
            <div className="mb-10">
              <span className="font-[JetBrains_Mono] text-sm uppercase tracking-widest text-black border-b border-black pb-1">
                MERCHANT LOGIN
              </span>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className="border border-black bg-black text-white p-4 font-[JetBrains_Mono] text-xs uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm mr-2 align-middle">error</span>
                  {error}
                </div>
              )}

              {/* EMAIL FIELD */}
              <div className="space-y-2">
                <label className="font-[Inter] font-bold text-sm uppercase block">
                  EMAIL_ADDRESS
                </label>
                <input
                  id="login-email"
                  className="w-full bg-white border border-black p-4 font-[JetBrains_Mono] text-sm focus:outline-none focus:ring-0 focus:border-black placeholder:opacity-30"
                  placeholder="USER@PLAYTO.STRUCTURE"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              {/* PASSWORD FIELD */}
              <div className="space-y-2 relative">
                <label className="font-[Inter] font-bold text-sm uppercase block">
                  SECURE_CREDENTIAL
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    className="w-full bg-white border border-black p-4 font-[JetBrains_Mono] text-sm focus:outline-none focus:ring-0 focus:border-black placeholder:opacity-30 pr-20"
                    placeholder="••••••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 font-[JetBrains_Mono] text-xs uppercase underline hover:bg-black hover:text-white px-2 py-1"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <a
                  className="font-[JetBrains_Mono] text-xs uppercase underline hover:bg-black hover:text-white px-1 py-0.5"
                  href="#"
                >
                  FORGOT PASSWORD
                </a>
              </div>

              {/* SIGN IN BUTTON */}
              <button
                id="login-submit"
                className="w-full bg-white border border-black text-black font-[Inter] font-bold text-sm uppercase py-6 hover:bg-black hover:text-white flex items-center justify-center gap-4 disabled:opacity-40 disabled:cursor-not-allowed"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    AUTHENTICATING
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  </>
                ) : (
                  <>
                    SIGN IN
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-black">
              <p className="font-[JetBrains_Mono] text-xs text-center opacity-50">
                ACCESS AUTHORIZED FOR REGISTERED MERCHANTS ONLY. ALL ATTEMPTS LOGGED.
              </p>
            </div>

            {/* Link to Register */}
            <div className="mt-6 pt-6 border-t border-black flex justify-between items-center">
              <span className="font-[JetBrains_Mono] text-[11px] opacity-50 uppercase">
                Don't have an account?
              </span>
              <Link
                to="/register"
                className="font-[Inter] font-bold text-[11px] uppercase underline underline-offset-4 hover:bg-black hover:text-white px-2 py-1"
              >
                REGISTER
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-4 bg-white border-t border-black gap-4">
        <span className="font-[JetBrains_Mono] text-xs uppercase text-black font-bold">
          © 2024 PLAYTO FINANCIAL STRUCTURES
        </span>
        <div className="flex gap-6">
          <a className="font-[JetBrains_Mono] text-xs uppercase text-gray-500 hover:underline" href="#">
            TERMS
          </a>
          <a className="font-[JetBrains_Mono] text-xs uppercase text-gray-500 hover:underline" href="#">
            PRIVACY
          </a>
          <a className="font-[JetBrains_Mono] text-xs uppercase text-gray-500 hover:underline" href="#">
            SYSTEM_STATUS
          </a>
        </div>
      </footer>
    </div>
  );
}
