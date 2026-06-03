import { and, eq, type SQL } from 'drizzle-orm';

import { authToken } from '@/src/modules/auth-token/auth-token.schema';

import type { DB } from '@/src/db';
import { db } from '@/src/db';

export const countAuthTokens = async (where?: SQL, tx: DB = db) => {
  const conditions = where ? [where] : [];

  const result = await tx
    .select({ count: authToken.id })
    .from(authToken)
    .where(and(...conditions));

  return result.length;
};

export const getAnAuthToken = async (options: {
  where?: SQL;
  with?: Record<string, boolean>;
  tx?: DB;
}) => {
  const { where, with: withRelations, tx = db } = options;

  const result = await tx.query.authToken.findFirst({
    where,
    with: withRelations
  });

  return result ?? null;
};

export const getAuthTokens = async (options: {
  where?: SQL;
  limit?: number;
  offset?: number;
  order?: [string, string][];
  with?: Record<string, boolean>;
  tx?: DB;
}) => {
  const { where, limit = 50, offset = 0, with: withRelations, tx = db } = options;

  const result = await tx.query.authToken.findMany({
    where,
    limit,
    offset,
    with: withRelations
  });

  return result;
};

export const prepareAuthTokenQuery = (params: Record<string, unknown>) => {
  const conditions: SQL[] = [];

  if (params.user_id) {
    conditions.push(eq(authToken.user_id, params.user_id as string));
  }

  if (params.access_token) {
    conditions.push(eq(authToken.access_token, params.access_token as string));
  }

  if (params.refresh_token) {
    conditions.push(eq(authToken.refresh_token, params.refresh_token as string));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
};
