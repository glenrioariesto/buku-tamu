import {
  validateCheckInForm,
  computeTotalVisitors,
  formatAvgRating,
} from './validation';

describe('validateCheckInForm', () => {
  it('error jika nama kosong', () => {
    expect(validateCheckInForm({ name: '', city: 'Tulungagung', visitorType: 'personal' }))
      .toBe('Nama Lengkap wajib diisi.');
  });

  it('error jika nama hanya spasi', () => {
    expect(validateCheckInForm({ name: '   ', city: 'Tulungagung', visitorType: 'personal' }))
      .toBe('Nama Lengkap wajib diisi.');
  });

  it('error jika kota kosong', () => {
    expect(validateCheckInForm({ name: 'Budi', city: '', visitorType: 'personal' }))
      .toBe('Asal Kota/Kabupaten wajib diisi.');
  });

  it('valid untuk tipe personal lengkap', () => {
    expect(validateCheckInForm({ name: 'Budi', city: 'Tulungagung', visitorType: 'personal' }))
      .toBe('');
  });

  it('error rombongan jika orgName kosong', () => {
    expect(validateCheckInForm({
      name: 'Budi', city: 'Tulungagung',
      visitorType: 'rombongan', orgName: '', orgMembers: '30',
    })).toBe('Nama Organisasi/Rombongan wajib diisi.');
  });

  it('error rombongan jika orgMembers kosong', () => {
    expect(validateCheckInForm({
      name: 'Budi', city: 'Tulungagung',
      visitorType: 'rombongan', orgName: 'SD Negeri 1', orgMembers: '',
    })).toBe('Jumlah Anggota rombongan wajib diisi.');
  });

  it('error rombongan jika orgMembers nol', () => {
    expect(validateCheckInForm({
      name: 'Budi', city: 'Tulungagung',
      visitorType: 'rombongan', orgName: 'SD Negeri 1', orgMembers: '0',
    })).toBe('Jumlah Anggota rombongan wajib diisi.');
  });

  it('error rombongan jika orgMembers negatif', () => {
    expect(validateCheckInForm({
      name: 'Budi', city: 'Tulungagung',
      visitorType: 'rombongan', orgName: 'SD Negeri 1', orgMembers: '-5',
    })).toBe('Jumlah Anggota rombongan wajib diisi.');
  });

  it('valid untuk tipe rombongan lengkap', () => {
    expect(validateCheckInForm({
      name: 'Budi', city: 'Tulungagung',
      visitorType: 'rombongan', orgName: 'SD Negeri Rancaekek', orgMembers: '35',
    })).toBe('');
  });
});

describe('computeTotalVisitors', () => {
  it('total = personal + anggota rombongan', () => {
    expect(computeTotalVisitors(10, 50)).toBe(60);
  });

  it('total = personal saja jika tidak ada rombongan', () => {
    expect(computeTotalVisitors(5, 0)).toBe(5);
  });

  it('total = 0 jika keduanya nol', () => {
    expect(computeTotalVisitors(0, 0)).toBe(0);
  });
});

describe('formatAvgRating', () => {
  it('format angka ke 1 desimal', () => {
    expect(formatAvgRating(4.666)).toBe('4.7');
  });

  it('kembalikan — jika null', () => {
    expect(formatAvgRating(null)).toBe('—');
  });

  it('kembalikan — jika undefined', () => {
    expect(formatAvgRating(undefined)).toBe('—');
  });

  it('kembalikan — jika nol', () => {
    expect(formatAvgRating(0)).toBe('—');
  });
});
