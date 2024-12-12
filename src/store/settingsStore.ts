import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface SettingsState {
  theme: Theme;
  backgroundColor: string;
  showGrid: boolean;
  viewDistance: number;
  originVisible: boolean;  // New setting
  setTheme: (theme: Theme) => void;
  setBackgroundColor: (color: string) => void;
  setShowGrid: (show: boolean) => void;
  setViewDistance: (distance: number) => void;
  setOriginVisible: (visible: boolean) => void;  // New setter
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      backgroundColor: '#f0f0f0',
      showGrid: true,
      viewDistance: 30,
      originVisible: true,  // Default to visible
      setTheme: (theme) => set({ theme }),
      setBackgroundColor: (color) => set({ backgroundColor: color }),
      setShowGrid: (show) => set({ showGrid: show }),
      setViewDistance: (distance) => set({ viewDistance: distance }),
      setOriginVisible: (visible) => set({ originVisible: visible })
    }),
    {
      name: 'webcad-settings',
    }
  )
);
