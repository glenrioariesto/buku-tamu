import { NextResponse } from 'next/server';
import { db, settings } from '@/db';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, password, oldPassword, newPassword } = body;

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

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('API Auth error:', error);
    return NextResponse.json({ success: false, error: 'Auth failed' }, { status: 500 });
  }
}
