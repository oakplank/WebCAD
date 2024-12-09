import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface SettingsState {
  theme: Theme;
  backgroundColor: string;
  showGrid: boolean;
  viewDistance: number;
  setTheme: (theme: Theme) => void;
  setBackgroundColor: (color: string) => void;
  setShowGrid: (show: boolean) => void;
  setViewDistance: (distance: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      backgroundColor: '#f0f0f0',
      showGrid: true,
      viewDistance: 30,
      setTheme: (theme) => set({ theme }),
      setBackgroundColor: (color) => set({ backgroundColor: color }), // Fixed the backgroundColor update
      setShowGrid: (show) => set({ showGrid: show }),
      setViewDistance: (distance) => set({ viewDistance: distance }),
    }),
    {
      name: 'webcad-settings',
    }
  )
);