import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PreferencesState {
  hapticsEnabled: boolean;
  setHapticsEnabled: (v: boolean) => void;

  lastSyncedAt: string | null;
  setLastSyncedAt: (iso: string) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      hapticsEnabled: true,
      setHapticsEnabled: (v) => set({ hapticsEnabled: v }),

      lastSyncedAt: null,
      setLastSyncedAt: (iso) => set({ lastSyncedAt: iso }),
    }),
    {
      name: 'stayoid:preferences',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
