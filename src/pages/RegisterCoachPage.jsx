import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IS_SUPABASE, supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useRosterStore } from '../stores/rosterStore';
import { parseCSV, parseSessionsCSV, ROSTER_TEMPLATE_CSV, SESSIONS_TEMPLATE_CSV } from '../utils/helpers';

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase() +
    Math.random().toString(36).substring(2, 5).toUpperCase();
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const inputCls = 'w-full bg-white/5 border border-white/10 focus:border-[#2563EB] text-white placeholder:text-white/30 rounded-xl h-11 px-4 outline-none transition-colors text-sm';
const labelCls = 'text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-1.5';

export default function RegisterCoachPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const { addAthletes } = useRosterStore();
  const [step, setStep] = useState('account'); // 'account' | 'team' | 'roster'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    teamName: '', division: '',
  });

  // Step 3 state
  const [importedAthletes, setImportedAthletes] = useState([]);
  const [importedSessions, setImportedSessions] = useState([]);
  const rosterFileRef = useRef(null);
  const sessionsFileRef = useRef(null);

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
      setUser({
        id: `coach-${Date.now()}`,
        role: 'coach',
        name: form.name,
        email: form.email,
        team_id: `team-${Date.now()}`,
        status: 'active',
      });
      setLoading(false);
      setStep('roster');
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

      let session = authData.session;
      if (!session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (signInError) {
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

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      setUser(profile);
      setStep('roster');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleRosterFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      setImportedAthletes(parsed);
    };
    reader.readAsText(file);
  }

  function handleSessionsFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseSessionsCSV(ev.target.result);
      setImportedSessions(parsed);
    };
    reader.readAsText(file);
  }

  function handleFinish() {
    // Save roster to rosterStore (persists to localStorage, App.jsx loads it)
    if (importedAthletes.length > 0) {
      addAthletes(importedAthletes, form.teamName || 'Roster');
    }
    // Save sessions to sessionStorage for App.jsx to pick up on mount
    if (importedSessions.length > 0) {
      sessionStorage.setItem('rowiq_import_sessions', JSON.stringify(importedSessions));
    }
    navigate('/');
  }

  const steps = ['account', 'team', 'roster'];
  const stepIdx = steps.indexOf(step);

  return (
    <div className="relative min-h-dvh bg-[#0B1120] flex flex-col text-white overflow-hidden">
      {/* Subtle background glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#2563EB]/[0.07] blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#2563EB]/[0.04] blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top nav */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-white/10">
          <Link to="/login" className="text-white/40 hover:text-white/80 transition-colors bg-white/5 p-2 rounded-xl">
            ←
          </Link>
          <Link to="/" className="flex items-center gap-0.5">
            <span className="text-lg font-black text-white">ROW</span>
            <span className="text-lg font-black text-[#2563EB]">IQ</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-8 pb-12 w-full max-w-xl mx-auto">
          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className={`flex-1 h-1 rounded-full transition-all duration-500 ${i <= stepIdx ? 'bg-[#2563EB]' : 'bg-white/10'}`} />
            ))}
          </div>

          {/* ── Step 1: Account ── */}
          {step === 'account' && (
            <form onSubmit={handleAccountNext} className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Create your account</h2>
                <p className="text-white/40 text-sm">Step 1 of 3 — Your details</p>
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
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-xs">{error}</div>
              )}
              <button type="submit"
                className="w-full bg-[#2563EB] text-white font-bold rounded-xl h-11 text-sm hover:bg-[#1d4ed8] transition-all">
                Continue →
              </button>
            </form>
          )}

          {/* ── Step 2: Team ── */}
          {step === 'team' && (
            <form onSubmit={handleTeamSubmit} className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Set up your team</h2>
                <p className="text-white/40 text-sm">Step 2 of 3 — Team info</p>
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
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-xs">{error}</div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep('account')}
                  className="flex-1 border border-white/10 bg-white/5 text-white/60 font-bold rounded-xl h-11 text-sm hover:text-white transition-all">
                  Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-[#2563EB] text-white font-bold rounded-xl h-11 text-sm hover:bg-[#1d4ed8] disabled:opacity-50 transition-all">
                  {loading ? 'Creating…' : 'Continue →'}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Import Roster & Sessions ── */}
          {step === 'roster' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Import your data</h2>
                <p className="text-white/40 text-sm">Step 3 of 3 — Optional, you can skip and do this later</p>
              </div>

              {/* Templates */}
              <div className="space-y-2">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Download Templates</p>
                <button
                  onClick={() => downloadCSV(ROSTER_TEMPLATE_CSV, 'rowiq_roster_template.csv')}
                  className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#2563EB]/20 flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Roster Template</p>
                    <p className="text-white/40 text-xs">name, email, position, oar_side</p>
                  </div>
                </button>
                <button
                  onClick={() => downloadCSV(SESSIONS_TEMPLATE_CSV, 'rowiq_sessions_template.csv')}
                  className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#16A34A]/20 flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Sessions History Template</p>
                    <p className="text-white/40 text-xs">date, session, boat, athletes, placement, time</p>
                  </div>
                </button>
              </div>

              {/* Roster CSV preview */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 overflow-x-auto">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">Roster Template Preview</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-white/30">
                      {['name', 'email', 'position', 'oar_side'].map(h => (
                        <th key={h} className="text-left pr-4 pb-1.5 font-mono">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-white/60">
                    {[
                      ['Alex Johnson', 'alex@team.edu', 'Stroke', 'starboard'],
                      ['Bella Martinez', 'bella@team.edu', 'Mid', 'port'],
                      ['Chris Park', 'chris@team.edu', 'Bow', 'port'],
                    ].map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => <td key={j} className="pr-4 py-0.5">{cell}</td>)}
                      </tr>
                    ))}
                    <tr><td colSpan={4} className="text-white/20 text-[10px] pt-1">…</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Upload Roster */}
              <div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Upload Your Roster</p>
                <input ref={rosterFileRef} type="file" accept=".csv" onChange={handleRosterFile} className="hidden" />
                {importedAthletes.length === 0 ? (
                  <button
                    onClick={() => rosterFileRef.current?.click()}
                    className="w-full border border-dashed border-white/20 rounded-xl px-4 py-3 text-white/40 hover:text-white/70 hover:border-white/40 text-sm transition-colors"
                  >
                    Choose roster CSV file…
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-[#2563EB]/10 border border-[#2563EB]/30 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[#2563EB] text-sm font-semibold">✓ {importedAthletes.length} athletes ready</span>
                    </div>
                    <button onClick={() => setImportedAthletes([])} className="text-white/30 hover:text-white/60 text-xs transition-colors">Clear</button>
                  </div>
                )}
              </div>

              {/* Upload Sessions */}
              <div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Upload Session History <span className="text-white/20 normal-case">(optional)</span></p>
                <input ref={sessionsFileRef} type="file" accept=".csv" onChange={handleSessionsFile} className="hidden" />
                {importedSessions.length === 0 ? (
                  <button
                    onClick={() => sessionsFileRef.current?.click()}
                    className="w-full border border-dashed border-white/20 rounded-xl px-4 py-3 text-white/40 hover:text-white/70 hover:border-white/40 text-sm transition-colors"
                  >
                    Choose sessions CSV file…
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-[#16A34A]/10 border border-[#16A34A]/30 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[#16A34A] text-sm font-semibold">✓ {importedSessions.length} sessions ready</span>
                    </div>
                    <button onClick={() => setImportedSessions([])} className="text-white/30 hover:text-white/60 text-xs transition-colors">Clear</button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 border border-white/10 bg-white/5 text-white/50 font-semibold rounded-xl h-11 text-sm hover:text-white transition-all"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 bg-[#2563EB] text-white font-bold rounded-xl h-11 text-sm hover:bg-[#1d4ed8] transition-all"
                >
                  {importedAthletes.length > 0 || importedSessions.length > 0
                    ? `Import & Start →`
                    : 'Go to App →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
