import { and, type SQL } from 'drizzle-orm';

import { verificationToken } from '@/src/modules/verification-token/verification-token.schema';

import { db } from '@/src/db';

export const countVerificationTokens = async (where?: SQL) => {
  const conditions = where ? [where] : [];

  const result = await db
    .select({ count: verificationToken.id })
    .from(verificationToken)
    .where(and(...conditions));

  return result.length;
};

export const getAVerificationToken = async (options: {
  where?: SQL;
  with?: Record<string, boolean>;
}) => {
  const { where, with: withRelations } = options;

  const result = await db.query.verificationToken.findFirst({
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
}) => {
  const { where, limit = 50, offset = 0, with: withRelations } = options;

  const result = await db.query.verificationToken.findMany({
    where,
    limit,
    offset,
    with: withRelations
  });

  return result;
};
