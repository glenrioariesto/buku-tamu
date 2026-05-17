'use client';

import React, { useState, useEffect } from 'react';
import { useAdminStore, Guest } from '@/store/useAdminStore';
import { 
  Building, 
  MapPin, 
  Star, 
  RefreshCw, 
  Download, 
  Search, 
  Trash2, 
  Edit3, 
  X,
  HelpCircle
} from 'lucide-react';

const VISIT_PURPOSES = [
  "Wisata & Rekreasi",
  "Akademik & Penelitian",
  "Kedinasan",
  "Lainnya"
];

export default function VisitorTable() {
  const guests = useAdminStore((s) => s.guests);
  const searchQuery = useAdminStore((s) => s.searchQuery);
  const isLoading = useAdminStore((s) => s.isLoading);
  const setSearchQuery = useAdminStore((s) => s.setSearchQuery);
  const fetchGuests = useAdminStore((s) => s.fetchGuests);
  const deleteGuest = useAdminStore((s) => s.deleteGuest);
  const editGuest = useAdminStore((s) => s.editGuest);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  // Dynamic regional location data from the dynamic JSON database
  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>([]);

  const toTitleCase = (str: string) => {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const fetchProvincesData = async () => {
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



  // States for CRUD modals
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<number | null>(null);

  // Form states for Editing
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editProvince, setEditProvince] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editVisitPurpose, setEditVisitPurpose] = useState('');
  const [editRating, setEditRating] = useState<number>(0);
  const [editImpression, setEditImpression] = useState('');
  const [editOrgName, setEditOrgName] = useState('');
  const [editOrgMembers, setEditOrgMembers] = useState('');
  const [editOrgPosition, setEditOrgPosition] = useState('');

  // Filter visitors based on search query
  const filteredGuests = guests.filter((g) => {
    const query = searchQuery.toLowerCase();
    return (
      g.name.toLowerCase().includes(query) ||
      g.city.toLowerCase().includes(query) ||
      (g.orgName && g.orgName.toLowerCase().includes(query)) ||
      (g.visitPurpose && g.visitPurpose.toLowerCase().includes(query))
    );
  });

  // Export to CSV
  const exportToCSV = () => {
    if (filteredGuests.length === 0) return;

    const headers = [
      'ID', 'Tipe Pengunjung', 'Nama Lengkap', 'Jenis Kelamin', 'No. HP/WA', 
      'Asal Kota', 'Provinsi', 'Negara', 'Tujuan Kunjungan', 'Rating', 
      'Kesan & Pesan', 'Nama Organisasi', 'Jumlah Anggota', 'Jabatan', 'Waktu Berkunjung'
    ];

    const rows = filteredGuests.map((g) => [
      g.id,
      g.type === 'personal' ? 'Personal' : 'Rombongan',
      `"${g.name.replace(/"/g, '""')}"`,
      g.gender || '—',
      g.phone || '—',
      `"${g.city.replace(/"/g, '""')}"`,
      g.province || '—',
      g.country || 'Indonesia',
      `"${(g.visitPurpose || '—').replace(/"/g, '""')}"`,
      g.rating || '—',
      `"${(g.impression || '—').replace(/\n/g, ' ').replace(/"/g, '""')}"`,
      g.orgName ? `"${g.orgName.replace(/"/g, '""')}"` : '—',
      g.orgMembers || '—',
      g.orgPosition ? `"${g.orgPosition.replace(/"/g, '""')}"` : '—',
      new Date(g.createdAt).toLocaleString('id-ID')
    ]);

    // CSV format with UTF-8 BOM
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    // Encoded Data URI to bypass Blob UUID filename fallback bugs in certain browsers
    const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = `Daftar_Tamu_Candi_Dadi_${new Date().toISOString().split('T')[0]}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Edit Modal open
  const openEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setEditName(guest.name);
    setEditCity(guest.city);
    setEditProvince(guest.province || '');
    setEditCountry(guest.country || 'Indonesia');
    setEditPhone(guest.phone || '');
    setEditGender(guest.gender || '');
    setEditVisitPurpose(guest.visitPurpose || '');
    setEditRating(guest.rating || 0);
    setEditImpression(guest.impression || '');
    setEditOrgName(guest.orgName || '');
    setEditOrgMembers(guest.orgMembers ? String(guest.orgMembers) : '');
    setEditOrgPosition(guest.orgPosition || '');
    setIsEditModalOpen(true);
    fetchProvincesData();
  };

  // Submit Edit Guest
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest) return;

    if (!editName.trim() || !editCity.trim()) {
      alert('Nama dan Kota wajib diisi.');
      return;
    }

    const updates: Partial<Guest> = {
      name: editName,
      city: editCity,
      province: editProvince || null,
      country: editCountry || 'Indonesia',
      phone: editPhone || null,
      gender: editGender || null,
      visitPurpose: editVisitPurpose || null,
      rating: editRating > 0 ? editRating : null,
      impression: editImpression || null,
      orgName: editingGuest.type === 'rombongan' ? editOrgName : null,
      orgMembers: editingGuest.type === 'rombongan' && editOrgMembers ? Number(editOrgMembers) : null,
      orgPosition: editingGuest.type === 'rombongan' ? editOrgPosition : null,
    };

    const success = await editGuest(editingGuest.id, updates);
    if (success) {
      setIsEditModalOpen(false);
      setEditingGuest(null);
    } else {
      alert('Gagal memperbarui data.');
    }
  };

  // Submit Delete Guest
  const handleDeleteConfirm = async (id: number) => {
    const success = await deleteGuest(id);
    if (success) {
      setIsDeleteConfirmOpen(null);
    } else {
      alert('Gagal menghapus data.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Grid Controls Panel */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchGuests()}
            className="px-4 py-2.5 bg-candi-white hover:bg-candi-cream border border-stone-200 hover:border-candi-gold text-candi-charcoal hover:text-candi-gold text-sm font-semibold rounded-xl transition duration-150 flex items-center gap-2 cursor-pointer shadow-sm"
            disabled={isLoading}
          >
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportToCSV}
            disabled={filteredGuests.length === 0}
            className="px-4 py-2.5 bg-candi-white hover:bg-candi-cream border border-stone-200 hover:border-candi-gold text-candi-charcoal hover:text-candi-gold text-sm font-semibold rounded-xl transition duration-150 flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="size-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Live Search and Count Badge */}
        <div className="flex items-center gap-3 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, kota, organisasi..."
              className="w-full py-2.5 pl-10 pr-4 bg-candi-white border border-stone-200 rounded-xl text-sm"
            />
            <Search className="size-4 text-candi-muted absolute left-3.5 top-3.5" />
          </div>
          <div className="bg-candi-gold text-white text-xs font-bold px-3 py-2 rounded-xl shrink-0">
            {filteredGuests.length} Pengunjung
          </div>
        </div>
      </div>

      {/* Grid Data Table */}
      <div className="bg-candi-white rounded-2xl shadow-sm border border-candi-gold-light/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-candi-cream/55 border-b border-candi-gold-light/65 text-candi-muted font-bold text-xs uppercase tracking-wider">
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4">Pengunjung</th>
                <th className="p-4">Asal Daerah</th>
                <th className="p-4">Tujuan</th>
                <th className="p-4">Kesan</th>
                <th className="p-4 w-28 text-center">Rating</th>
                <th className="p-4 w-36">Waktu</th>
                <th className="p-4 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-candi-muted font-medium">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="size-8 animate-spin text-candi-gold" />
                      <span>Memuat data dari database…</span>
                    </div>
                  </td>
                </tr>
              ) : filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-candi-muted">
                    <div className="flex flex-col items-center gap-4">
                      <div className="size-16 bg-candi-cream rounded-full flex items-center justify-center border border-candi-gold-light">
                        <svg viewBox="0 0 100 100" className="size-8 fill-candi-gold/60">
                          <path d="M50 15 L57 25 H43 L50 15 Z M50 25 L65 40 H35 L50 25 Z M50 40 L72 65 H28 L50 40 Z M33 65 H67 V90 H33 V65 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
                        </svg>
                      </div>
                      <span className="font-semibold text-sm">Tidak ada data tamu ditemukan.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest, index) => (
                  <tr key={guest.id} className="hover:bg-candi-cream/15 transition duration-150">
                    <td className="p-4 text-center font-semibold text-candi-muted">
                      {index + 1}
                    </td>
                    <td className="p-4 font-bold text-candi-charcoal">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span>{guest.name}</span>
                          {guest.gender && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              guest.gender === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                            }`}>
                              {guest.gender}
                            </span>
                          )}
                        </div>
                        {guest.type === 'rombongan' && (
                          <div className="flex items-center gap-1 text-xs font-semibold text-candi-gold bg-candi-gold-light/45 py-0.5 px-2 rounded-md w-fit mt-0.5 border border-candi-gold-light/60">
                            <Building className="size-3" />
                            <span>{guest.orgName} ({guest.orgMembers} org)</span>
                            {guest.orgPosition && (
                              <span className="text-[10px] text-candi-muted ml-1 italic">- {guest.orgPosition}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-candi-muted shrink-0" />
                        <span>
                          {guest.city}
                          {guest.province ? `, ${guest.province}` : ''}
                          {guest.country && guest.country !== 'Indonesia' ? ` (${guest.country})` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-candi-charcoal font-medium">
                      {guest.visitPurpose || '—'}
                    </td>
                    <td className="p-4 text-candi-muted italic max-w-xs truncate" title={guest.impression || ''}>
                      {guest.impression || '—'}
                    </td>
                    <td className="p-4 text-center">
                      {guest.rating ? (
                        <div className="flex items-center justify-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((starVal) => (
                            <Star
                              key={`star-${guest.id}-${starVal}`}
                              className={`size-3.5 ${
                                starVal <= (guest.rating || 0)
                                  ? 'fill-candi-gold text-candi-gold'
                                  : 'text-stone-200'
                              }`}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-stone-300">-</span>
                      )}
                    </td>
                    <td className="p-4 text-candi-muted font-medium text-xs" suppressHydrationWarning>
                      {guest.createdAt ? formatDate(guest.createdAt) : '-'}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit Action Button */}
                        <button
                          onClick={() => openEditModal(guest)}
                          className="p-1.5 hover:bg-candi-gold-light/40 border border-transparent hover:border-candi-gold-light rounded-lg text-candi-muted hover:text-candi-gold transition duration-150 cursor-pointer"
                          title="Edit data tamu"
                        >
                          <Edit3 className="size-4" />
                        </button>

                        {/* Delete Action Button */}
                        <button
                          onClick={() => setIsDeleteConfirmOpen(guest.id)}
                          className="p-1.5 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg text-candi-muted hover:text-red-500 transition duration-150 cursor-pointer"
                          title="Hapus data tamu"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT VISITOR DETAILS MODAL */}
      {isEditModalOpen && editingGuest && (
        <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in" onClick={() => { setIsEditModalOpen(false); setEditingGuest(null); }} onKeyDown={(e) => { if (e.key === 'Escape') { setIsEditModalOpen(false); setEditingGuest(null); } }}>
          <div role="dialog" aria-modal="true" aria-label="Ubah Data Kunjungan" tabIndex={-1} className="w-full max-w-lg bg-candi-white rounded-2xl shadow-2xl border border-candi-gold-light p-6 max-h-[90vh] overflow-y-auto space-y-5" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => { if (e.key === 'Escape') { setIsEditModalOpen(false); setEditingGuest(null); } }}>
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-lg font-semibold text-candi-charcoal flex items-center gap-2">
                <Edit3 className="size-5 text-candi-gold" />
                <span>Ubah Data Kunjungan</span>
              </h3>
              <button
                onClick={() => { setIsEditModalOpen(false); setEditingGuest(null); }}
                className="p-1 hover:bg-candi-cream rounded-lg text-candi-muted hover:text-candi-charcoal cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <div className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-1.5">
                  Nama Lengkap
                </div>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full py-2.5 px-3 bg-candi-cream/30 border border-candi-gold-light rounded-xl text-sm"
                  required
                />
              </div>

              {/* Organization fields (if type === rombongan) */}
              {editingGuest.type === 'rombongan' && (
                <div className="p-3.5 bg-candi-gold-light/15 border border-candi-gold-light/40 rounded-xl space-y-4">
                  <div>
                    <div className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-1.5">
                      Nama Instansi / Rombongan
                    </div>
                    <input
                      type="text"
                      value={editOrgName}
                      onChange={(e) => setEditOrgName(e.target.value)}
                      className="w-full py-2.5 px-3 bg-white border border-candi-gold-light rounded-xl text-sm"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-1.5">
                        Jumlah Anggota
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={editOrgMembers}
                        onChange={(e) => setEditOrgMembers(e.target.value)}
                        className="w-full py-2.5 px-3 bg-white border border-candi-gold-light rounded-xl text-sm"
                        required
                      />
                    </div>
                    <div>
                      <div className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-1.5">
                        Jabatan
                      </div>
                      <input
                        type="text"
                        value={editOrgPosition}
                        onChange={(e) => setEditOrgPosition(e.target.value)}
                        className="w-full py-2.5 px-3 bg-white border border-candi-gold-light rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* City and Province */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-1.5">
                    Asal Kota / Kabupaten
                  </div>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full py-2.5 px-3 bg-candi-cream/30 border border-candi-gold-light rounded-xl text-sm"
                    required
                  />
                </div>
                <div>
                  <div className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-1.5">
                    Provinsi
                  </div>
                  <select
                    value={editProvince}
                    onChange={(e) => setEditProvince(e.target.value)}
                    className="w-full py-2.5 px-3 bg-candi-cream/30 border border-candi-gold-light rounded-xl text-sm cursor-pointer"
                  >
                    <option value="">-- Pilih --</option>
                    {provinces.map((p) => {
                      const formattedName = toTitleCase(p.name);
                      return (
                        <option key={p.id} value={formattedName}>
                          {formattedName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Country and Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-1.5">
                    Negara
                  </div>
                  <input
                    type="text"
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    className="w-full py-2.5 px-3 bg-candi-cream/30 border border-candi-gold-light rounded-xl text-sm"
                  />
                </div>
                <div>
                  <div className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-1.5">
                    No. HP / WA
                  </div>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full py-2.5 px-3 bg-candi-cream/30 border border-candi-gold-light rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Gender and Purpose */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-1.5">
                    Jenis Kelamin
                  </div>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full py-2.5 px-3 bg-candi-cream/30 border border-candi-gold-light rounded-xl text-sm cursor-pointer"
                  >
                    <option value="">-- Pilih --</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <div className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-1.5">
                    Tujuan Kunjungan
                  </div>
                  <select
                    value={editVisitPurpose}
                    onChange={(e) => setEditVisitPurpose(e.target.value)}
                    className="w-full py-2.5 px-3 bg-candi-cream/30 border border-candi-gold-light rounded-xl text-sm cursor-pointer"
                  >
                    <option value="">-- Pilih --</option>
                    {VISIT_PURPOSES.map((purp) => (
                      <option key={purp} value={purp}>{purp}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rating */}
              <div>
                <div className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-1.5">
                  Rating Bintang
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      className="p-1 cursor-pointer hover:scale-110 transition duration-75"
                    >
                      <Star
                        className={`size-6 ${
                          star <= editRating
                            ? 'fill-candi-gold text-candi-gold'
                            : 'text-stone-200'
                        }`}
                      />
                    </button>
                  ))}
                  {editRating > 0 && (
                    <span className="text-xs font-semibold text-candi-gold ml-2">{editRating} Star(s)</span>
                  )}
                </div>
              </div>

              {/* Impression */}
              <div>
                <div className="block text-xs font-bold text-candi-charcoal uppercase tracking-wider mb-1.5">
                  Kesan & Pesan
                </div>
                <textarea
                  rows={2}
                  value={editImpression}
                  onChange={(e) => setEditImpression(e.target.value)}
                  className="w-full py-2 px-3 bg-candi-cream/30 border border-candi-gold-light rounded-xl text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-stone-100">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-candi-gold hover:bg-candi-gold-dark text-white font-bold rounded-xl transition duration-150 cursor-pointer shadow-sm text-center"
                >
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditingGuest(null); }}
                  className="px-5 py-3 bg-candi-cream hover:bg-candi-gold-light/40 border border-stone-200 text-candi-charcoal font-semibold rounded-xl transition duration-150 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {isDeleteConfirmOpen !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in">
          <div className="w-full max-w-sm bg-candi-white rounded-2xl shadow-xl border border-red-150 p-6 space-y-4">
            <h3 className="font-serif text-lg font-semibold text-red-600">Hapus Entri Tamu?</h3>
            <p className="text-sm text-candi-muted leading-relaxed">
              Tindakan ini permanen. Seluruh data kunjungan untuk tamu terpilih akan dihapus selamanya dari database SQLite lokal Candi Dadi.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleDeleteConfirm(isDeleteConfirmOpen)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition duration-150 cursor-pointer text-center"
              >
                Hapus
              </button>
              <button
                onClick={() => setIsDeleteConfirmOpen(null)}
                className="flex-1 py-2.5 bg-candi-cream border border-stone-200 hover:bg-candi-gold-light/45 text-candi-charcoal font-semibold rounded-xl transition duration-150 cursor-pointer text-center"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
