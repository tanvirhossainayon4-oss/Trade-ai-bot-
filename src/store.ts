import { create } from 'zustand';
import { Settings } from './types';

interface AppState {
  settings: Settings;
  setSettings: (settings: Settings) => void;
}

export const useAppStore = create<AppState>((set) => ({
  settings: { theme: 'dark', language: 'en', timezone: 'UTC' },
  setSettings: (settings) => set({ settings }),
}));
