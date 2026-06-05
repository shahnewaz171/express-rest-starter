import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import env from '@/src/utils/env';
import { CustomError } from '@/src/utils/error';

import type { ApiErrorResponse } from '@/src/modules/common/common.type';

import * as schema from '@/src/db/schema';

import { isProduction } from '@/src/utils';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
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
    process.exit(1);
  }
};

export const db = drizzle(pool, { schema, logger: !isProduction });
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type DB = typeof db | Transaction;

export const useTransaction = async <T>(callback: (tx: Transaction) => Promise<T>): Promise<T> => {
  try {
    return await db.transaction(async (tx) => {
      const result = await callback(tx).catch((err: ApiErrorResponse) => {
        throw new CustomError(err?.statusCode || 500, err?.message, err?.errors);
      });
      return result;
    });
  } catch (err) {
    const error = err as ApiErrorResponse;

    throw new CustomError(
      error?.statusCode || 500,
      error?.message || 'UNKNOWN_ERROR',
      error?.errors
    );
  }
};
