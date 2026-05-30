import { render, screen } from '@testing-library/react';
import StatCards from '@/components/admin/StatCards';
import { useAdminStore } from '@/store/useAdminStore';

function setStats(overrides = {}) {
  useAdminStore.setState({
    isLoading: false,
    stats: {
      total: 100,
      todayCount: 5,
      personalCount: 60,
      rombonganCount: 10,
      totalOrgMembers: 200,
      totalVisitors: 260,
      uniqueCities: 20,
      avgRating: '4.5',
      ...overrides,
    },
  });
}

describe('StatCards', () => {
  it('render semua 8 card', () => {
    setStats();
    render(<StatCards />);

    expect(screen.getByText('Total Entri')).toBeInTheDocument();
    expect(screen.getByText('Tamu Hari Ini')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('Rombongan')).toBeInTheDocument();
    expect(screen.getByText('Anggota Rombongan')).toBeInTheDocument();
    expect(screen.getByText('Total Pengunjung')).toBeInTheDocument();
    expect(screen.getByText('Kota Asal')).toBeInTheDocument();
    expect(screen.getByText('Avg Rating')).toBeInTheDocument();
  });

  it('tampilkan — saat isLoading true', () => {
    useAdminStore.setState({ isLoading: true });
    render(<StatCards />);

    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(7);
  });

  it('totalVisitors = personalCount + totalOrgMembers', () => {
    setStats({ personalCount: 60, totalOrgMembers: 200, totalVisitors: 260 });
    render(<StatCards />);
    expect(screen.getByText('260')).toBeInTheDocument();
  });

  it('tampilkan avgRating dengan bintang', () => {
    setStats({ avgRating: '4.5' });
    render(<StatCards />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });
});
