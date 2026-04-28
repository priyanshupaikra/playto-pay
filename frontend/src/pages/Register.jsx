import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    businessName: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('PASSWORD MISMATCH. CREDENTIALS DO NOT MATCH.');
      return;
    }

    if (formData.password.length < 8) {
      setError('PASSWORD MUST BE AT LEAST 8 CHARACTERS.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        full_name: formData.fullName,
        email: formData.email,
        business_name: formData.businessName,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });
      // Auto-login on register — redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        // Handle field-level errors from DRF
        const messages = [];
        for (const [key, val] of Object.entries(data)) {
          if (Array.isArray(val)) {
            messages.push(val.join(' '));
          } else if (typeof val === 'string') {
            messages.push(val);
          } else if (typeof val === 'object') {
            messages.push(Object.values(val).flat().join(' '));
          }
        }
        setError(messages.join(' ') || 'REGISTRATION FAILED. TRY AGAIN.');
      } else {
        setError('REGISTRATION FAILED. TRY AGAIN.');
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
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex gap-8">
            <Link
              to="/login"
              className="font-[Inter] font-bold uppercase tracking-tighter text-gray-400 hover:text-black transition-none"
            >
              LOGIN
            </Link>
            <Link
              to="/register"
              className="font-[Inter] font-bold uppercase tracking-tighter text-black underline decoration-black decoration-2 underline-offset-8"
            >
              REGISTER
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-128px)]">
        {/* LEFT COLUMN: Editorial Content */}
        <section className="border-b md:border-b-0 md:border-r border-black p-8 md:p-12 flex flex-col justify-between bg-white">
          <div className="space-y-12">
            <div className="space-y-4">
              <span
                className="font-[JetBrains_Mono] text-sm opacity-50 block uppercase tracking-widest"
                style={{ fontWeight: 400 }}
              >
                CREATE ACCOUNT
              </span>
              <h1
                className="font-[Lora] text-black"
                style={{ fontSize: '64px', lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 400 }}
              >
                Start Getting Paid.
              </h1>
            </div>

            <div className="space-y-0 border-t border-black">
              {/* Feature 01 */}
              <div className="border-b border-black py-8 group hover:bg-black hover:text-white cursor-default">
                <div className="flex items-start gap-6">
                  <span
                    className="font-[JetBrains_Mono] text-xl"
                    style={{ fontWeight: 500 }}
                  >
                    01
                  </span>
                  <div className="space-y-2">
                    <h3 className="font-[Inter] font-bold text-lg uppercase">Global Settlement</h3>
                    <p className="font-[JetBrains_Mono] text-sm opacity-70" style={{ fontWeight: 400 }}>
                      Execute cross-border payouts with zero-latency architectural integrity.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 02 */}
              <div className="border-b border-black py-8 group hover:bg-black hover:text-white cursor-default">
                <div className="flex items-start gap-6">
                  <span
                    className="font-[JetBrains_Mono] text-xl"
                    style={{ fontWeight: 500 }}
                  >
                    02
                  </span>
                  <div className="space-y-2">
                    <h3 className="font-[Inter] font-bold text-lg uppercase">Audit Transparency</h3>
                    <p className="font-[JetBrains_Mono] text-sm opacity-70" style={{ fontWeight: 400 }}>
                      Real-time cryptographic verification for every transaction unit.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 03 */}
              <div className="border-b border-black py-8 group hover:bg-black hover:text-white cursor-default">
                <div className="flex items-start gap-6">
                  <span
                    className="font-[JetBrains_Mono] text-xl"
                    style={{ fontWeight: 500 }}
                  >
                    03
                  </span>
                  <div className="space-y-2">
                    <h3 className="font-[Inter] font-bold text-lg uppercase">Structural API</h3>
                    <p className="font-[JetBrains_Mono] text-sm opacity-70" style={{ fontWeight: 400 }}>
                      Direct ledger access designed for institutional-grade scaling.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Brutalist Image */}
          <div className="mt-12">
            <div className="w-full aspect-[21/9] border border-black overflow-hidden relative grayscale">
              <img
                alt="Brutalist architecture"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBceoSE2CjzVnhpNsnTLNpKmq48TYhN60hQIBSUDvv59_qQ7r1GAYOb5QB1KQTzAZ-B3DVEJc7ve_k6_1O8qeauxuZG2RdT6eLGK1wzT0R9EM4FTJOLi5L9EQL629nt-1QgCIXUBObZOoaZ3ADQleZonzweLgXTNoftqTLDq9I4QsF26XZWBIyEdijpwLQKT8CXqZopZcUvLyVkPBbezEgIfTMpPDvbPrE2FtjyzUIDT469A8AnBaZ_EBAyRtquSTP9HMdTDArog9Y"
              />
              <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Registration Form */}
        <section className="p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-xl w-full mx-auto space-y-12">
            <div className="space-y-2">
              <span
                className="font-[JetBrains_Mono] text-sm opacity-50 block uppercase tracking-widest"
                style={{ fontWeight: 400 }}
              >
                NEW MERCHANT ACCOUNT
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

              <div className="space-y-6">
                {/* Full Name */}
                <div className="relative border-b border-black">
                  <label className="block font-[Inter] font-bold text-[10px] uppercase tracking-tighter mb-1">
                    Full Name
                  </label>
                  <input
                    id="register-fullname"
                    name="fullName"
                    className="w-full bg-transparent py-3 font-[JetBrains_Mono] text-sm text-black placeholder:opacity-30 placeholder:font-[JetBrains_Mono] border-none px-0 focus:outline-none focus:ring-0"
                    placeholder="ENTER LEGAL NAME"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </div>

                {/* Email Address */}
                <div className="relative border-b border-black">
                  <label className="block font-[Inter] font-bold text-[10px] uppercase tracking-tighter mb-1">
                    Email Address
                  </label>
                  <input
                    id="register-email"
                    name="email"
                    className="w-full bg-transparent py-3 font-[JetBrains_Mono] text-sm text-black placeholder:opacity-30 placeholder:font-[JetBrains_Mono] border-none px-0 focus:outline-none focus:ring-0"
                    placeholder="ADMIN@BUSINESS.STRUCTURE"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Business Name */}
                <div className="relative border-b border-black">
                  <label className="block font-[Inter] font-bold text-[10px] uppercase tracking-tighter mb-1">
                    Business Name
                  </label>
                  <input
                    id="register-business"
                    name="businessName"
                    className="w-full bg-transparent py-3 font-[JetBrains_Mono] text-sm text-black placeholder:opacity-30 placeholder:font-[JetBrains_Mono] border-none px-0 focus:outline-none focus:ring-0"
                    placeholder="REGISTERED ENTITY NAME"
                    type="text"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                    autoComplete="organization"
                  />
                </div>

                {/* Password */}
                <div className="relative border-b border-black">
                  <label className="block font-[Inter] font-bold text-[10px] uppercase tracking-tighter mb-1">
                    Password
                  </label>
                  <div className="flex items-center">
                    <input
                      id="register-password"
                      name="password"
                      className="w-full bg-transparent py-3 font-[JetBrains_Mono] text-sm text-black placeholder:opacity-30 placeholder:font-[JetBrains_Mono] border-none px-0 focus:outline-none focus:ring-0"
                      placeholder="••••••••••••"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      className="font-[JetBrains_Mono] text-[10px] uppercase tracking-widest px-2 hover:bg-black hover:text-white py-1 shrink-0"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="relative border-b border-black">
                  <label className="block font-[Inter] font-bold text-[10px] uppercase tracking-tighter mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="register-confirm-password"
                    name="confirmPassword"
                    className="w-full bg-transparent py-3 font-[JetBrains_Mono] text-sm text-black placeholder:opacity-30 placeholder:font-[JetBrains_Mono] border-none px-0 focus:outline-none focus:ring-0"
                    placeholder="••••••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                {/* SUBMIT BUTTON */}
                <button
                  id="register-submit"
                  className="w-full bg-white border border-black text-black font-[Inter] font-bold text-sm uppercase py-5 hover:bg-black hover:text-white tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      PROCESSING
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    </>
                  ) : (
                    'CREATE MERCHANT ACCOUNT'
                  )}
                </button>

                <p className="font-[JetBrains_Mono] text-[11px] text-center opacity-50 uppercase leading-relaxed">
                  By creating an account, you agree to the structural framework and fiscal terms of
                  the PLAYTO network.
                </p>
              </div>
            </form>

            {/* Link to Login */}
            <div className="pt-8 border-t border-black flex justify-between items-center">
              <span className="font-[JetBrains_Mono] text-[11px] opacity-50 uppercase">
                Already have an account?
              </span>
              <Link
                to="/login"
                className="font-[Inter] font-bold text-[11px] uppercase underline underline-offset-4 hover:bg-black hover:text-white px-2 py-1"
              >
                LOG IN
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-black flex flex-col md:flex-row justify-between items-center w-full px-8 py-4 gap-4">
        <div className="font-[JetBrains_Mono] text-xs uppercase text-black">
          © 2024 PLAYTO FINANCIAL STRUCTURES
        </div>
        <div className="flex gap-8">
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
