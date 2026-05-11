import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

import { DATABASE_URL } from '@/src/utils/env';

import * as schema from '@/src/db/schema';

export const client = new Client({
  connectionString: DATABASE_URL
  // ssl: isProduction ? { rejectUnauthorized: false } : false
});

export const connectToPostgresDB = async () => {
  try {
    await client.connect();

    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit();
  }
};

export const db = drizzle(client, { schema, logger: false });
export type DB = typeof db;
