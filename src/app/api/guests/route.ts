import { NextResponse } from 'next/server';
import { db, guests } from '@/db';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const list = await db.select().from(guests).orderBy(desc(guests.createdAt)).all();
    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error('API GET guests error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch guests' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      type,
      name,
      city,
      province,
      country,
      phone,
      gender,
      visitPurpose,
      rating,
      impression,
      orgName,
      orgMembers,
      orgPosition,
    } = body;

    if (!name || !city) {
      return NextResponse.json({ success: false, error: 'Nama dan Kota wajib diisi.' }, { status: 400 });
    }

    const inserted = await db.insert(guests)
      .values({
        type: type || 'personal',
        name,
        city,
        province: province || null,
        country: country || 'Indonesia',
        phone: phone || null,
        gender: gender || null,
        visitPurpose: visitPurpose || null,
        rating: rating !== undefined ? Number(rating) : null,
        impression: impression || null,
        orgName: type === 'rombongan' ? orgName : null,
        orgMembers: type === 'rombongan' && orgMembers ? Number(orgMembers) : null,
        orgPosition: type === 'rombongan' ? orgPosition : null,
      })
      .returning()
      .get();

    return NextResponse.json({ success: true, data: inserted });
  } catch (error) {
    console.error('API POST guest error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save guest log' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing guest ID for update' }, { status: 400 });
    }

    // Convert rating or orgMembers if they are passed
    if (updates.rating !== undefined) updates.rating = Number(updates.rating);
    if (updates.orgMembers !== undefined) updates.orgMembers = Number(updates.orgMembers);

    const updated = await db.update(guests)
      .set(updates)
      .where(eq(guests.id, Number(id)))
      .returning()
      .get();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('API PUT guest error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update guest' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID param' }, { status: 400 });
    }

    const deleted = await db.delete(guests)
      .where(eq(guests.id, Number(id)))
      .returning()
      .get();

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    console.error('API DELETE guest error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete guest' }, { status: 500 });
  }
}
