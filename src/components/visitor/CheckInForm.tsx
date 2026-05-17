'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Users, 
  MapPin, 
  Building, 
  Phone, 
  Star, 
  Smile, 
  Heart,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';

const VISIT_PURPOSES = [
  "Wisata & Rekreasi",
  "Akademik & Penelitian",
  "Kedinasan",
  "Lainnya"
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  useEffect(() => {
    async function loadProvinces() {
      try {
        const res = await fetch('/api/provinces.json');
        if (res.ok) {
          const data = await res.json();
          setProvinces(data);
        }
      } catch (err) {
        console.error('Failed to load provinces:', err);
      }
    }
    loadProvinces();
  }, []);

  useEffect(() => {
    if (!selectedProvinceId) {
      setRegencies([]);
      return;
    }
    async function loadRegencies() {
      try {
        const res = await fetch(`/api/regencies/${selectedProvinceId}.json`);
        if (res.ok) {
          const data = await res.json();
          setRegencies(data);
        }
      } catch (err) {
        console.error('Failed to load regencies:', err);
      }
    }
    loadRegencies();
  }, [selectedProvinceId]);

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
    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-candi-white rounded-2xl shadow-xl border border-candi-gold-light/60 p-6 md:p-8">
      {/* Visitor Type Animated Switcher */}
      <div className="flex bg-candi-cream p-1 rounded-xl mb-6 border border-candi-gold-light/50">
        <button
          type="button"
          onClick={() => { setVisitorType('personal'); setErrorMessage(''); }}
          className={`flex-1 py-3 text-sm font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            visitorType === 'personal'
              ? 'bg-candi-white text-candi-charcoal shadow-sm border border-candi-gold-light/30'
              : 'text-candi-muted hover:text-candi-charcoal'
          }`}
        >
          <User className="w-4 h-4 text-candi-gold" />
          <span>Personal</span>
        </button>
        <button
          type="button"
          onClick={() => { setVisitorType('rombongan'); setErrorMessage(''); }}
          className={`flex-1 py-3 text-sm font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            visitorType === 'rombongan'
              ? 'bg-candi-white text-candi-charcoal shadow-sm border border-candi-gold-light/30'
              : 'text-candi-muted hover:text-candi-charcoal'
          }`}
        >
          <Users className="w-4 h-4 text-candi-gold" />
          <span>Rombongan</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error Message banner */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-xl text-sm text-red-600 font-medium animate-pulse">
            {errorMessage}
          </div>
        )}

        {/* Nama Lengkap */}
        <div>
          <label htmlFor="name" className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-2">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
              placeholder="Contoh: Ahmad Dahlan"
              className={`w-full py-3 pl-11 pr-4 bg-candi-cream/30 border rounded-xl text-sm transition duration-150 ${
                touched.name && !name.trim() 
                  ? 'border-red-400 bg-red-50/20' 
                  : 'border-candi-gold-light hover:border-candi-gold/60'
              }`}
            />
            <User className="w-4 h-4 text-candi-muted absolute left-4 top-3.5" />
          </div>
        </div>

        {/* If Rombongan: Org Name, Org Members, Org Position */}
        {visitorType === 'rombongan' && (
          <div className="space-y-5 p-4 bg-candi-gold-light/20 rounded-xl border border-candi-gold-light/50 animate-fade-in">
            {/* Org Name */}
            <div>
              <label htmlFor="orgName" className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-2">
                Nama Instansi / Rombongan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="orgName"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, orgName: true }))}
                  placeholder="Contoh: SMA 1 Boyolangu / Keluarga Besar"
                  className={`w-full py-3 pl-11 pr-4 bg-candi-white border rounded-xl text-sm transition duration-150 ${
                    touched.orgName && !orgName.trim() 
                      ? 'border-red-400 bg-red-50/20' 
                      : 'border-candi-gold-light hover:border-candi-gold/60'
                  }`}
                />
                <Building className="w-4 h-4 text-candi-muted absolute left-4 top-3.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Org Members Count */}
              <div>
                <label htmlFor="orgMembers" className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-2">
                  Jumlah Anggota <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="orgMembers"
                  min="1"
                  value={orgMembers}
                  onChange={(e) => setOrgMembers(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, orgMembers: true }))}
                  placeholder="Jumlah"
                  className={`w-full py-3 px-4 bg-candi-white border rounded-xl text-sm transition duration-150 ${
                    touched.orgMembers && (!orgMembers || Number(orgMembers) <= 0) 
                      ? 'border-red-400 bg-red-50/20' 
                      : 'border-candi-gold-light hover:border-candi-gold/60'
                  }`}
                />
              </div>

              {/* Org Position */}
              <div>
                <label htmlFor="orgPosition" className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-2">
                  Jabatan Anda
                </label>
                <input
                  type="text"
                  id="orgPosition"
                  value={orgPosition}
                  onChange={(e) => setOrgPosition(e.target.value)}
                  placeholder="Contoh: Ketua"
                  className="w-full py-3 px-4 bg-candi-white border border-candi-gold-light hover:border-candi-gold/60 rounded-xl text-sm transition duration-150"
                />
              </div>
            </div>
          </div>
        )}

        {/* Geographic Location Selection Group */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Negara Asal */}
            <div>
              <label htmlFor="country" className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-2">
                Negara
              </label>
              <input
                type="text"
                id="country"
                value={country}
                onChange={(e) => {
                  const nextCountry = e.target.value;
                  setCountry(nextCountry);
                  if (nextCountry.toLowerCase() !== 'indonesia') {
                    setSelectedProvinceId('');
                    setProvince('');
                    setCity('');
                  }
                }}
                placeholder="Indonesia"
                className="w-full py-3 px-4 bg-candi-cream/30 border border-candi-gold-light hover:border-candi-gold/60 rounded-xl text-sm transition duration-150 outline-none focus:border-candi-gold focus:ring-1 focus:ring-candi-gold/30"
              />
            </div>

            {/* Provinsi */}
            <div>
              <label htmlFor="province" className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-2">
                Provinsi
              </label>
              {country.toLowerCase() === 'indonesia' ? (
                <CustomSelect
                  value={selectedProvinceId}
                  onChange={(pId) => {
                    setSelectedProvinceId(pId);
                    const selectedProv = provinces.find((p) => p.id === pId);
                    setProvince(selectedProv ? toTitleCase(selectedProv.name) : '');
                    setCity(''); // Clear city selection when province changes
                  }}
                  options={provinces.map((prov) => ({
                    value: prov.id,
                    label: toTitleCase(prov.name)
                  }))}
                  placeholder="-- Pilih Provinsi --"
                />
              ) : (
                <input
                  type="text"
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Nama Provinsi/Bagian"
                  className="w-full py-3 px-4 bg-candi-cream/30 border border-candi-gold-light hover:border-candi-gold/60 rounded-xl text-sm transition duration-150 outline-none focus:border-candi-gold focus:ring-1 focus:ring-candi-gold/30"
                />
              )}
            </div>
          </div>

          {/* Asal Kota */}
          <div>
            <label htmlFor="city" className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-2">
              Asal Kota / Kabupaten <span className="text-red-500">*</span>
            </label>
            {country.toLowerCase() === 'indonesia' ? (
              <CustomSelect
                value={city}
                onChange={(val) => {
                  setCity(val);
                  setTouched(prev => ({ ...prev, city: true }));
                }}
                disabled={!selectedProvinceId}
                error={touched.city && !city.trim()}
                options={regencies.map((reg) => ({
                  value: toTitleCase(reg.name),
                  label: toTitleCase(reg.name)
                }))}
                placeholder={selectedProvinceId ? '-- Pilih Kota/Kabupaten --' : '-- Pilih Provinsi Dulu --'}
              />
            ) : (
              <div className="relative">
                <input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, city: true }))}
                  placeholder="Contoh: Kuala Lumpur / Singapore City"
                  className={`w-full py-3 pl-11 pr-4 bg-candi-cream/30 border rounded-xl text-sm transition duration-150 outline-none focus:border-candi-gold focus:ring-1 focus:ring-candi-gold/30 ${
                    touched.city && !city.trim() 
                      ? 'border-red-400 bg-red-50/20' 
                      : 'border-candi-gold-light hover:border-candi-gold/60'
                  }`}
                />
                <MapPin className="w-4 h-4 text-candi-muted absolute left-4 top-3.5" />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* No. HP / WA */}
          <div>
            <label htmlFor="phone" className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-2">
              No. HP / WA
            </label>
            <div className="relative">
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812xxxx"
                className="w-full py-3 pl-11 pr-4 bg-candi-cream/30 border border-candi-gold-light hover:border-candi-gold/60 rounded-xl text-sm transition duration-150 outline-none focus:border-candi-gold focus:ring-1 focus:ring-candi-gold/30"
              />
              <Phone className="w-4 h-4 text-candi-muted absolute left-4 top-3.5" />
            </div>
          </div>

          {/* Jenis Kelamin */}
          <div>
            <label htmlFor="gender" className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-2">
              Jenis Kelamin
            </label>
            <CustomSelect
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

        {/* Tujuan Kunjungan */}
        <div>
          <label htmlFor="visitPurpose" className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-2">
            Tujuan Kunjungan
          </label>
          <CustomSelect
            value={visitPurpose}
            onChange={(val) => setVisitPurpose(val)}
            options={VISIT_PURPOSES.map((purpose) => ({
              value: purpose,
              label: purpose
            }))}
            placeholder="-- Pilih Tujuan --"
          />
        </div>

        {/* Rating Bintang */}
        <div>
          <span className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-2 flex items-center gap-1">
            <span>Penilaian Candi Dadi</span>
            <span title="Pilih rating bintang dari 1-5">
              <HelpCircle className="w-3.5 h-3.5 text-candi-muted" />
            </span>
          </span>
          <div className="flex items-center gap-2 bg-candi-cream/30 border border-candi-gold-light py-2.5 px-4 rounded-xl justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 cursor-pointer transition duration-100 hover:scale-115"
              >
                <Star
                  className={`w-7 h-7 ${
                    star <= (hoverRating || rating)
                      ? 'fill-candi-gold text-candi-gold'
                      : 'text-candi-gold-light'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-xs font-bold text-candi-gold ml-2">{rating}/5 Bintang</span>
            )}
          </div>
        </div>

        {/* Kesan & Pesan */}
        <div>
          <label htmlFor="impression" className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-2">
            Kesan & Pesan
          </label>
          <div className="relative">
            <textarea
              id="impression"
              rows={3}
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              placeholder="Tulis kesan, pesan, atau masukan untuk pengelolaan Candi Dadi..."
              className="w-full py-3 pl-11 pr-4 bg-candi-cream/30 border border-candi-gold-light hover:border-candi-gold/60 rounded-xl text-sm transition duration-150 resize-none"
            />
            <Smile className="w-4 h-4 text-candi-muted absolute left-4 top-3.5" />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 text-white font-bold rounded-xl transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
              isLoading 
                ? 'bg-candi-muted cursor-not-allowed' 
                : 'bg-candi-gold hover:bg-candi-gold-dark'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Menyimpan…</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 fill-white" />
                <span>Kirim Buku Tamu</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
