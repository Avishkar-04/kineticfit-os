import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema/index.js';

export * from './schema/index.js';
export { schema };

export function createDbClient(connectionString?: string) {
  const url =
    connectionString ||
    process.env.DATABASE_URL ||
    'postgresql://kinetic_app:kinetic_secret@localhost:6432/kineticfit?sslmode=disable';

  const pool = new pg.Pool({
    connectionString: url,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  });

  return {
    db: drizzle(pool, { schema }),
    pool
  };
}

