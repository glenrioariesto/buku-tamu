import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const guests = sqliteTable('guests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').$type<'personal' | 'rombongan'>().default('personal').notNull(),
  name: text('name').notNull(),
  city: text('city').notNull(),
  province: text('province'),
  country: text('country').default('Indonesia'),
  phone: text('phone'),
  gender: text('gender'), // 'L' | 'P'
  visitPurpose: text('visit_purpose'),
  rating: integer('rating'), // 1 to 5 stars
  impression: text('impression'),
  
  // Organization / Group details (only filled if type === 'rombongan')
  orgName: text('org_name'),
  orgMembers: integer('org_members'),
  orgPosition: text('org_position'),
  
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .notNull(),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .notNull(),
});
