import { create } from "zustand";

export interface User {
  id: number;
  username: string;
  balance: number;
}

interface UserState {
  user: User | null;
  showAuthModal: boolean;
  
  setUser: (user: User | null) => void;
  setShowAuthModal: (show: boolean) => void;
  logout: () => void;
}

export const useUser = create<UserState>((set) => ({
  user: null,
  showAuthModal: false,
  
  setUser: (user) => set({ user }),
  setShowAuthModal: (showAuthModal) => set({ showAuthModal }),
  logout: () => set({ user: null }),
}));
