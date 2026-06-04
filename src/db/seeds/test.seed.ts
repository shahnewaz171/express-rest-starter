import { and, desc, eq, type SQL } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { emailSchema, uuidSchema } from '@/src/modules/common/common.validation';
import { user } from '@/src/modules/user/user.schema';
import {
  verificationToken,
  verificationTokenStatusEnum,
  verificationTokenTypeEnum
} from '@/src/modules/verification-token/verification-token.schema';
import type {
  VerificationTokenStatus,
  VerificationTokenType
} from '@/src/modules/verification-token/verification-token.type';

import { db } from '@/src/db';
// import users from '@/src/db/seeds/data/users.json' with { type: 'json' };

import { isProduction } from '@/src/utils';

interface GetLatestVerificationTokenParams {
  email?: string | undefined;
  status?: VerificationTokenStatus | undefined;
  type?: VerificationTokenType | undefined;
  user_id?: string | undefined;
}

// const seededEmails = new Set(users.map((u) => u.email.toLowerCase()));

const testVerificationTokenQuerySchema = z
  .object({
    email: emailSchema.optional(),
    status: z.enum(verificationTokenStatusEnum.enumValues).optional(),
    type: z.enum(verificationTokenTypeEnum.enumValues).optional(),
    user_id: uuidSchema.optional()
  })
  .refine((value) => Boolean(value.email || value.user_id), {
    message: 'EMAIL_OR_USER_ID_IS_REQUIRED'
  });

const getLatestVerificationToken = async (params: GetLatestVerificationTokenParams = {}) => {
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

    const parsed = testVerificationTokenQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: parsed.error.issues[0]?.message ?? 'VALIDATION_ERROR' });
    }

    const { email, status, type, user_id } = parsed.data;

    // if (email && !seededEmails.has(email)) {
    //   return res.status(400).json({ message: 'SEED_USER_EMAIL_REQUIRED' });
    // }

    if (user_id) {
      const foundUser = await db.query.user.findFirst({
        where: eq(user.id, user_id),
        columns: { email: true }
      });

      if (!foundUser) {
        return res.status(404).json({ message: 'USER_DOES_NOT_EXIST' });
      }

      // if (!seededEmails.has(foundUser.email.toLowerCase())) {
      //   return res.status(400).json({ message: 'SEED_USER_ID_REQUIRED' });
      // }

      if (email && foundUser.email.toLowerCase() !== email.toLowerCase()) {
        return res.status(400).json({ message: 'EMAIL_AND_USER_ID_MISMATCH' });
      }
    }

    const token = await getLatestVerificationToken({
      email,
      status: status as VerificationTokenStatus | undefined,
      type: type as VerificationTokenType | undefined,
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
