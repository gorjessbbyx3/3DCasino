import { create } from 'zustand';

type RoomType = 'slots' | 'fish';

interface RoomState {
  currentRoom: RoomType;
  setCurrentRoom: (room: RoomType) => void;
  selectedFishTable: number | null;
  setSelectedFishTable: (tableNumber: number | null) => void;
}

export const useRoom = create<RoomState>((set) => ({
  currentRoom: 'slots',
  setCurrentRoom: (room) => set({ currentRoom: room }),
  selectedFishTable: null,
  setSelectedFishTable: (tableNumber) => set({ selectedFishTable: tableNumber }),
}));
