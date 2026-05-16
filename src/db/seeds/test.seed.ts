import { and, desc, eq, type SQL } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';

import { isProduction } from '@/src/utils/env';

import { verificationToken } from '@/src/modules/verification-token/verification-token.schema';
import type {
  VerificationTokenStatus,
  VerificationTokenType
} from '@/src/modules/verification-token/verification-token.type';

import { db } from '@/src/db';

interface GetLatestVerificationTokenParams {
  email?: string | undefined;
  status?: VerificationTokenStatus | undefined;
  type?: VerificationTokenType | undefined;
  user_id?: string | undefined;
}

export const getLatestVerificationToken = async (params: GetLatestVerificationTokenParams = {}) => {
  const { email, status = 'unverified', type, user_id } = params;

  const conditions: SQL[] = [eq(verificationToken.status, status)];
  if (email) conditions.push(eq(verificationToken.email, email));
  if (type) conditions.push(eq(verificationToken.type, type));
  if (user_id) conditions.push(eq(verificationToken.user_id, user_id));

  const token = await db
    .select()
    .from(verificationToken)
    .where(and(...conditions))
    .orderBy(desc(verificationToken.created_at))
    .limit(1);

  return token?.[0] ?? null;
};

export const testVerificationTokenRouter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (isProduction) {
      return res.status(403).json({ message: 'Forbidden in production environment' });
    }

    const { email, status, type, user_id } = req.query as Record<string, string>;

    const token = await getLatestVerificationToken({
      email,
      status: status as 'cancelled' | 'verified' | 'unverified' | undefined,
      type: type as 'forgot_password' | 'user_verification' | undefined,
      user_id
    });

    if (!token) {
      return res.status(404).json({ message: 'VERIFICATION_TOKEN_NOT_FOUND' });
    }

    res.status(200).json({ data: token, message: 'SUCCESS' });
  } catch (error) {
    console.error('Get verification token failed:', error);
    next(error);
  }
};
