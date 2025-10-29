import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AudioState {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  toggleMusic: () => void;
  toggleSfx: () => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
}

export const useAudio = create<AudioState>()(
  persist(
    (set) => ({
      musicEnabled: true,
      sfxEnabled: true,
      musicVolume: 0.3,
      sfxVolume: 0.5,
      toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
      toggleSfx: () => set((state) => ({ sfxEnabled: !state.sfxEnabled })),
      setMusicVolume: (volume: number) => set({ musicVolume: volume }),
      setSfxVolume: (volume: number) => set({ sfxVolume: volume }),
    }),
    {
      name: "audio-settings",
    }
  )
);
