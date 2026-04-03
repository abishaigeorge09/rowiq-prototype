import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IS_SUPABASE, supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase() +
    Math.random().toString(36).substring(2, 5).toUpperCase();
}

const BG = (
  <div className="absolute inset-0 z-0 pointer-events-none">
    <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#2563EB]/[0.05] blur-[120px] rounded-full" />
    <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#2563EB]/[0.04] blur-[150px] rounded-full" />
    <div className="absolute inset-0 opacity-[0.02]" style={{
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
      backgroundSize: '60px 60px',
    }} />
  </div>
);

const inputCls = 'w-full bg-white border border-[#E5E7EB] focus:border-[#2563EB] text-white placeholder:text-[#9CA3AF] rounded-xl h-11 px-4 outline-none transition-colors text-sm';
const labelCls = 'text-[10px] uppercase tracking-widest text-[#6B7280] font-bold block mb-1.5';

export default function RegisterCoachPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [step, setStep] = useState('account'); // 'account' | 'team'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    teamName: '', division: '',
  });

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleAccountNext(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setStep('team');
  }

  async function handleTeamSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!IS_SUPABASE) {
      // Demo mode — auto-login with a fake coach profile
      setUser({
        id: `coach-${Date.now()}`,
        role: 'coach',
        name: form.name,
        email: form.email,
        team_id: `team-${Date.now()}`,
        status: 'active',
      });
      setLoading(false);
      navigate('/');
      return;
    }

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { role: 'coach', name: form.name } },
      });
      if (signUpError) throw new Error(signUpError.message);
      if (!authData.user) throw new Error('Sign up failed — please try again.');

      // Ensure we have a session (sign in if email confirmation is off)
      let session = authData.session;
      if (!session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (signInError) {
          // Email confirmation required — send to login with notice
          navigate('/login?registered=1');
          return;
        }
        session = signInData.session;
      }

      const inviteCode = generateInviteCode();

      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: form.teamName,
          division: form.division || null,
          sport: 'Rowing',
          invite_code: inviteCode,
          coach_id: authData.user.id,
        })
        .select()
        .single();
      if (teamError) throw new Error(teamError.message);

      await supabase
        .from('profiles')
        .update({ status: 'active', team_id: teamData.id })
        .eq('id', authData.user.id);

      // Fetch profile and auto-login
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      setUser(profile);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-dvh bg-[#F7F8FA] flex flex-col text-[#111827] overflow-hidden">
      {BG}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top nav */}
        <div className="flex items-center gap-3 px-6 pt-safe pt-6 pb-4 border-b border-[#E5E7EB]">
          <Link to="/login" className="text-[#6B7280] hover:text-[#111827] transition-colors bg-[#F3F4F6] p-2 rounded-xl">
            ←
          </Link>
          <Link to="/" className="flex items-center gap-1">
            <span className="text-lg font-black text-white">ROW</span>
            <span className="text-lg font-black text-[#2563EB]">IQ</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-8 pb-12 w-full max-w-xl mx-auto">
          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {['account', 'team'].map((s, i) => {
              const active = i <= ['account', 'team'].indexOf(step);
              return (
                <div key={s} className={`flex-1 h-1 rounded-full transition-all duration-500 ${active ? 'bg-white' : 'bg-white/10'}`} />
              );
            })}
          </div>

          {step === 'account' && (
            <form onSubmit={handleAccountNext} className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Create your account</h2>
                <p className="text-[#6B7280] text-sm">Step 1 of 2 — Your details</p>
              </div>
              <div>
                <label className={labelCls}>Full Name</label>
                <input className={inputCls} placeholder="Coach Smith" value={form.name}
                  onChange={(e) => set('name', e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} type="email" placeholder="coach@university.edu" value={form.email}
                  onChange={(e) => set('email', e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <input className={inputCls} type="password" placeholder="Min. 8 characters" value={form.password}
                  onChange={(e) => set('password', e.target.value)} minLength={8} required />
              </div>
              <div>
                <label className={labelCls}>Confirm Password</label>
                <input className={inputCls} type="password" placeholder="Re-enter password" value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)} minLength={8} required />
              </div>
              {error && (
                <div className="bg-red-950/30 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-xs">
                  {error}
                </div>
              )}
              <button type="submit"
                className="w-full bg-white text-[#0B1120] font-bold uppercase tracking-widest rounded-xl h-11 text-xs hover:bg-gray-100 transition-all">
                Continue →
              </button>
            </form>
          )}

          {step === 'team' && (
            <form onSubmit={handleTeamSubmit} className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Set up your team</h2>
                <p className="text-[#6B7280] text-sm">Step 2 of 2 — Team info</p>
              </div>
              <div>
                <label className={labelCls}>Team Name</label>
                <input className={inputCls} placeholder="UC Berkeley Men's Rowing" value={form.teamName}
                  onChange={(e) => set('teamName', e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Division (optional)</label>
                <input className={inputCls} placeholder="NCAA D1" value={form.division}
                  onChange={(e) => set('division', e.target.value)} />
              </div>

              {error && (
                <div className="bg-red-950/30 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-xs">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep('account')}
                  className="flex-1 border border-[#E5E7EB] bg-white text-[#6B7280] font-bold uppercase tracking-widest rounded-xl h-11 text-xs hover:text-[#111827] transition-all">
                  Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-white text-[#0B1120] font-bold uppercase tracking-widest rounded-xl h-11 text-xs hover:bg-gray-100 disabled:opacity-50 transition-all">
                  {loading ? 'Creating…' : 'Create Account →'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
