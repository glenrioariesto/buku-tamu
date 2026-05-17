import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const url = process.env.TURSO_DATABASE_URL || 'file:candi-dadi.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

const conn = createClient({ url, authToken });
const db = drizzle(conn, { schema });

async function seed() {
  console.log('🌱 Starting database seeding...');
  
  // 1. Seed admin settings
  console.log('🔑 Seeding admin settings...');
  const defaultSettings = [
    { key: 'admin_password', value: 'candidad1' },
    { key: 'gps_lock_enabled', value: 'false' },
    { key: 'candi_latitude', value: '-8.130248' },
    { key: 'candi_longitude', value: '111.926823' },
    { key: 'allowed_radius_meters', value: '200' }
  ];

  for (const s of defaultSettings) {
    await db.insert(schema.settings)
      .values(s)
      .onConflictDoUpdate({
        target: schema.settings.key,
        set: { value: s.value, updatedAt: new Date() }
      });
  }
  
  // 2. Seed dummy guests
  console.log('📋 Seeding visitor entries...');
  
  // Clean old visitors to start fresh for demo
  await db.delete(schema.guests);
  
  const dummyGuests = [
    {
      type: 'personal' as const,
      name: 'Ahmad Fauzi',
      city: 'Tulungagung',
      province: 'Jawa Timur',
      country: 'Indonesia',
      phone: '081234567890',
      gender: 'L',
      visitPurpose: 'Wisata & Rekreasi',
      rating: 5,
      impression: 'Pemandangan dari candi sangat memukau, udaranya segar sekali. Akses jalan perlu sedikit diperlebar.',
      orgName: null,
      orgMembers: null,
      orgPosition: null,
    },
    {
      type: 'rombongan' as const,
      name: 'Dr. Endang Sulistyowati',
      city: 'Yogyakarta',
      province: 'DI Yogyakarta',
      country: 'Indonesia',
      phone: '081399887766',
      gender: 'P',
      visitPurpose: 'Akademik & Penelitian',
      rating: 5,
      impression: 'Melakukan penelitian arkeologi tentang struktur batuan Candi Dadi. Situs yang sangat terawat!',
      orgName: 'Program Studi Arkeologi UGM',
      orgMembers: 15,
      orgPosition: 'Dosen Pembimbing',
    },
    {
      type: 'personal' as const,
      name: 'Michael Chen',
      city: 'Singapore',
      province: 'Central Region',
      country: 'Singapore',
      phone: '+6581234567',
      gender: 'L',
      visitPurpose: 'Wisata & Rekreasi',
      rating: 4,
      impression: 'Beautiful quiet temple. Nice sunset view from the top of the hill.',
      orgName: null,
      orgMembers: null,
      orgPosition: null,
    },
    {
      type: 'personal' as const,
      name: 'Siti Rahmawati',
      city: 'Surabaya',
      province: 'Jawa Timur',
      country: 'Indonesia',
      phone: '085611223344',
      gender: 'P',
      visitPurpose: 'Lainnya',
      rating: 5,
      impression: 'Ziarah budaya dan menikmati ketenangan spiritual di sekitar candi.',
      orgName: null,
      orgMembers: null,
      orgPosition: null,
    },
    {
      type: 'rombongan' as const,
      name: 'Supardi',
      city: 'Kediri',
      province: 'Jawa Timur',
      country: 'Indonesia',
      phone: '082155667788',
      gender: 'L',
      visitPurpose: 'Kedinasan',
      rating: 4,
      impression: 'Kunjungan kerja studi banding pengelolaan cagar budaya daerah.',
      orgName: 'Disbudparpora Kabupaten Kediri',
      orgMembers: 8,
      orgPosition: 'Kepala Bidang',
    }
  ];

  for (const guest of dummyGuests) {
    await db.insert(schema.guests).values(guest);
  }

  console.log('✅ Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
