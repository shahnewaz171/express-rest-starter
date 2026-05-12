import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { DATABASE_URL, isProduction } from '@/src/utils/env';

import * as schema from '@/src/db/schema';

export const pool = new Pool({
  connectionString: DATABASE_URL,
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 10000,
  max: 100,
  min: 0
  // ssl: isProduction ? { rejectUnauthorized: false } : false
});

export const connectToPostgresDB = async () => {
  try {
    const client = await pool.connect();

    console.log('Database connected successfully');
    client.release();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit();
  }
};

export const db = drizzle(pool, { schema, logger: !isProduction });
export type DB = typeof db | Transaction;

import { CustomError } from '@/src/utils/error';

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export const useTransaction = async <T>(callback: (tx: Transaction) => Promise<T>): Promise<T> => {
  try {
    return await db.transaction(async (tx) => {
      const result = await callback(tx).catch((err) => {
        throw new CustomError(err?.statusCode || 500, err?.message);
      });
      return result;
    });
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    throw new CustomError(error?.statusCode || 500, error?.message || 'UNKNOWN_ERROR');
  }
};
