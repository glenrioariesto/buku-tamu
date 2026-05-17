import { NextResponse } from 'next/server';
import { db, settings } from '@/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
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
  } catch (error) {
    console.error('Failed to get public settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      action, 
      password, 
      oldPassword, 
      newPassword,
      gpsLockEnabled,
      candiLatitude,
      candiLongitude,
      allowedRadiusMeters
    } = body;

    // Fetch the admin password from the settings table
    const storedSetting = await db.select()
      .from(settings)
      .where(eq(settings.key, 'admin_password'))
      .get();
      
    const storedPassword = storedSetting ? storedSetting.value : 'candidad1'; // Fallback to default

    if (action === 'login') {
      if (!password) {
        return NextResponse.json({ success: false, error: 'Password wajib diisi.' }, { status: 400 });
      }

      if (password === storedPassword) {
        // In a production app, we would set a secure HTTP-only cookie here.
        // For local / ease of access in this lightweight Next.js app, we will return success.
        return NextResponse.json({ success: true, message: 'Login berhasil!' });
      } else {
        return NextResponse.json({ success: false, error: 'Password salah!' }, { status: 401 });
      }
    }

    if (action === 'changePassword') {
      if (!oldPassword || !newPassword) {
        return NextResponse.json({ success: false, error: 'Sandi lama dan sandi baru wajib diisi.' }, { status: 400 });
      }

      if (oldPassword !== storedPassword) {
        return NextResponse.json({ success: false, error: 'Sandi lama salah!' }, { status: 401 });
      }

      await db.insert(settings)
        .values({
          key: 'admin_password',
          value: newPassword,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: newPassword, updatedAt: new Date() },
        });

      return NextResponse.json({ success: true, message: 'Sandi berhasil diperbarui!' });
    }

    if (action === 'updateSettings') {
      await db.transaction(async (tx) => {
        await tx.insert(settings)
          .values({ key: 'gps_lock_enabled', value: gpsLockEnabled ? 'true' : 'false', updatedAt: new Date() })
          .onConflictDoUpdate({ target: settings.key, set: { value: gpsLockEnabled ? 'true' : 'false', updatedAt: new Date() } });

        await tx.insert(settings)
          .values({ key: 'candi_latitude', value: String(candiLatitude), updatedAt: new Date() })
          .onConflictDoUpdate({ target: settings.key, set: { value: String(candiLatitude), updatedAt: new Date() } });

        await tx.insert(settings)
          .values({ key: 'candi_longitude', value: String(candiLongitude), updatedAt: new Date() })
          .onConflictDoUpdate({ target: settings.key, set: { value: String(candiLongitude), updatedAt: new Date() } });

        await tx.insert(settings)
          .values({ key: 'allowed_radius_meters', value: String(allowedRadiusMeters), updatedAt: new Date() })
          .onConflictDoUpdate({ target: settings.key, set: { value: String(allowedRadiusMeters), updatedAt: new Date() } });
      });

      return NextResponse.json({ success: true, message: 'Pengaturan berhasil diperbarui!' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('API Auth error:', error);
    return NextResponse.json({ success: false, error: 'Auth failed' }, { status: 500 });
  }
}
