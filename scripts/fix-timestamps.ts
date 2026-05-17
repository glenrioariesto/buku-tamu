import { db } from '../src/db';
import { guests } from '../src/db/schema';
import { sql } from 'drizzle-orm';

async function fixTimestamps() {
  console.log('🔧 Fixing existing timestamps (milliseconds → seconds)...');
  
  // Update all rows where created_at is in milliseconds (> 10 digits = after year 2286 in seconds)
  await db.run(
    sql`UPDATE guests SET created_at = created_at / 1000 WHERE created_at > 10000000000`
  );

  // Verify
  const allGuests = await db.select().from(guests).all();
  console.log(`✅ Fixed ${allGuests.length} records. Sample dates:`);
  allGuests.slice(0, 3).forEach(g => {
    console.log(`   - ${g.name}: ${g.createdAt}`);
  });
}

fixTimestamps().catch(err => {
  console.error('❌ Fix failed:', err);
  process.exit(1);
});
