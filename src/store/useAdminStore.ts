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
  pekerjaan?: string | null;
  orgName?: string | null;
  orgMembers?: number | null;
  orgPosition?: string | null;
  jenisOrganisasi?: string | null;
  createdAt: string;
}

interface PageStats {
  total: number;
  todayCount: number;
  personalCount: number;
  rombonganCount: number;
  totalOrgMembers: number;
  totalVisitors: number;
  uniqueCities: number;
  avgRating: number | string;
}

interface AdminState {
  guests: Guest[];
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  totalGuests: number;
  stats: PageStats;
  activeTab: 'daftar' | 'qr' | 'setup' | 'pengaturan';
  isLoading: boolean;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: 'daftar' | 'qr' | 'setup' | 'pengaturan') => void;
  setPage: (page: number) => void;
  fetchGuests: (page?: number) => Promise<void>;
  addGuest: (guestData: Omit<Guest, 'id' | 'createdAt'>) => Promise<boolean>;
  deleteGuest: (id: number) => Promise<boolean>;
  editGuest: (id: number, data: Partial<Guest>) => Promise<boolean>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  guests: [],
  searchQuery: '',
  currentPage: 1,
  totalPages: 1,
  totalGuests: 0,
  stats: { total: 0, todayCount: 0, personalCount: 0, rombonganCount: 0, totalOrgMembers: 0, totalVisitors: 0, uniqueCities: 0, avgRating: '—' },
  activeTab: 'daftar',
  isLoading: false,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setPage: (page) => set({ currentPage: page }),
  
  fetchGuests: async (page?: number) => {
    set({ isLoading: true });
    try {
      const { searchQuery, currentPage } = get();
      const p = page ?? currentPage;
      const params = new URLSearchParams({ page: String(p), pageSize: '20' });
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/guests?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          set({
            guests: data.data,
            currentPage: data.page,
            totalPages: data.totalPages,
            totalGuests: data.total,
            stats: data.stats,
          });
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
