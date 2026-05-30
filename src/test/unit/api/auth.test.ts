jest.mock('@/db', () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        all: jest.fn(async () => []),
        where: jest.fn(() => ({ get: jest.fn(async () => null) })),
        get: jest.fn(async () => null),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        onConflictDoUpdate: jest.fn(async () => {}),
        returning: jest.fn(() => ({ get: jest.fn(async () => ({})) })),
      })),
    })),
    transaction: jest.fn(async (cb: (tx: unknown) => Promise<void>) => cb({})),
  },
  settings: {},
}));

function makeRequest(body: object) {
  return new Request('http://localhost/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('API /api/auth — GET', () => {
  it('kembalikan success true dengan default GPS settings', async () => {
    const { GET } = await import('@/app/api/auth/route');
    const res = await GET();
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(typeof data.gps_lock_enabled).toBe('boolean');
    expect(typeof data.candi_latitude).toBe('number');
    expect(typeof data.candi_longitude).toBe('number');
    expect(typeof data.allowed_radius_meters).toBe('number');
  });
});

describe('API /api/auth — POST login', () => {
  it('400 jika password tidak dikirim', async () => {
    const { POST } = await import('@/app/api/auth/route');
    const req = makeRequest({ action: 'login' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Password wajib diisi.');
  });

  it('401 jika password salah', async () => {
    const { POST } = await import('@/app/api/auth/route');
    const req = makeRequest({ action: 'login', password: 'salah123' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('200 jika password benar (default fallback)', async () => {
    const { POST } = await import('@/app/api/auth/route');
    const req = makeRequest({ action: 'login', password: 'candidad1' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.ok).toBe(true);
    expect(data.success).toBe(true);
  });
});

describe('API /api/auth — POST changePassword', () => {
  it('400 jika oldPassword atau newPassword kosong', async () => {
    const { POST } = await import('@/app/api/auth/route');
    const req = makeRequest({ action: 'changePassword', oldPassword: '', newPassword: '' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('401 jika oldPassword salah', async () => {
    const { POST } = await import('@/app/api/auth/route');
    const req = makeRequest({ action: 'changePassword', oldPassword: 'salah', newPassword: 'baru123' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
  });
});

describe('API /api/auth — POST invalid action', () => {
  it('400 jika action tidak dikenal', async () => {
    const { POST } = await import('@/app/api/auth/route');
    const req = makeRequest({ action: 'unknown' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/Invalid action|Invalid discriminator/);
  });
});
