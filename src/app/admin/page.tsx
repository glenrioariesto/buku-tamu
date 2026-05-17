'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import StatCards from '@/components/admin/StatCards';
import VisitorTable from '@/components/admin/VisitorTable';
import TabPanels from '@/components/admin/TabPanels';
import { 
  Lock, 
  Settings, 
  BookOpen, 
  QrCode, 
  KeyRound, 
  LogOut, 
  Database
} from 'lucide-react';

export default function AdminPortal() {
  const guests = useAdminStore((s) => s.guests);
  const activeTab = useAdminStore((s) => s.activeTab);
  const setActiveTab = useAdminStore((s) => s.setActiveTab);
  const fetchGuests = useAdminStore((s) => s.fetchGuests);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Restore session on mount and fetch guests if already logged in
  useEffect(() => {
    const session = sessionStorage.getItem('admin_session');
    if (session === 'active') {
      setIsLoggedIn(true);
      fetchGuests();
    }
  }, [fetchGuests]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsAuthenticating(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', password: adminPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsLoggedIn(true);
        fetchGuests();
        // Save local session
        sessionStorage.setItem('admin_session', 'active');
      } else {
        setLoginError(data.error || 'Password salah.');
      }
    } catch (err) {
      console.error(err);
      setLoginError('Terjadi kesalahan koneksi.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAdminPassword('');
    sessionStorage.removeItem('admin_session');
  };

  // Admin Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-candi-cream selection:bg-candi-gold/20">
        <div className="w-full max-w-md bg-candi-white rounded-2xl shadow-xl border border-candi-gold-light/60 p-6 md:p-8 animate-fade-in">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center size-16 bg-candi-cream rounded-full border-2 border-candi-gold-light/80 shadow-inner mb-3">
              <svg viewBox="0 0 100 100" className="size-9 fill-candi-gold">
                <path d="M50 15 L57 25 H43 L50 15 Z M50 25 L65 40 H35 L50 25 Z M50 40 L72 65 H28 L50 40 Z M33 65 H67 V90 H33 V65 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
                <rect x="44" y="73" width="12" height="17" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <h1 className="font-serif text-2xl font-semibold tracking-wide text-candi-charcoal">LOGIN ADMINISTRATOR</h1>
            <p className="text-xs font-semibold tracking-widest text-candi-gold uppercase mt-0.5">Buku Tamu Candi Dadi</p>
            <div className="w-16 h-0.5 bg-candi-gold/30 mx-auto mt-2"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {loginError}
              </div>
            )}

            <div>
              <label htmlFor="pass" className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-2">
                Sandi Pengelola (Password)
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="pass"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Masukkan sandi..."
                  className="w-full py-3.5 pl-11 pr-4 bg-candi-cream/30 border border-candi-gold-light hover:border-candi-gold/60 rounded-xl text-sm"
                  required
                />
                <Lock className="size-4 text-candi-muted absolute left-4 top-4" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className={`w-full py-3.5 text-white font-bold rounded-xl transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                isAuthenticating 
                  ? 'bg-candi-muted cursor-not-allowed' 
                  : 'bg-candi-gold hover:bg-candi-gold-dark'
              }`}
            >
              {isAuthenticating ? 'Memverifikasi...' : 'Masuk Panel Admin'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-candi-cream selection:bg-candi-gold/20 flex flex-col">
      {/* Header Panel - EXACT MATCH to screenshot */}
      <header className="bg-candi-white border-b border-candi-gold-light py-4 px-6 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-12 bg-candi-cream rounded-xl flex items-center justify-center border border-candi-gold-light/80 shadow-sm">
              <svg viewBox="0 0 100 100" className="size-7 fill-candi-gold">
                <path d="M50 15 L57 25 H43 L50 15 Z M50 25 L65 40 H35 L50 25 Z M50 40 L72 65 H28 L50 40 Z M33 65 H67 V90 H33 V65 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
                <rect x="44" y="73" width="12" height="17" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <div>
              <h1 className="font-serif text-xl md:text-2xl font-semibold tracking-wide text-candi-charcoal leading-tight">
                PANEL ADMIN - CANDI DADI
              </h1>
              <p className="text-xs font-semibold text-candi-muted tracking-wider">
                Buku Tamu Pengunjung
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-stone-200 hover:border-candi-gold hover:text-candi-gold text-candi-charcoal text-sm font-semibold rounded-lg transition duration-150 flex items-center gap-2 cursor-pointer bg-candi-white font-sans"
          >
            <LogOut className="size-4" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-6 px-4 md:px-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Tab Navigation Menu */}
        <div className="border-b border-stone-200">
          <nav className="flex flex-wrap -mb-px gap-4 sm:gap-6">
            <button
              onClick={() => setActiveTab('daftar')}
              className={`py-3.5 px-1 border-b-2 font-semibold text-sm transition duration-150 flex items-center gap-2 cursor-pointer ${
                activeTab === 'daftar'
                  ? 'border-candi-gold text-candi-gold'
                  : 'border-transparent text-candi-muted hover:text-candi-charcoal hover:border-stone-300'
              }`}
            >
              <BookOpen className="size-4.5" />
              <span>Daftar Pengunjung</span>
            </button>

            <button
              onClick={() => setActiveTab('qr')}
              className={`py-3.5 px-1 border-b-2 font-semibold text-sm transition duration-150 flex items-center gap-2 cursor-pointer ${
                activeTab === 'qr'
                  ? 'border-candi-gold text-candi-gold'
                  : 'border-transparent text-candi-muted hover:text-candi-charcoal hover:border-stone-300'
              }`}
            >
              <QrCode className="size-4.5" />
              <span>QR Code</span>
            </button>

            <button
              onClick={() => setActiveTab('pengaturan')}
              className={`py-3.5 px-1 border-b-2 font-semibold text-sm transition duration-150 flex items-center gap-2 cursor-pointer ${
                activeTab === 'pengaturan'
                  ? 'border-candi-gold text-candi-gold'
                  : 'border-transparent text-candi-muted hover:text-candi-charcoal hover:border-stone-300'
              }`}
            >
              <KeyRound className="size-4.5" />
              <span>Pengaturan</span>
            </button>
          </nav>
        </div>

        {/* Tab Content 1: DAFTAR PENGUNJUNG */}
        {activeTab === 'daftar' && (
          <div className="space-y-6">
            <StatCards />
            <VisitorTable />
          </div>
        )}

        {/* Tab Contents 2, 3, & 4 */}
        <TabPanels />
      </main>

      {/* Footer copyright */}
      <footer suppressHydrationWarning className="py-4 border-t border-candi-gold-light/40 text-center text-xs text-candi-muted font-medium bg-candi-white">
        © {new Date().getFullYear()} Candi Dadi Panel Admin. All rights reserved.
      </footer>
    </div>
  );
}
