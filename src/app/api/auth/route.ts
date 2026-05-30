import { NextResponse } from 'next/server';
import { db, settings } from '@/db';
import { eq } from 'drizzle-orm';
import { AppError, parseBody, withErrorHandler } from '@/lib/apiHandler';
import { AuthPostSchema } from '@/lib/schemas';

export const GET = withErrorHandler(async () => {
  const rows = await db.select().from(settings).all();
  const data = rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {} as Record<string, string>);

  return NextResponse.json({
    success: true,
    gps_lock_enabled: data.gps_lock_enabled === 'true',
    candi_latitude: parseFloat(data.candi_latitude || '-8.130248'),
    candi_longitude: parseFloat(data.candi_longitude || '111.926823'),
    allowed_radius_meters: parseInt(data.allowed_radius_meters || '200', 10),
  });
});

export const POST = withErrorHandler(async (req: Request) => {
  const body = await parseBody(req, AuthPostSchema);

  const storedSetting = await db.select()
    .from(settings)
    .where(eq(settings.key, 'admin_password'))
    .get();
  const storedPassword = storedSetting?.value ?? 'candidad1';

  if (body.action === 'login') {
    if (body.password !== storedPassword) throw new AppError('Password salah!', 401);
    return NextResponse.json({ success: true, message: 'Login berhasil!' });
  }

  if (body.action === 'changePassword') {
    if (body.oldPassword !== storedPassword) throw new AppError('Sandi lama salah!', 401);

    await db.insert(settings)
      .values({ key: 'admin_password', value: body.newPassword, updatedAt: new Date() })
      .onConflictDoUpdate({ target: settings.key, set: { value: body.newPassword, updatedAt: new Date() } });

    return NextResponse.json({ success: true, message: 'Sandi berhasil diperbarui!' });
  }

  if (body.action === 'updateSettings') {
    await db.transaction(async (tx) => {
      await Promise.all([
        tx.insert(settings)
          .values({ key: 'gps_lock_enabled', value: body.gpsLockEnabled ? 'true' : 'false', updatedAt: new Date() })
          .onConflictDoUpdate({ target: settings.key, set: { value: body.gpsLockEnabled ? 'true' : 'false', updatedAt: new Date() } }),
        tx.insert(settings)
          .values({ key: 'candi_latitude', value: String(body.candiLatitude), updatedAt: new Date() })
          .onConflictDoUpdate({ target: settings.key, set: { value: String(body.candiLatitude), updatedAt: new Date() } }),
        tx.insert(settings)
          .values({ key: 'candi_longitude', value: String(body.candiLongitude), updatedAt: new Date() })
          .onConflictDoUpdate({ target: settings.key, set: { value: String(body.candiLongitude), updatedAt: new Date() } }),
        tx.insert(settings)
          .values({ key: 'allowed_radius_meters', value: String(body.allowedRadiusMeters), updatedAt: new Date() })
          .onConflictDoUpdate({ target: settings.key, set: { value: String(body.allowedRadiusMeters), updatedAt: new Date() } }),
      ]);
    });

    return NextResponse.json({ success: true, message: 'Pengaturan berhasil diperbarui!' });
  }

  throw new AppError('Invalid action', 400);
});
