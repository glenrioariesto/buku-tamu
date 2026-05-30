import { NextResponse } from 'next/server';
import { db, guests } from '@/db';
import { eq, desc, like, or, sql, count, avg } from 'drizzle-orm';
import { AppError, parseBody, withErrorHandler } from '@/lib/apiHandler';
import { GuestPostSchema, GuestPutSchema } from '@/lib/schemas';

export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
  const search = searchParams.get('search') || '';
  const offset = (page - 1) * pageSize;

  const searchCondition = search
    ? or(
        like(guests.name, `%${search}%`),
        like(guests.city, `%${search}%`),
        like(guests.orgName, `%${search}%`),
        like(guests.visitPurpose, `%${search}%`),
      )
    : undefined;

  const list = await db
    .select().from(guests)
    .where(searchCondition)
    .orderBy(desc(guests.createdAt))
    .limit(pageSize).offset(offset)
    .all();

  const countResult = await db.select({ total: count() }).from(guests).where(searchCondition).get();
  const total = countResult?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

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

  return NextResponse.json({ success: true, data: list, total, page, pageSize, totalPages, stats });
});

export const POST = withErrorHandler(async (req: Request) => {
  const body = await parseBody(req, GuestPostSchema);

  const inserted = await db.insert(guests)
    .values({
      type: body.type,
      name: body.name,
      city: body.city,
      province: body.province ?? null,
      country: body.country ?? 'Indonesia',
      phone: body.phone ?? null,
      gender: body.gender ?? null,
      visitPurpose: body.visitPurpose ?? null,
      rating: body.rating ?? null,
      impression: body.impression ?? null,
      pekerjaan: body.type === 'personal' ? (body.pekerjaan ?? null) : null,
      orgName: body.type === 'rombongan' ? (body.orgName ?? null) : null,
      orgMembers: body.type === 'rombongan' ? (body.orgMembers ?? null) : null,
      orgPosition: body.type === 'rombongan' ? (body.orgPosition ?? null) : null,
      jenisOrganisasi: body.type === 'rombongan' ? (body.jenisOrganisasi ?? null) : null,
    })
    .returning().get();

  return NextResponse.json({ success: true, data: inserted });
});

export const PUT = withErrorHandler(async (req: Request) => {
  const body = await parseBody(req, GuestPutSchema);
  const { id, type, ...updates } = body;

  let guestType = type;
  if (!guestType) {
    const existing = await db.select({ type: guests.type }).from(guests).where(eq(guests.id, Number(id))).get();
    if (!existing) throw new AppError('Guest not found', 404);
    guestType = existing.type;
  }

  if (updates.rating !== undefined) updates.rating = Number(updates.rating);
  if (updates.orgMembers !== undefined) updates.orgMembers = Number(updates.orgMembers);

  if (guestType === 'personal') {
    updates.orgName = null;
    updates.orgMembers = null;
    updates.orgPosition = null;
    updates.jenisOrganisasi = null;
  } else if (guestType === 'rombongan') {
    updates.pekerjaan = null;
  }

  const updated = await db.update(guests).set(updates).where(eq(guests.id, Number(id))).returning().get();
  if (!updated) throw new AppError('Guest not found', 404);

  return NextResponse.json({ success: true, data: updated });
});

export const DELETE = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) throw new AppError('Missing ID param', 400);

  const deleted = await db.delete(guests).where(eq(guests.id, Number(id))).returning().get();
  if (!deleted) throw new AppError('Guest not found', 404);

  return NextResponse.json({ success: true, data: deleted });
});
