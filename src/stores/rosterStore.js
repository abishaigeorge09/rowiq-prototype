import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../utils/helpers';
import { IS_SUPABASE, supabase } from '../lib/supabase';

export const useRosterStore = create(
  persist(
    (set, get) => ({
      athletes: [],
      batches: [],
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      // Add athletes from a CSV upload. Creates a batch entry.
      addAthletes: (athletes, batchName) => {
        const batchId = generateId();
        const now = Date.now();
        const withBatch = athletes.map((a) => ({ ...a, batchId, createdAt: now }));
        set((state) => ({
          athletes: [...state.athletes, ...withBatch],
          batches: [
            ...state.batches,
            { id: batchId, name: batchName || 'Roster', uploadedAt: now, count: athletes.length },
          ],
        }));
        return batchId;
      },

      // Replace the entire roster with a fresh import (used by handleImport in App)
      setAthletes: (athletes) => {
        set({ athletes });
      },

      removeAthlete: (id) => {
        set((state) => ({ athletes: state.athletes.filter((a) => a.id !== id) }));
      },

      clearRoster: () => {
        set({ athletes: [], batches: [] });
      },

      // Migrate all localStorage athletes → Supabase roster_athletes table
      migrateToSupabase: async (teamId) => {
        if (!IS_SUPABASE || !teamId) return;
        const { athletes } = get();
        if (!athletes.length) return;

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
        // Clear localStorage copy after successful migration
        set({ athletes: [], batches: [] });
      },
    }),
    {
      name: 'rowiq_roster',
      partialize: (state) => ({ athletes: state.athletes, batches: state.batches }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
