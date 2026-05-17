'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useAdminStore } from '@/store/useAdminStore';
import { 
  QrCode, 
  Download, 
  Settings, 
  KeyRound, 
  Check, 
  Lock, 
  Info 
} from 'lucide-react';

export default function TabPanels() {
  const activeTab = useAdminStore((s) => s.activeTab);

  // QR Code tab states
  const [qrUrl, setQrUrl] = useState('');
  const [qrImage, setQrImage] = useState('');

  // Settings states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Set default QR URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setQrUrl(window.location.origin);
    }
  }, []);

  // Re-generate QR Code when active tab changes or url changes
  useEffect(() => {
    if (activeTab === 'qr' && qrUrl) {
      generateQrCode(qrUrl);
    }
  }, [activeTab, qrUrl]);

  // QR Code generator
  const generateQrCode = async (url: string) => {
    try {
      const generated = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#A97C37', // brand gold
          light: '#FFFFFF'
        }
      });
      setQrImage(generated);
    } catch (err) {
      console.error('QR code generation error:', err);
    }
  };

  // Submit password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');
    setIsUpdatingPassword(true);

    if (!oldPassword || !newPassword) {
      setSettingsError('Sandi lama dan sandi baru wajib diisi.');
      setIsUpdatingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setSettingsError('Konfirmasi sandi baru tidak cocok.');
      setIsUpdatingPassword(false);
      return;
    }

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'changePassword',
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSettingsSuccess('Sandi admin berhasil diperbarui!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setSettingsError(data.error || 'Gagal mengubah sandi.');
      }
    } catch (err) {
      console.error(err);
      setSettingsError('Kesalahan jaringan.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <>
      {/* Tab Content 2: QR CODE TAB */}
      {activeTab === 'qr' && (
        <div className="bg-candi-white rounded-2xl shadow-sm border border-candi-gold-light/60 p-6 md:p-8 animate-fade-in max-w-4xl mx-auto">
          <h2 className="font-serif text-xl font-bold text-candi-charcoal mb-4 flex items-center gap-2">
            <QrCode className="w-5.5 h-5.5 text-candi-gold" />
            <span>Konfigurasi & Generate QR Code</span>
          </h2>
          <p className="text-sm text-candi-muted mb-6 leading-relaxed">
            Generate QR Code fisik Candi Dadi. Tempel QR Code yang diunduh di area masuk candi agar pengunjung dapat memindai via HP dan langsung diarahkan ke formulir pengisian tamu.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-stone-100 pt-6">
            {/* QR Preview (Left) */}
            <div className="flex flex-col items-center justify-center p-6 bg-candi-cream/35 border border-candi-gold-light/50 rounded-2xl">
              {qrImage ? (
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-white rounded-xl shadow-md border border-stone-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrImage} alt="QR Code Candi Dadi" className="w-56 h-56 object-contain" />
                  </div>
                  <span className="text-xs font-bold text-candi-gold mt-4 uppercase tracking-widest">
                    Buku Tamu Candi Dadi
                  </span>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-candi-muted font-medium">
                  Membuat QR Code…
                </div>
              )}
            </div>

            {/* QR settings (Right) */}
            <div className="space-y-5">
              <div>
                <label htmlFor="url" className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-2">
                  URL Halaman Tamu (tamu.html / root)
                </label>
                <input
                  type="url"
                  id="url"
                  value={qrUrl}
                  onChange={(e) => {
                    setQrUrl(e.target.value);
                    generateQrCode(e.target.value);
                  }}
                  placeholder="Contoh: https://candi-dadi.netlify.app/"
                  className="w-full py-3 px-4 bg-candi-cream/30 border border-candi-gold-light hover:border-candi-gold/60 rounded-xl text-sm"
                />
                <span className="text-[11px] text-candi-muted mt-1.5 block leading-relaxed">
                  Ubah URL di atas untuk menyesuaikan domain production website Buku Tamu Anda setelah dideploy.
                </span>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={qrImage}
                  download="QR_Code_Buku_Tamu_Candi_Dadi.png"
                  className="px-5 py-3.5 bg-candi-gold hover:bg-candi-gold-dark text-white text-sm font-bold rounded-xl transition duration-150 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer flex-1 text-center font-sans"
                >
                  <Download className="w-4.5 h-4.5" />
                  <span>Unduh Gambar PNG</span>
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(qrUrl);
                    alert('URL Halaman Tamu berhasil disalin!');
                  }}
                  className="px-5 py-3.5 bg-candi-white hover:bg-candi-cream border border-candi-gold text-candi-gold text-sm font-bold rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm font-sans"
                >
                  <span>Salin URL</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Tab Content 4: PENGATURAN */}
      {activeTab === 'pengaturan' && (
        <div className="bg-candi-white rounded-2xl shadow-sm border border-candi-gold-light/60 p-6 md:p-8 animate-fade-in max-w-md mx-auto">
          <h2 className="font-serif text-xl font-bold text-candi-charcoal mb-4 flex items-center gap-2">
            <KeyRound className="w-5.5 h-5.5 text-candi-gold" />
            <span>Pengaturan Kata Sandi</span>
          </h2>
          <p className="text-xs text-candi-muted mb-6 leading-relaxed">
            Perbarui kata sandi administrator untuk mengamankan akses ke halaman Panel Admin ini.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-5">
            {settingsSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-bold flex items-center gap-1.5 animate-fade-in">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            {settingsError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium animate-fade-in">
                {settingsError}
              </div>
            )}

            <div>
              <label htmlFor="oldpass" className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-2">
                Kata Sandi Lama
              </label>
              <input
                type="password"
                id="oldpass"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan sandi saat ini..."
                className="w-full py-3 px-4 bg-candi-cream/30 border border-candi-gold-light hover:border-candi-gold/60 rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="newpass" className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-2">
                Kata Sandi Baru
              </label>
              <input
                type="password"
                id="newpass"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan sandi baru..."
                className="w-full py-3 px-4 bg-candi-cream/30 border border-candi-gold-light hover:border-candi-gold/60 rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmpass" className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-2">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                id="confirmpass"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi sandi baru..."
                className="w-full py-3 px-4 bg-candi-cream/30 border border-candi-gold-light hover:border-candi-gold/60 rounded-xl text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className={`w-full py-3.5 text-white font-bold rounded-xl transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                isUpdatingPassword 
                  ? 'bg-candi-muted cursor-not-allowed' 
                  : 'bg-candi-gold hover:bg-candi-gold-dark'
              }`}
            >
              <span>{isUpdatingPassword ? 'Menyimpan…' : 'Simpan Perubahan'}</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
