import { and, type SQL } from 'drizzle-orm';

import { verificationToken } from '@/src/modules/verification-token/verification-token.schema';

import type { DB } from '@/src/db';
import { db } from '@/src/db';

export const countVerificationTokens = async (where?: SQL, tx: DB = db) => {
  const conditions = where ? [where] : [];

  const result = await tx
    .select({ count: verificationToken.id })
    .from(verificationToken)
    .where(and(...conditions));

  return result.length;
};

export const getAVerificationToken = async (options: {
  where?: SQL;
  with?: Record<string, boolean>;
  tx?: DB;
}) => {
  const { where, with: withRelations, tx = db } = options;

  const result = await tx.query.verificationToken.findFirst({
    where,
    with: withRelations
  });

  return result ?? null;
};

export const getVerificationTokens = async (options: {
  where?: SQL;
  limit?: number;
  offset?: number;
  order?: [string, string][];
  with?: Record<string, boolean>;
  tx?: DB;
}) => {
  const { where, limit = 50, offset = 0, with: withRelations, tx = db } = options;

  const result = await tx.query.verificationToken.findMany({
    where,
    limit,
    offset,
    with: withRelations
  });

  return result;
};
