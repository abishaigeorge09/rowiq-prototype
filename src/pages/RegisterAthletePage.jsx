import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IS_SUPABASE, supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

const inputCls = 'w-full bg-white/5 border border-white/10 focus:border-[#2563EB] text-white placeholder:text-white/30 rounded-xl h-11 px-4 outline-none transition-colors text-sm';
const labelCls = 'text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-1.5';

const BG = (
  <div className="absolute inset-0 z-0 pointer-events-none">
    <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#2563EB]/[0.07] blur-[120px] rounded-full" />
    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#2563EB]/[0.04] blur-[150px] rounded-full" />
  </div>
);

export default function RegisterAthletePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('invite'); // 'invite' | 'account' | 'profile'
  const [inviteCode, setInviteCode] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [resolvedTeamId, setResolvedTeamId] = useState('');
  const [resolvedTeamName, setResolvedTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    position: 'Mid',
    oarSide: 'port',
  });

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleInviteCheck(e) {
    e.preventDefault();
    setInviteError('');

    if (!IS_SUPABASE) {
      // Demo: accept any code ≥ 6 chars
      if (inviteCode.length >= 6) {
        setResolvedTeamId('demo-team-1');
        setResolvedTeamName('Demo Team');
        setStep('account');
      } else {
        setInviteError('Invalid invite code. Try any 6+ character code for the demo.');
      }
      return;
    }

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('invite_code', inviteCode.trim().toUpperCase())
      .single();

    if (teamError || !team) {
      setInviteError('Invalid invite code. Ask your coach for the correct code.');
      return;
    }

    setResolvedTeamId(team.id);
    setResolvedTeamName(team.name);
    setStep('account');
  }

  async function handleFinish(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!IS_SUPABASE) {
      useAuthStore.setState({
        user: {
          id: `athlete-${Date.now()}`,
          email: form.email,
          name: form.name,
          role: 'athlete',
          status: 'active',
          team_id: resolvedTeamId,
          oarSide: form.oarSide,
        },
      });
      setLoading(false);
      navigate('/');
      return;
    }

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { role: 'athlete', name: form.name } },
      });
      if (signUpError) throw new Error(signUpError.message);
      if (!authData.user) throw new Error('Sign up failed — please try again.');

      if (!authData.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (signInError) throw new Error('Account created! Check your email to confirm, then sign in.');
      }

      const uid = authData.user.id;

      await supabase
        .from('profiles')
        .update({ team_id: resolvedTeamId, status: 'active' })
        .eq('id', uid);

      await supabase.from('roster_athletes').insert({
        profile_id: uid,
        team_id: resolvedTeamId,
        name: form.name,
        email: form.email,
        position: form.position,
      });

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      useAuthStore.setState({ user: profile });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const steps = ['invite', 'account', 'profile'];
  const stepIdx = steps.indexOf(step);

  return (
    <div className="relative min-h-dvh bg-[#0B1120] flex flex-col text-white overflow-hidden">
      {BG}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top nav */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-[#E5E7EB]">
          <Link to="/login" className="text-white/40 hover:text-white/80 transition-colors bg-white/5 p-2 rounded-xl">
            ←
          </Link>
          <div className="flex items-center gap-1">
            <span className="text-lg font-black text-white">ROW</span>
            <span className="text-lg font-black text-[#2563EB]">IQ</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-8 pb-12 w-full max-w-xl mx-auto">
          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className={`flex-1 h-1 rounded-full transition-all duration-500 ${i <= stepIdx ? 'bg-[#2563EB]' : 'bg-white/10'}`} />
            ))}
          </div>

          {/* Step: Invite code */}
          {step === 'invite' && (
            <form onSubmit={handleInviteCheck} className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Join your team</h2>
                <p className="text-white/40 text-sm">Step 1 of 3 — Enter your team invite code</p>
              </div>
              <div>
                <label className={labelCls}>Invite Code</label>
                <input
                  className={`${inputCls} uppercase tracking-widest font-mono`}
                  placeholder="ABC123"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  required
                />
                {inviteError && (
                  <p className="text-red-300 text-xs mt-2">{inviteError}</p>
                )}
                <p className="text-white/30 text-xs mt-2">Ask your coach for the invite code.</p>
              </div>
              <button type="submit"
                className="w-full bg-[#2563EB] text-white font-bold rounded-xl h-11 text-sm hover:bg-[#1d4ed8] transition-all">
                Verify Code →
              </button>
            </form>
          )}

          {/* Step: Account */}
          {step === 'account' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              if (form.password !== form.confirmPassword) {
                setError('Passwords do not match.');
                return;
              }
              setError('');
              setStep('profile');
            }} className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Create your account</h2>
                <p className="text-white/40 text-sm">
                  Step 2 of 3 — Joining <span className="text-white font-semibold">{resolvedTeamName}</span>
                </p>
              </div>
              <div>
                <label className={labelCls}>Full Name</label>
                <input className={inputCls} placeholder="Alex Johnson" value={form.name}
                  onChange={(e) => setField('name', e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} type="email" placeholder="you@university.edu" value={form.email}
                  onChange={(e) => setField('email', e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <input className={inputCls} type="password" placeholder="Min. 8 characters" value={form.password}
                  onChange={(e) => setField('password', e.target.value)} minLength={8} required />
              </div>
              <div>
                <label className={labelCls}>Confirm Password</label>
                <input className={inputCls} type="password" placeholder="Re-enter password" value={form.confirmPassword}
                  onChange={(e) => setField('confirmPassword', e.target.value)} minLength={8} required />
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-xs">{error}</div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep('invite')}
                  className="flex-1 border border-white/10 bg-white/5 text-white/50 font-semibold rounded-xl h-11 text-sm hover:text-white transition-all">
                  Back
                </button>
                <button type="submit"
                  className="flex-1 bg-[#2563EB] text-white font-bold rounded-xl h-11 text-sm hover:bg-[#1d4ed8] transition-all">
                  Continue →
                </button>
              </div>
            </form>
          )}

          {/* Step: Profile */}
          {step === 'profile' && (
            <form onSubmit={handleFinish} className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Your rowing profile</h2>
                <p className="text-white/40 text-sm">Step 3 of 3 — Position preference</p>
              </div>
              <div>
                <label className={labelCls}>Preferred Position</label>
                <div className="flex gap-2">
                  {['Stroke', 'Mid', 'Bow'].map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setField('position', pos)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        form.position === pos
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-white/5 text-white/50 hover:text-white border border-white/10'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Oar Side Preference</label>
                <div className="flex gap-2">
                  {[
                    { value: 'port', label: '🔴 Port' },
                    { value: 'both', label: '🔴🟢 Both' },
                    { value: 'starboard', label: '🟢 Starboard' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setField('oarSide', value)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                        form.oarSide === value
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-white/5 text-white/50 hover:text-white border border-white/10'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-white/30 text-xs mt-1.5">Which side of the boat do you prefer to row?</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-xs">{error}</div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep('account')}
                  className="flex-1 border border-white/10 bg-white/5 text-white/50 font-semibold rounded-xl h-11 text-sm hover:text-white transition-all">
                  Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-[#2563EB] text-white font-bold rounded-xl h-11 text-sm hover:bg-[#1d4ed8] disabled:opacity-50 transition-all">
                  {loading ? 'Creating…' : 'Join Team →'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
