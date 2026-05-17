import { create } from 'zustand';

export interface Guest {
  id: number;
  type: 'personal' | 'rombongan';
  name: string;
  city: string;
  province?: string | null;
  country?: string | null;
  phone?: string | null;
  gender?: string | null;
  visitPurpose?: string | null;
  rating?: number | null;
  impression?: string | null;
  orgName?: string | null;
  orgMembers?: number | null;
  orgPosition?: string | null;
  createdAt: string;
}

interface AdminState {
  guests: Guest[];
  searchQuery: string;
  activeTab: 'daftar' | 'qr' | 'setup' | 'pengaturan';
  isLoading: boolean;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: 'daftar' | 'qr' | 'setup' | 'pengaturan') => void;
  fetchGuests: () => Promise<void>;
  addGuest: (guestData: Omit<Guest, 'id' | 'createdAt'>) => Promise<boolean>;
  deleteGuest: (id: number) => Promise<boolean>;
  editGuest: (id: number, data: Partial<Guest>) => Promise<boolean>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  guests: [],
  searchQuery: '',
  activeTab: 'daftar',
  isLoading: false,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  fetchGuests: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/guests');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          set({ guests: data.data });
        }
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addGuest: async (guestData) => {
    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Re-fetch all to get latest metrics and order
          await get().fetchGuests();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error adding guest:', error);
      return false;
    }
  },

  deleteGuest: async (id) => {
    try {
      const res = await fetch(`/api/guests?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          set({ guests: get().guests.filter((g) => g.id !== id) });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error deleting guest:', error);
      return false;
    }
  },

  editGuest: async (id, updatedFields) => {
    try {
      const res = await fetch('/api/guests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updatedFields }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          set({
            guests: get().guests.map((g) => (g.id === id ? { ...g, ...data.data } : g)),
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error editing guest:', error);
      return false;
    }
  },
}));
