import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      const user = useAuthStore.getState().user;
      if (user?.role === 'coach' && (user.status === 'pending' || user.status === 'rejected')) {
        navigate('/pending');
      } else {
        navigate('/');
      }
    }
  }

  function fillDemo(demoEmail) {
    setEmail(demoEmail);
    setPassword('Demo1234!');
    setError('');
  }

  return (
    <div className="min-h-dvh bg-[#F7F8FA] flex flex-col text-[#111827]">
      {/* Top bar with logo in top-right */}
      <div className="flex justify-end px-5 pt-4">
        <Link to="/" className="inline-flex items-center gap-0.5 hover:opacity-80 transition-opacity">
          <span className="text-xl font-black text-[#111827]">ROW</span>
          <span className="text-xl font-black text-[#2563EB]">IQ</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">

          {/* Page heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#111827] mb-1">Sign in</h1>
            <p className="text-[#6B7280] text-sm">Welcome back</p>
          </div>

          {/* Registration success */}
          {justRegistered && (
            <div className="mb-5 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" className="shrink-0">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <p className="text-green-700 text-sm">Account created! Sign in to get started.</p>
            </div>
          )}

          {/* Demo quick-access */}
          <div className="mb-5 p-4 rounded-2xl border border-[#E5E7EB] bg-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse inline-block" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Try a Demo</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button type="button" onClick={() => fillDemo('coach@rowiq.demo')}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold transition-all bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] hover:bg-blue-100">
                Coach Demo
              </button>
              <button type="button" onClick={() => fillDemo('alex@rowiq.demo')}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold transition-all bg-[#111827] text-white hover:bg-[#1F2937]">
                Athlete Demo
              </button>
            </div>
            <button type="button" onClick={() => fillDemo('bella@rowiq.demo')}
              className="text-[10px] text-[#9CA3AF] hover:text-[#6B7280] uppercase tracking-wider transition-colors">
              Bella →
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#E5E7EB]" />
            <span className="text-[10px] text-[#9CA3AF] uppercase tracking-widest font-semibold">or sign in with email</span>
            <div className="flex-1 h-px bg-[#E5E7EB]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-[#374151] block">Email</label>
              <input
                id="email" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                autoComplete="email" required
                className="w-full bg-white border border-[#E5E7EB] focus:border-[#2563EB] text-[#111827] placeholder:text-[#9CA3AF] rounded-xl h-11 px-4 outline-none transition-colors text-sm shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-[#374151] block">Password</label>
              <div className="relative">
                <input
                  id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password" required
                  className="w-full bg-white border border-[#E5E7EB] focus:border-[#2563EB] text-[#111827] placeholder:text-[#9CA3AF] rounded-xl h-11 px-4 pr-11 outline-none transition-colors text-sm shadow-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#2563EB] text-white hover:bg-[#1d4ed8] disabled:opacity-50 font-semibold rounded-xl h-11 text-sm transition-all flex items-center justify-center gap-2 shadow-sm">
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-[#E5E7EB] text-center space-y-3">
            <p className="text-sm text-[#6B7280]">New to RowIQ?</p>
            <div className="flex justify-center gap-6 text-sm">
              <Link to="/register/coach" className="text-[#2563EB] hover:text-[#1d4ed8] font-semibold transition-colors">
                Register as Coach
              </Link>
              <span className="text-[#D1D5DB]">|</span>
              <Link to="/register/athlete" className="text-[#2563EB] hover:text-[#1d4ed8] font-semibold transition-colors">
                Join as Athlete
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
