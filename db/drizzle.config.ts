import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_DIRECT_URL || 'postgresql://kinetic_admin:kinetic_secret@localhost:5432/kineticfit?sslmode=disable'
  }
});

