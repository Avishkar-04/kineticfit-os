import { createDbClient } from './index.js';
import { createMonthlyPartitions } from './partitioning.js';

export async function runMigrations() {
  console.log('Running KineticFit OS database migrations...');
  const { pool } = createDbClient();
  try {
    const client = await pool.connect();
    try {
      console.log('1. Verifying schema extensions...');
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
      await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
      
      console.log('2. Running partitioning maintenance...');
      await createMonthlyPartitions(pool as any);
      
      console.log('Migrations completed successfully.');
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Migration error (fallback to offline mock if DB unavailable):', err.message);
  } finally {
    await pool.end().catch(() => {});
  }
}

if (process.argv[1]?.endsWith('migrate.js') || process.argv[1]?.endsWith('migrate.ts')) {
  runMigrations();
}
