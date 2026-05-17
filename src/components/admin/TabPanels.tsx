'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { useAdminStore } from '@/store/useAdminStore';
import { 
  QrCode, 
  Download, 
  Settings, 
  KeyRound, 
  Check, 
  Lock, 
  Info,
  MapPin
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

  // GPS settings states
  const [gpsLockEnabled, setGpsLockEnabled] = useState(false);
  const [candiLatitude, setCandiLatitude] = useState(-8.130248);
  const [candiLongitude, setCandiLongitude] = useState(111.926823);
  const [allowedRadiusMeters, setAllowedRadiusMeters] = useState(200);
  const [isUpdatingGPS, setIsUpdatingGPS] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState('');
  const [gpsError, setGpsError] = useState('');

  // Fetch current GPS settings on settings tab activation
  const fetchGpsSettings = () => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGpsLockEnabled(data.gps_lock_enabled);
          setCandiLatitude(data.candi_latitude);
          setCandiLongitude(data.candi_longitude);
          setAllowedRadiusMeters(data.allowed_radius_meters);
        }
      })
      .catch((err) => console.error('Failed to load GPS settings:', err));
  };

  useEffect(() => {
    if (activeTab === 'pengaturan') {
      fetchGpsSettings();
    }
  }, [activeTab]);

  // Submit GPS settings changes
  const handleUpdateGPS = async (e: React.FormEvent) => {
    e.preventDefault();
    setGpsError('');
    setGpsSuccess('');
    setIsUpdatingGPS(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateSettings',
          gpsLockEnabled,
          candiLatitude,
          candiLongitude,
          allowedRadiusMeters,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGpsSuccess('Pengaturan GPS & Geofencing berhasil diperbarui!');
      } else {
        setGpsError(data.error || 'Gagal memperbarui pengaturan GPS.');
      }
    } catch (err) {
      console.error(err);
      setGpsError('Kesalahan jaringan.');
    } finally {
      setIsUpdatingGPS(false);
    }
  };

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
          <h2 className="font-serif text-xl font-semibold text-candi-charcoal mb-4 flex items-center gap-2">
            <QrCode className="size-5.5 text-candi-gold" />
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
                    <Image src={qrImage} alt="QR Code Candi Dadi" width={224} height={224} className="size-56 object-contain" unoptimized />
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
                  <Download className="size-4.5" />
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
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          
          {/* Card 1: Kata Sandi (Left Column) */}
          <div className="bg-candi-white rounded-2xl shadow-sm border border-candi-gold-light/60 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h2 className="font-serif text-xl font-semibold text-candi-charcoal mb-4 flex items-center gap-2">
                <KeyRound className="size-5.5 text-candi-gold" />
                <span>Pengaturan Kata Sandi</span>
              </h2>
              <p className="text-xs text-candi-muted mb-6 leading-relaxed">
                Perbarui kata sandi administrator untuk mengamankan akses ke halaman Panel Admin ini.
              </p>

              <form onSubmit={handleChangePassword} className="space-y-5">
                {settingsSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-bold flex items-center gap-1.5 animate-fade-in">
                    <Check className="size-4 text-green-600 shrink-0" />
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
          </div>

          {/* Card 2: GPS Geofencing (Right Column) */}
          <div className="bg-candi-white rounded-2xl shadow-sm border border-candi-gold-light/60 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h2 className="font-serif text-xl font-semibold text-candi-charcoal mb-4 flex items-center gap-2">
                <MapPin className="size-5.5 text-candi-gold" />
                <span>Pengatur Lokasi & Geofencing GPS</span>
              </h2>
              <p className="text-xs text-candi-muted mb-6 leading-relaxed">
                Kunci pengisian buku tamu agar hanya dapat diakses oleh pengunjung yang benar-benar berada di lokasi cagar budaya.
              </p>

              <form onSubmit={handleUpdateGPS} className="space-y-5">
                {gpsSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-bold flex items-center gap-1.5 animate-fade-in">
                    <Check className="size-4 text-green-600 shrink-0" />
                    <span>{gpsSuccess}</span>
                  </div>
                )}

                {gpsError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium animate-fade-in">
                    {gpsError}
                  </div>
                )}

                {/* GPS Enable Toggle switch */}
                <div className="flex items-center justify-between p-3.5 bg-candi-cream/20 border border-candi-gold-light/40 rounded-xl">
                  <div>
                    <span className="text-sm font-bold text-candi-charcoal block">Aktifkan Kunci GPS</span>
                    <span className="text-[10px] text-candi-muted block mt-0.5">Wajibkan pengunjung share GPS handphone untuk check-in.</span>
                  </div>
                  <label htmlFor="gps_toggle" className="relative inline-flex items-center cursor-pointer" aria-label="Toggle GPS lock">
                    <input 
                      id="gps_toggle"
                      type="checkbox" 
                      checked={gpsLockEnabled}
                      onChange={(e) => setGpsLockEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-200 rounded-full peer peer-focus:ring-1 peer-focus:ring-candi-gold/40 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-candi-gold"></div>
                  </label>
                </div>

                {/* Coordinate Grid inputs */}
                <div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex gap-3 mb-4">
                    <Info className="size-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                      <strong className="block mb-0.5">Titik Lokasi Monumen Absolut</strong>
                      Koordinat di bawah ini adalah titik lokasi fisik candi/cagar budaya (didapat dari Google Maps), <b>bukan</b> lokasi HP admin saat ini. Sistem mengukur jarak pengunjung ke titik ini.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="latitude" className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-2">
                        Latitude (Lintang)
                      </label>
                      <input
                        type="number"
                        step="any"
                        id="latitude"
                        value={candiLatitude}
                        onChange={(e) => setCandiLatitude(parseFloat(e.target.value))}
                        placeholder="Contoh: -8.130248"
                        className="w-full py-3 px-4 bg-candi-cream/30 border border-candi-gold-light hover:border-candi-gold/60 rounded-xl text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="longitude" className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-2">
                        Longitude (Bujur)
                      </label>
                      <input
                        type="number"
                        step="any"
                        id="longitude"
                        value={candiLongitude}
                        onChange={(e) => setCandiLongitude(parseFloat(e.target.value))}
                        placeholder="Contoh: 111.926823"
                        className="w-full py-3 px-4 bg-candi-cream/30 border border-candi-gold-light hover:border-candi-gold/60 rounded-xl text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Allowed radius (slider + label indicator) */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="radius" className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider">
                      Jangkauan Radius Toleransi
                    </label>
                    <span className="text-xs font-bold text-candi-gold bg-candi-cream px-2 py-0.5 rounded border border-candi-gold/20">
                      {allowedRadiusMeters} Meter
                    </span>
                  </div>
                  <input
                    type="range"
                    id="radius"
                    min="50"
                    max="1000"
                    step="50"
                    value={allowedRadiusMeters}
                    onChange={(e) => setAllowedRadiusMeters(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-candi-gold"
                  />
                  <span className="text-[10px] text-candi-muted mt-1 block leading-relaxed">
                    Pengunjung dalam radius ini dapat mengisi data. Radius yang lebih tinggi mengurangi kemungkinan kegagalan akurasi GPS dalam ruang tertutup.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingGPS}
                  className={`w-full py-3.5 text-white font-bold rounded-xl transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                    isUpdatingGPS 
                      ? 'bg-candi-muted cursor-not-allowed' 
                      : 'bg-candi-gold hover:bg-candi-gold-dark'
                  }`}
                >
                  <span>{isUpdatingGPS ? 'Menyimpan…' : 'Simpan Koordinat'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
