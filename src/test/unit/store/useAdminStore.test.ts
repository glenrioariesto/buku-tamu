import { act, renderHook } from '@testing-library/react';
import { useAdminStore } from '@/store/useAdminStore';

const mockStats = {
  total: 100,
  todayCount: 5,
  personalCount: 60,
  rombonganCount: 10,
  totalOrgMembers: 200,
  totalVisitors: 260,
  uniqueCities: 20,
  avgRating: '4.5',
};

const mockGuests = [
  {
    id: 1, type: 'personal' as const, name: 'Budi', city: 'Tulungagung',
    province: 'Jawa Timur', country: 'Indonesia', phone: null,
    gender: 'L', visitPurpose: 'Wisata Edukasi', rating: 5,
    impression: null, pekerjaan: 'Mahasiswa', orgName: null,
    orgMembers: null, orgPosition: null, jenisOrganisasi: null,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

beforeEach(() => {
  useAdminStore.setState({
    guests: [],
    searchQuery: '',
    currentPage: 1,
    totalPages: 1,
    totalGuests: 0,
    stats: { total: 0, todayCount: 0, personalCount: 0, rombonganCount: 0, totalOrgMembers: 0, totalVisitors: 0, uniqueCities: 0, avgRating: '—' },
    isLoading: false,
  });
});

describe('useAdminStore — fetchGuests', () => {
  it('update stats saat fetch page 1', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockGuests,
        page: 1,
        totalPages: 3,
        total: 100,
        stats: mockStats,
      }),
    } as Response);

    const { result } = renderHook(() => useAdminStore());
    await act(async () => { await result.current.fetchGuests(1); });

    expect(result.current.stats.total).toBe(100);
    expect(result.current.stats.totalVisitors).toBe(260);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(3);
  });

  it('TIDAK overwrite stats saat fetch page 2 (stats null dari API)', async () => {
    useAdminStore.setState({ stats: mockStats });

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockGuests,
        page: 2,
        totalPages: 3,
        total: 100,
        stats: null,
      }),
    } as Response);

    const { result } = renderHook(() => useAdminStore());
    await act(async () => { await result.current.fetchGuests(2); });

    expect(result.current.stats.total).toBe(100);
    expect(result.current.stats.totalVisitors).toBe(260);
    expect(result.current.currentPage).toBe(2);
  });

  it('set isLoading true saat fetch, false setelah selesai', async () => {
    let resolveFetch!: (v: unknown) => void;
    global.fetch = jest.fn().mockReturnValueOnce(
      new Promise((r) => { resolveFetch = r; })
    );

    const { result } = renderHook(() => useAdminStore());
    act(() => { result.current.fetchGuests(); });
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveFetch({
        ok: true,
        json: async () => ({ success: true, data: [], page: 1, totalPages: 1, total: 0, stats: mockStats }),
      });
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('isLoading false jika fetch gagal (network error)', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAdminStore());
    await act(async () => { await result.current.fetchGuests(); });

    expect(result.current.isLoading).toBe(false);
  });
});

describe('useAdminStore — deleteGuest', () => {
  it('hapus guest dari list setelah delete berhasil', async () => {
    useAdminStore.setState({ guests: mockGuests });

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const { result } = renderHook(() => useAdminStore());
    await act(async () => { await result.current.deleteGuest(1); });

    expect(result.current.guests).toHaveLength(0);
  });

  it('tidak hapus guest jika API gagal', async () => {
    useAdminStore.setState({ guests: mockGuests });

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false }),
    } as Response);

    const { result } = renderHook(() => useAdminStore());
    const success = await act(async () => result.current.deleteGuest(1));

    expect(result.current.guests).toHaveLength(1);
    expect(success).toBe(false);
  });
});

describe('useAdminStore — setSearchQuery & setPage', () => {
  it('update searchQuery', () => {
    const { result } = renderHook(() => useAdminStore());
    act(() => { result.current.setSearchQuery('Budi'); });
    expect(result.current.searchQuery).toBe('Budi');
  });

  it('update currentPage', () => {
    const { result } = renderHook(() => useAdminStore());
    act(() => { result.current.setPage(3); });
    expect(result.current.currentPage).toBe(3);
  });
});
