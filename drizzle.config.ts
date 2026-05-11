import { defineConfig } from 'drizzle-kit';

import { DATABASE_URL } from '@/src/utils/env';

export default defineConfig({
  schema: './src/db/schema',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: DATABASE_URL ?? ''
    // ssl: isProduction ? { rejectUnauthorized: false } : false
  },
  verbose: true,
  strict: true
});
