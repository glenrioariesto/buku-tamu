import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

// Mock drizzle db
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  guests: {},
}));

// Helper buat mock request
function makeRequest(method: string, body?: object, searchParams?: Record<string, string>) {
  const url = new URL('http://localhost/api/guests');
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new Request(url.toString(), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('API /api/guests — POST validasi', () => {
  it('400 jika name kosong', async () => {
    const { POST } = await import('@/app/api/guests/route');
    const req = makeRequest('POST', { name: '', city: 'Tulungagung', type: 'personal' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Nama dan Kota wajib diisi.');
  });

  it('400 jika city kosong', async () => {
    const { POST } = await import('@/app/api/guests/route');
    const req = makeRequest('POST', { name: 'Budi', city: '', type: 'personal' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });
});

describe('API /api/guests — PUT validasi', () => {
  it('400 jika id tidak ada', async () => {
    const { PUT } = await import('@/app/api/guests/route');
    const req = makeRequest('PUT', { name: 'Budi' }); // tanpa id
    const res = await PUT(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Missing guest ID for update');
  });
});

describe('API /api/guests — DELETE validasi', () => {
  it('400 jika id param tidak ada', async () => {
    const { DELETE } = await import('@/app/api/guests/route');
    const req = makeRequest('DELETE');
    const res = await DELETE(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Missing ID param');
  });
});
