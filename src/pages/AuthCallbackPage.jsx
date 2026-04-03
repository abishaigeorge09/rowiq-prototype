import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { setUser, migrateLocalStorage } = useAuthStore();
  const [status, setStatus] = useState('Processing sign-in…');

  useEffect(() => {
    async function handleCallback() {
      try {
        // Exchange the code in the URL for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);

        if (error) {
          setStatus('Sign-in failed. Redirecting…');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        const authUser = data?.user;
        if (!authUser) {
          setStatus('No user found. Redirecting…');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        setStatus('Setting up your account…');

        // Fetch or create profile
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (!profile) {
          // New Google user — create profile + prompt team setup
          const name = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Coach';
          await supabase.from('profiles').upsert({
            id: authUser.id,
            role: 'coach',
            name,
            email: authUser.email,
            status: 'active',
          }, { onConflict: 'id' });

          const { data: newProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          profile = newProfile;
        }

        if (profile) {
          setUser(profile);
          // Migrate any locally stored roster to Supabase
          if (profile.team_id) {
            await migrateLocalStorage(authUser.id, profile.team_id);
          }
        }

        navigate('/');
      } catch (err) {
        console.error('Auth callback error:', err);
        setStatus('Something went wrong. Redirecting…');
        setTimeout(() => navigate('/login'), 2000);
      }
    }

    handleCallback();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-dvh bg-[#0B1120] flex flex-col items-center justify-center gap-4 text-white">
      <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      <p className="text-[#64748B] text-sm">{status}</p>
    </div>
  );
}
