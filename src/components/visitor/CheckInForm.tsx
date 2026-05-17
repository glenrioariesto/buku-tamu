'use client';

import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import CustomSelect, { Option } from '@/components/ui/CustomSelect';

const VISIT_PURPOSE_OPTIONS: Option[] = [
  { label: '🌿 Wisata & Rekreasi', value: 'group1', isGroup: true },
  { label: 'Wisata Edukasi', value: 'Wisata Edukasi' },
  { label: 'Wisata Keluarga', value: 'Wisata Keluarga' },
  { label: 'Wisata Budaya & Sejarah', value: 'Wisata Budaya & Sejarah' },
  { label: 'Fotografi / Dokumentasi', value: 'Fotografi / Dokumentasi' },
  { label: '🎓 Akademik & Penelitian', value: 'group2', isGroup: true },
  { label: 'Penelitian Akademik / Skripsi / Tesis', value: 'Penelitian Akademik / Skripsi / Tesis' },
  { label: 'Kunjungan Sekolah / Studi Tour', value: 'Kunjungan Sekolah / Studi Tour' },
  { label: 'Penelitian Arkeologi & Sejarah', value: 'Penelitian Arkeologi & Sejarah' },
  { label: '🏛️ Kedinasan', value: 'group3', isGroup: true },
  { label: 'Kunjungan Resmi / Kedinasan', value: 'Kunjungan Resmi / Kedinasan' },
  { label: 'Pemantauan & Monitoring', value: 'Pemantauan & Monitoring' },
  { label: 'Koordinasi Pengelolaan Cagar Budaya', value: 'Koordinasi Pengelolaan Cagar Budaya' },
  { label: '✨ Lainnya', value: 'group4', isGroup: true },
  { label: 'Kegiatan Spiritual / Ziarah Budaya', value: 'Kegiatan Spiritual / Ziarah Budaya' },
  { label: 'Media / Jurnalistik / Konten', value: 'Media / Jurnalistik / Konten' },
  { label: 'Lainnya', value: 'Lainnya' }
];

interface CheckInFormProps {
  onSuccess: (name: string) => void;
}

