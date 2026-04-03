import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';

const DEMOS = [
  { label: 'Coach Demo', email: 'coach@rowiq.demo' },
  { label: 'Alex (Athlete)', email: 'alex@rowiq.demo' },
  { label: 'Bella (Athlete)', email: 'bella@rowiq.demo' },
];

export default function SignInModal({ onClose, onSuccess, title = 'Sign in to publish' }) {
  const navigate = useNavigate();
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function fillDemo(demoEmail) {
    setEmail(demoEmail);
    setPassword('Demo1234!');
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onSuccess?.();
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[#111827] font-bold text-lg">{title}</h2>
            <p className="text-[#6B7280] text-xs mt-0.5">Enter your credentials or try a demo</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-white/[0.06] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Demo quick-fill */}
        <div className="mb-5 p-3 rounded-xl border border-[#E5E7EB] bg-white/[0.02]">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] mb-2">Quick demo access</p>
          <div className="flex flex-wrap gap-2">
            {DEMOS.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => fillDemo(d.email)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] border border-[#E5E7EB] text-[#374151] hover:text-[#111827] hover:bg-white/[0.12] transition-colors"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#6B7280] font-bold block mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-[#F7F8FA] border border-[#E5E7EB] focus:border-[#2563EB] text-[#111827] placeholder:text-[#9CA3AF] rounded-xl h-11 px-4 outline-none transition-colors text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#6B7280] font-bold block mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#F7F8FA] border border-[#E5E7EB] focus:border-[#2563EB] text-[#111827] placeholder:text-[#9CA3AF] rounded-xl h-11 px-4 outline-none transition-colors text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-950/30 border border-red-500/20 rounded-xl px-4 py-2.5 text-red-300 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#2563EB] text-[#111827] font-bold text-sm hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors mt-1"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-4 flex items-center justify-between text-xs text-[#9CA3AF]">
          <button
            onClick={() => { onClose(); navigate('/register/coach'); }}
            className="hover:text-[#374151] transition-colors"
          >
            Create account
          </button>
          <button
            onClick={() => { onClose(); navigate('/login'); }}
            className="hover:text-[#374151] transition-colors"
          >
            Full sign in page →
          </button>
        </div>
      </div>
    </div>
  );
}
