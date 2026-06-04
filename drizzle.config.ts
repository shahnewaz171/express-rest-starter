import { defineConfig } from 'drizzle-kit';

import env from '@/src/utils/env';

import { isProduction } from '@/src/utils';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL ?? '',
    ssl: isProduction ? { rejectUnauthorized: true } : false
  },
  verbose: true,
  strict: true
});
