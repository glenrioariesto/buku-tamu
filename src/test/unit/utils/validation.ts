// Pure validation logic extracted from CheckInForm untuk di-test
export function validateCheckInForm(data: {
  name: string;
  city: string;
  visitorType: 'personal' | 'rombongan';
  orgName?: string;
  orgMembers?: string;
}): string {
  if (!data.name.trim()) return 'Nama Lengkap wajib diisi.';
  if (!data.city.trim()) return 'Asal Kota/Kabupaten wajib diisi.';
  if (data.visitorType === 'rombongan') {
    if (!data.orgName?.trim()) return 'Nama Organisasi/Rombongan wajib diisi.';
    if (!data.orgMembers || Number(data.orgMembers) <= 0)
      return 'Jumlah Anggota rombongan wajib diisi.';
  }
  return '';
}

export function computeTotalVisitors(personalCount: number, totalOrgMembers: number): number {
  return personalCount + totalOrgMembers;
}

export function formatAvgRating(val: number | null | undefined): string {
  return val ? Number(val).toFixed(1) : '—';
}
