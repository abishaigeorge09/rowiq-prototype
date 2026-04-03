import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IS_SUPABASE, supabase } from '../lib/supabase';

// Demo accounts — coach + a few athletes
const DEMO_ACCOUNTS = {
  'coach@rowiq.demo': {
    password: 'Demo1234!',
    profile: {
      id: 'demo-coach-1',
      role: 'coach',
      name: 'Coach Demo',
      email: 'coach@rowiq.demo',
      team_id: 'demo-team-1',
      status: 'active',
    },
  },
  'alex@rowiq.demo': {
    password: 'Demo1234!',
    profile: {
      id: 'demo-athlete-1',
      role: 'athlete',
      name: 'Alex Johnson',
      email: 'alex@rowiq.demo',
      team_id: 'demo-team-1',
      status: 'active',
      athlete_id: 'da-01',
    },
  },
  'bella@rowiq.demo': {
    password: 'Demo1234!',
    profile: {
      id: 'demo-athlete-2',
      role: 'athlete',
      name: 'Bella Martinez',
      email: 'bella@rowiq.demo',
      team_id: 'demo-team-1',
      status: 'active',
      athlete_id: 'da-02',
    },
  },
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isDemoMode: !IS_SUPABASE,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      signIn: async (email, password) => {
        set({ isLoading: true });

        // Demo accounts always handled locally (regardless of Supabase config)
        const account = DEMO_ACCOUNTS[email.toLowerCase()];
        if (account && account.password === password) {
          set({ user: account.profile, isLoading: false });
          return {};
        }

        // No real Supabase — reject non-demo credentials
        if (!IS_SUPABASE) {
          set({ isLoading: false });
          return { error: 'Invalid email or password' };
        }

        // Supabase auth
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          set({ isLoading: false });
          return { error: error.message };
        }
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          set({ user: profile, isLoading: false });
        }
        return {};
      },

      setUser: (profile) => set({ user: profile, isLoading: false }),

      signInWithGoogle: async () => {
        if (!IS_SUPABASE) return { error: 'Google sign-in requires Supabase' };
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        return { error: error?.message };
      },

      // Call after sign-in to migrate localStorage roster → Supabase
      migrateLocalStorage: async (userId, teamId) => {
        if (!IS_SUPABASE || !teamId) return;
        try {
          const raw = localStorage.getItem('rowiq_roster');
          if (!raw) return;
          const stored = JSON.parse(raw);
          const athletes = stored?.state?.athletes;
          if (!athletes || !athletes.length) return;

          await supabase.from('roster_athletes').upsert(
            athletes.map((a, i) => ({
              id: a.id,
              team_id: teamId,
              name: a.name,
              email: a.email || '',
              position: a.position || 'Mid',
              color_index: a.colorIndex ?? i,
            })),
            { onConflict: 'id' }
          );
          localStorage.removeItem('rowiq_roster');
        } catch { /* ignore */ }
      },

      signOut: async () => {
        if (IS_SUPABASE) await supabase.auth.signOut();
        set({ user: null });
      },

      updateProfile: (updates) => {
        const user = get().user;
        if (user) set({ user: { ...user, ...updates } });
      },
    }),
    {
      name: 'rowiq-auth',
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
