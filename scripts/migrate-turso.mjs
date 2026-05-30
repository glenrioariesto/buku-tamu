// Script: jalankan ALTER TABLE langsung ke Turso Cloud
// Usage: node scripts/migrate-turso.mjs
import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env manual (tanpa dotenv dependency)
const envPath = resolve(process.cwd(), '.env');
const envVars = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
    .filter(([k, v]) => k && v)
    .map(([k, ...rest]) => [k, rest.join('=')])
);

const url = process.env.TURSO_DATABASE_URL || envVars.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN || envVars.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('ERROR: TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN wajib di-set.');
  process.exit(1);
}

const client = createClient({ url, authToken });

// Cek kolom yang sudah ada
const tableInfo = await client.execute("PRAGMA table_info(guests)");
const existingCols = tableInfo.rows.map(r => r[1]); // index 1 = name
console.log('Kolom saat ini di Turso:', existingCols.join(', '));

const migrations = [
  { col: 'gender',           sql: "ALTER TABLE guests ADD COLUMN gender text" },
  { col: 'pekerjaan',        sql: "ALTER TABLE guests ADD COLUMN pekerjaan text" },
  { col: 'jenis_organisasi', sql: "ALTER TABLE guests ADD COLUMN jenis_organisasi text" },
];

for (const m of migrations) {
  if (existingCols.includes(m.col)) {
    console.log(`✓ Kolom '${m.col}' sudah ada, skip.`);
  } else {
    await client.execute(m.sql);
    console.log(`✅ Kolom '${m.col}' berhasil ditambahkan.`);
  }
}

console.log('\nMigrasi selesai. Database Turso siap untuk production.');
client.close();
