import { NextResponse } from 'next/server';
import { db, guests } from '@/db';
import { eq, desc, like, or, sql, count, avg } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * pageSize;

    // Build search condition
    const searchCondition = search
      ? or(
          like(guests.name, `%${search}%`),
          like(guests.city, `%${search}%`),
          like(guests.orgName, `%${search}%`),
          like(guests.visitPurpose, `%${search}%`),
        )
      : undefined;

    // Fetch paginated data
    const list = await db
      .select()
      .from(guests)
      .where(searchCondition)
      .orderBy(desc(guests.createdAt))
      .limit(pageSize)
      .offset(offset)
      .all();

    // Count total matching rows
    const countResult = await db
      .select({ total: count() })
      .from(guests)
      .where(searchCondition)
      .get();
    const total = countResult?.total ?? 0;
    const totalPages = Math.ceil(total / pageSize);

    // Compute dashboard stats (only on page 1, no search filter for stats)
    let stats = null;
    if (page === 1 && !search) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayTimestamp = Math.floor(todayStart.getTime() / 1000);

      const [totalCount, todayCount, personalCount, rombonganCount, cityCount, ratingAvg, totalOrgMembers] = await Promise.all([
        db.select({ val: count() }).from(guests).get(),
        db.select({ val: count() }).from(guests).where(sql`created_at >= ${todayTimestamp}`).get(),
        db.select({ val: count() }).from(guests).where(eq(guests.type, 'personal')).get(),
        db.select({ val: count() }).from(guests).where(eq(guests.type, 'rombongan')).get(),
        db.select({ val: sql<number>`COUNT(DISTINCT city)` }).from(guests).get(),
        db.select({ val: avg(guests.rating) }).from(guests).get(),
        db.select({ val: sql<number>`COALESCE(SUM(org_members), 0)` }).from(guests).where(eq(guests.type, 'rombongan')).get(),
      ]);

      const pCount = personalCount?.val ?? 0;
      const orgMembersTotal = Number(totalOrgMembers?.val ?? 0);

      stats = {
        total: totalCount?.val ?? 0,
        todayCount: todayCount?.val ?? 0,
        personalCount: pCount,
        rombonganCount: rombonganCount?.val ?? 0,
        totalOrgMembers: orgMembersTotal,
        totalVisitors: pCount + orgMembersTotal,
        uniqueCities: cityCount?.val ?? 0,
        avgRating: ratingAvg?.val ? Number(ratingAvg.val).toFixed(1) : '—',
      };
    }

    return NextResponse.json({
      success: true,
      data: list,
      total,
      page,
      pageSize,
      totalPages,
      stats,
    });
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
      pekerjaan,
      orgName,
      orgMembers,
      orgPosition,
      jenisOrganisasi,
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
        pekerjaan: type === 'personal' ? pekerjaan : null,
        orgName: type === 'rombongan' ? orgName : null,
        orgMembers: type === 'rombongan' && orgMembers ? Number(orgMembers) : null,
        orgPosition: type === 'rombongan' ? orgPosition : null,
        jenisOrganisasi: type === 'rombongan' ? jenisOrganisasi : null,
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
    const { id, type, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing guest ID for update' }, { status: 400 });
    }

    // Fetch existing record to determine type if not provided
    let guestType = type;
    if (!guestType) {
      const existing = await db.select({ type: guests.type }).from(guests).where(eq(guests.id, Number(id))).get();
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Guest not found' }, { status: 404 });
      }
      guestType = existing.type;
    }

    // Convert numeric fields
    if (updates.rating !== undefined) updates.rating = Number(updates.rating);
    if (updates.orgMembers !== undefined) updates.orgMembers = Number(updates.orgMembers);

    // Type-based field filtering
    if (guestType === 'personal') {
      updates.orgName = null;
      updates.orgMembers = null;
      updates.orgPosition = null;
      updates.jenisOrganisasi = null;
    } else if (guestType === 'rombongan') {
      updates.pekerjaan = null;
    }

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
