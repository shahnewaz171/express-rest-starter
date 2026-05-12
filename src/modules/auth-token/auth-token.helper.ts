import { and, eq, type SQL } from 'drizzle-orm';

import { authToken } from '@/src/modules/auth-token/auth-token.schema';

import { db } from '@/src/db';

export const countAuthTokens = async (where?: SQL) => {
  const conditions = where ? [where] : [];

  const result = await db
    .select({ count: authToken.id })
    .from(authToken)
    .where(and(...conditions));

  return result.length;
};

export const getAnAuthToken = async (options: { where?: SQL; with?: Record<string, boolean> }) => {
  const { where, with: withRelations } = options;

  const result = await db.query.authToken.findFirst({
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
}) => {
  const { where, limit = 50, offset = 0, with: withRelations } = options;

  const result = await db.query.authToken.findMany({
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
