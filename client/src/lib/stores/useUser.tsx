import { create } from "zustand";

export interface User {
  id: number;
  username: string;
  balance: number;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  showAuthModal: boolean;
  
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setShowAuthModal: (show: boolean) => void;
  logout: () => void;
}

export const useUser = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  showAuthModal: false,
  
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setShowAuthModal: (showAuthModal) => set({ showAuthModal }),
  logout: () => set({ user: null }),
}));