export default function CheckInForm({ onSuccess }: CheckInFormProps) {
  const [visitorType, setVisitorType] = useState<'personal' | 'rombongan'>('personal');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('Indonesia');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [visitPurpose, setVisitPurpose] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [impression, setImpression] = useState('');
  
  // Organization details
  const [orgName, setOrgName] = useState('');
  const [orgMembers, setOrgMembers] = useState('');
  const [orgPosition, setOrgPosition] = useState('');

  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // GPS Geofencing Lock states
  const [gpsSettings, setGpsSettings] = useState<{
    enabled: boolean;
    lat: number;
    lng: number;
    radius: number;
  } | null>(null);
  const [gpsChecking, setGpsChecking] = useState(false);
  const [gpsLockError, setGpsLockError] = useState('');

  // Validations
  const [touched, setTouched] = useState({ name: false, city: false, orgName: false, orgMembers: false });

  // Dynamic regional location data
  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>([]);
  const [regencies, setRegencies] = useState<{ id: string; province_id: string; name: string }[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState('');

  const toTitleCase = (str: string) => {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Load provinces static database
  const fetchProvincesConfig = async () => {
    try {
      const res = await fetch('/api/provinces.json');
      if (res.ok) {
        const data = await res.json();
        setProvinces(data);
      }
    } catch (err) {
      console.error('Failed to load provinces:', err);
    }
  };

  useEffect(() => {
    fetchProvincesConfig();
  }, []);

  // Fetch active GPS geofencing rules from DB anonymously
  const fetchGpsRules = () => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGpsSettings({
            enabled: data.gps_lock_enabled,
            lat: data.candi_latitude,
            lng: data.candi_longitude,
            radius: data.allowed_radius_meters,
          });
        }
      })
      .catch((err) => console.error('Failed to load GPS config:', err));
  };

  useEffect(() => {
    fetchGpsRules();
  }, []);

  // Load regencies dynamically
  const fetchRegenciesConfig = async (provId: string) => {
    try {
      const res = await fetch(`/api/regencies/${provId}.json`);
      if (res.ok) {
        const data = await res.json();
        setRegencies(data);
      }
    } catch (err) {
      console.error('Failed to load regencies:', err);
    }
  };

  useEffect(() => {
    if (!selectedProvinceId) {
      setRegencies([]);
      return;
    }
    fetchRegenciesConfig(selectedProvinceId);
  }, [selectedProvinceId]);

  // Haversine formula to compute distance in meters between user and temple
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  };

  const validateForm = () => {
    if (!name.trim()) return 'Nama Lengkap wajib diisi.';
    if (!city.trim()) return 'Asal Kota/Kabupaten wajib diisi.';
    if (visitorType === 'rombongan') {
      if (!orgName.trim()) return 'Nama Organisasi/Rombongan wajib diisi.';
      if (!orgMembers || Number(orgMembers) <= 0) return 'Jumlah Anggota rombongan wajib diisi.';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, city: true, orgName: true, orgMembers: true });

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage('');
    setGpsLockError('');

    // GPS Geofencing verification
    if (gpsSettings && gpsSettings.enabled) {
      setGpsChecking(true);
      
      const checkGps = (): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
      };

      try {
        const position = await checkGps();
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const distance = getDistance(userLat, userLng, gpsSettings.lat, gpsSettings.lng);

        if (distance > gpsSettings.radius) {
          setGpsLockError(`Anda terdeteksi berada di luar area Candi Dadi (jarak Anda: ${Math.round(distance)}m). Batas toleransi pengisian adalah ${gpsSettings.radius}m. Pengisian buku tamu wajib di lokasi.`);
          setGpsChecking(false);
          return;
        }
      } catch (err: any) {
        console.error('GPS access error:', err);
        let errMsg = 'Gagal mengakses lokasi GPS Anda. Mohon aktifkan GPS handphone Anda dan izinkan browser mengakses lokasi di browser untuk mengisi buku tamu.';
        if (err.code === 1) {
          errMsg = 'Izin lokasi ditolak. Silakan aktifkan izin lokasi browser di pengaturan handphone Anda agar dapat check-in.';
        } else if (err.code === 3) {
          errMsg = 'Waktu permintaan lokasi habis (timeout). Silakan segarkan halaman dan coba lagi di area terbuka.';
        }
        setGpsLockError(errMsg);
        setGpsChecking(false);
        return;
      }
      
      setGpsChecking(false);
    }

    setIsSubmitting(true);

    try {
      const payload = {
        type: visitorType,
        name,
        city,
        province: province || null,
        country: country || 'Indonesia',
        phone: phone || null,
        gender: gender || null,
        visitPurpose: visitPurpose || null,
        rating: rating > 0 ? rating : null,
        impression: impression || null,
        ...(visitorType === 'rombongan' ? {
          orgName,
          orgMembers: Number(orgMembers),
          orgPosition: orgPosition || null,
        } : {})
      };

      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess(name);
      } else {
        setErrorMessage(data.error || 'Terjadi kesalahan saat menyimpan data.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Koneksi internet bermasalah. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[14px] shadow-[0_4px_24px_rgba(44,36,22,0.18)] border border-tamu-parch3 p-7 relative overflow-hidden">
      {/* Top decorative line */}
      <div 
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: 'linear-gradient(90deg, var(--color-candi-gold-dark), var(--color-candi-gold), var(--color-candi-gold-light), var(--color-candi-gold), var(--color-candi-gold-dark))' }}
      ></div>

      {/* Geofencing Verification Overlay Loader */}
      {gpsChecking && (
        <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center z-25 animate-fade-in">
          <div className="size-16 rounded-full bg-[#f7f0e2] flex items-center justify-center border border-candi-gold/30 animate-pulse mb-4">
            <MapPin className="size-8 text-candi-gold" />
          </div>
          <h4 className="font-serif text-lg font-semibold text-candi-charcoal">Memverifikasi Lokasi GPS Anda…</h4>
          <p className="text-xs text-candi-muted mt-2 max-w-xs leading-relaxed">
            Sistem sedang memastikan koordinat GPS Anda berada dalam area cagar budaya Candi Dadi demi keaslian data kunjungan.
          </p>
        </div>
      )}

      {/* Greeting text */}
      <p className="font-crimson italic text-candi-muted mb-[22px] whitespace-nowrap text-center tracking-tight text-[11px] min-[400px]:text-[12px] sm:text-[14px] md:text-[15px]">
        Selamat datang di Candi Dadi. Mohon isi buku tamu sebagai tanda kehadiran Anda. 🙏
      </p>

      {/* JENIS PENGUNJUNG */}
      <div className="tamu-section">
        <div className="tamu-section-title">Jenis Pengunjung</div>
        
        {/* Visitor Type Animated Switcher (type-toggle) */}
        <div className="flex bg-[#f7f0e2] border-[1.5px] border-tamu-parch3 p-1 rounded-[10px] mb-2">
          <button
            type="button"
            onClick={() => { setVisitorType('personal'); setErrorMessage(''); }}
            className={`flex-1 p-[10px] rounded-[7px] text-[13px] font-medium transition-all duration-200 text-center cursor-pointer ${
              visitorType === 'personal'
                ? 'bg-white text-candi-gold shadow-[0_2px_8px_rgba(44,36,22,0.18)]'
                : 'bg-transparent text-[#9a8468] hover:text-candi-charcoal'
            }`}
          >
            <span className="block text-[22px] mb-[3px] leading-none">🧍</span>
            <span className="block text-[11px]">Personal</span>
          </button>
          <button
            type="button"
            onClick={() => { setVisitorType('rombongan'); setErrorMessage(''); }}
            className={`flex-1 p-[10px] rounded-[7px] text-[13px] font-medium transition-all duration-200 text-center cursor-pointer ${
              visitorType === 'rombongan'
                ? 'bg-white text-candi-gold shadow-[0_2px_8px_rgba(44,36,22,0.18)]'
                : 'bg-transparent text-[#9a8468] hover:text-candi-charcoal'
            }`}
          >
            <span className="block text-[22px] mb-[3px] leading-none">🏢</span>
            <span className="block text-[11px]">Rombongan / Organisasi</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* GPS Geofencing Lockout Alert */}
        {gpsLockError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-bold flex flex-col gap-2 animate-fade-in mb-4">
            <div className="flex items-start gap-2.5">
              <MapPin className="size-5 text-red-600 shrink-0 mt-0.5" />
              <span>{gpsLockError}</span>
            </div>
          </div>
        )}

        {/* Error Message banner */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-xl text-sm text-red-600 font-medium animate-pulse mb-4">
            {errorMessage}
          </div>
        )}

        {/* IDENTITAS PENGUNJUNG */}
        <div className="tamu-section">
          <div className="tamu-section-title">Identitas Pengunjung</div>
          <div className="tamu-row2">
            <div className="tamu-field">
              <label htmlFor="name">Nama Lengkap <span className="tamu-req">*</span></label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                placeholder="Nama lengkap Anda..."
                className={`tamu-input ${touched.name && !name.trim() ? 'error' : ''}`}
              />
            </div>
            <div className="tamu-field">
              <label htmlFor="gender">Jenis Kelamin</label>
              <CustomSelect 
                id="gender" 
                value={gender} 
                onChange={(val) => setGender(val)}
                options={[
                  { value: 'L', label: 'Laki-laki' },
                  { value: 'P', label: 'Perempuan' }
                ]}
                placeholder="-- Pilih --"
              />
            </div>
          </div>
          <div className="tamu-field">
            <label htmlFor="phone">No. HP / WhatsApp</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xx-xxxx-xxxx (opsional)"
              className="tamu-input"
            />
          </div>
        </div>

        {/* DATA ORGANISASI / ROMBONGAN */}
        {visitorType === 'rombongan' && (
          <div className="tamu-section animate-fade-in">
            <div className="tamu-section-title">Data Organisasi / Rombongan</div>
            <div className="tamu-row2">
              <div className="tamu-field">
                <label htmlFor="orgName">Nama Organisasi / Instansi <span className="tamu-req">*</span></label>
                <input
                  type="text"
                  id="orgName"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, orgName: true }))}
                  placeholder="Nama organisasi..."
                  className={`tamu-input ${touched.orgName && !orgName.trim() ? 'error' : ''}`}
                />
              </div>
              <div className="tamu-field">
                <label htmlFor="orgMembers">Jumlah Anggota <span className="tamu-req">*</span></label>
                <input
                  type="number"
                  id="orgMembers"
                  min="2"
                  value={orgMembers}
                  onChange={(e) => setOrgMembers(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, orgMembers: true }))}
                  placeholder="Contoh: 35"
                  className={`tamu-input ${touched.orgMembers && (!orgMembers || Number(orgMembers) <= 0) ? 'error' : ''}`}
                />
              </div>
            </div>
            <div className="tamu-field">
              <label htmlFor="orgPosition">Jabatan / Posisi</label>
              <input
                type="text"
                id="orgPosition"
                value={orgPosition}
                onChange={(e) => setOrgPosition(e.target.value)}
                placeholder="Ketua rombongan, guru pendamping..."
                className="tamu-input"
              />
            </div>
          </div>
        )}

        {/* ASAL DAERAH */}
        <div className="tamu-section">
          <div className="tamu-section-title">Asal Daerah</div>
          
          <div className="tamu-field" style={{ marginBottom: '18px' }}>
            <label className="flex items-center gap-2 cursor-pointer" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
              <input 
                type="checkbox" 
                checked={country.toLowerCase() !== 'indonesia'}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCountry(''); // Kosongkan agar bisa diisi nama negara
                    setProvince('');
                    setCity('');
                    setSelectedProvinceId('');
                  } else {
                    setCountry('Indonesia');
                    setProvince('');
                    setCity('');
                    setSelectedProvinceId('');
                  }
                }}
                className="size-[15px] cursor-pointer accent-[#b8841a]"
              />
              <span className="text-[13px] text-[#5a4a30] font-medium">Berasal dari luar negeri?</span>
            </label>
          </div>

          <div className="tamu-row2">
            <div className="tamu-field">
              <label htmlFor="city">Asal Kota / Kabupaten <span className="tamu-req">*</span></label>
              {country.toLowerCase() === 'indonesia' ? (
                <CustomSelect
                  id="city"
                  value={city}
                  onChange={(val) => {
                    setCity(val);
                    setTouched(prev => ({ ...prev, city: true }));
                  }}
                  disabled={!selectedProvinceId}
                  options={regencies.map(reg => ({ value: toTitleCase(reg.name), label: toTitleCase(reg.name) }))}
                  placeholder={selectedProvinceId ? '-- Pilih Kota/Kabupaten --' : '-- Pilih --'}
                  error={touched.city && !city.trim()}
                />
              ) : (
                <input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, city: true }))}
                  placeholder="Contoh: Kuala Lumpur..."
                  className={`tamu-input ${touched.city && !city.trim() ? 'error' : ''}`}
                />
              )}
            </div>
            <div className="tamu-field">
              <label htmlFor="province">Provinsi</label>
              {country.toLowerCase() === 'indonesia' ? (
                <CustomSelect
                  id="province"
                  value={selectedProvinceId}
                  onChange={(val) => {
                    setSelectedProvinceId(val);
                    const selectedProv = provinces.find((p) => p.id === val);
                    setProvince(selectedProv ? toTitleCase(selectedProv.name) : '');
                    setCity('');
                  }}
                  options={provinces.map(prov => ({ value: prov.id, label: toTitleCase(prov.name) }))}
                  placeholder="-- Pilih --"
                />
              ) : (
                <input
                  type="text"
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Negara Bagian (opsional)"
                  className="tamu-input"
                />
              )}
            </div>
          </div>
          
          {country.toLowerCase() !== 'indonesia' && (
            <div className="tamu-field mt-3">
              <label htmlFor="country">
                Negara Asal <span className="tamu-req">*</span>
              </label>
              <input
                type="text"
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Contoh: Malaysia, Belanda..."
                className="tamu-input"
              />
            </div>
          )}
        </div>

        {/* TUJUAN & KESAN */}
        <div className="tamu-section">
          <div className="tamu-section-title">Tujuan & Kesan</div>
          <div className="tamu-field">
            <label htmlFor="visitPurpose">Tujuan Kunjungan</label>
            <CustomSelect
              id="visitPurpose"
              value={visitPurpose}
              onChange={(val) => setVisitPurpose(val)}
              options={VISIT_PURPOSE_OPTIONS}
              placeholder="-- Pilih Tujuan --"
            />
          </div>
          <div className="tamu-field">
            <label htmlFor="impression">Kesan Kunjungan</label>
            <textarea
              id="impression"
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              placeholder="Ceritakan pengalaman Anda mengunjungi Candi Dadi..."
              className="tamu-textarea"
            />
          </div>
          <div className="tamu-field">
            <div className="block text-[11px] font-semibold uppercase tracking-[1.2px] text-[#9a8468] mb-[8px]" role="group" aria-label="Penilaian">Penilaian</div>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="bg-transparent border-none text-[22px] cursor-pointer p-0.5 leading-none transition-all duration-150"
                  style={{ opacity: star <= (hoverRating || rating) ? 1 : 0.3 }}
                  title={['Kurang', 'Cukup', 'Baik', 'Sangat Baik', 'Luar Biasa'][star - 1]}
                >
                  ⭐
                </button>
              ))}
            </div>
            <div style={{ fontSize: '11px', color: '#9a8468', marginTop: '5px' }}>
              {(hoverRating || rating) > 0 
                ? ['', 'Kurang', 'Cukup', 'Baik', 'Sangat Baik', 'Luar Biasa! ✨'][hoverRating || rating] 
                : 'Pilih bintang penilaian'}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="tamu-btn-submit"
        >
          {isSubmitting ? 'MENGIRIM…' : <>🏛️ &nbsp;Kirim Buku Tamu</>}
        </button>
      </form>
    </div>
  );
}
