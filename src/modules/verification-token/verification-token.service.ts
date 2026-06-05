import dayjs from 'dayjs';
import { and, eq, type SQL } from 'drizzle-orm';

import env from '@/src/utils/env';
import { CustomError } from '@/src/utils/error';

import * as commonHelper from '@/src/modules/common/common.helper';
import * as notificationService from '@/src/modules/email/email.service';
import * as userHelper from '@/src/modules/user/user.helper';
import type { NewVerificationToken } from '@/src/modules/verification-token/verification-token.schema';
import { verificationToken } from '@/src/modules/verification-token/verification-token.schema';
import type {
  CreateVerificationTokenInput,
  ValidateVerificationTokenInput
} from '@/src/modules/verification-token/verification-token.type';

import type { DB } from '@/src/db';

export const createAVerificationToken = async (data: NewVerificationToken, tx: DB) => {
  const [created] = await tx.insert(verificationToken).values(data).returning();

  return created;
};

export const updateAVerificationToken = async (
  id: string,
  data: Partial<NewVerificationToken>,
  tx: DB
) => {
  const [updated] = await tx
    .update(verificationToken)
    .set(data)
    .where(eq(verificationToken.id, id))
    .returning();

  return updated;
};

export const updateVerificationTokens = async (
  where: SQL,
  data: Partial<NewVerificationToken>,
  tx: DB
) => {
  const results = await tx.update(verificationToken).set(data).where(where).returning();

  return results;
};

export const deleteAVerificationToken = async (id: string, tx: DB) => {
  const [deleted] = await tx
    .delete(verificationToken)
    .where(eq(verificationToken.id, id))
    .returning();

  return deleted;
};

export const deleteVerificationTokens = async (where: SQL, tx: DB) => {
  const results = await tx.delete(verificationToken).where(where).returning();

  return results;
};

export const createAVerificationTokenForUser = async (
  params: CreateVerificationTokenInput,
  tx: DB
) => {
  const { email, first_name, last_name, type, user_id } = params;

  const token = commonHelper.getGeneratedOTP();

  const created = await createAVerificationToken({ email, token, type, user_id }, tx);

  if (!created) {
    throw new CustomError(500, 'FAILED_TO_CREATE_VERIFICATION_TOKEN');
  }

  const event =
    params.event ??
    (type === 'forgot_password' ? 'send_forgot_password_token' : 'send_user_verification_token');

  await notificationService.sendEmailNotification({
    event,
    to_email: email,
    variables: {
      email,
      token: created.token,
      url: env.CLIENT_APP_URL,
      username: userHelper.getUsernameByNames(email, first_name, last_name)
    }
  });

  return created;
};

export const validateVerificationTokenForUser = async (
  params: ValidateVerificationTokenInput,
  tx: DB
) => {
  const { email, token, type, user_id } = params;

  const conditions: SQL[] = [
    eq(verificationToken.token, token),
    eq(verificationToken.type, type),
    eq(verificationToken.status, 'unverified')
  ];

  if (email) {
    conditions.push(eq(verificationToken.email, email));
  }

  if (user_id) {
    conditions.push(eq(verificationToken.user_id, user_id));
  }

  const where = and(...conditions) as SQL;

  const existingToken = await tx.query.verificationToken.findFirst({ where });

  if (!existingToken) {
    throw new CustomError(400, 'OTP_IS_NOT_VALID');
  }

  const isExpired = dayjs(existingToken.expires_at).isBefore(dayjs());
  if (isExpired) {
    throw new CustomError(400, 'OTP_IS_EXPIRED');
  }

  const updateConditions: SQL[] = [
    eq(verificationToken.token, token),
    eq(verificationToken.type, type),
    eq(verificationToken.status, 'unverified')
  ];

  if (email) {
    updateConditions.push(eq(verificationToken.email, email));
  }

  if (user_id) {
    updateConditions.push(eq(verificationToken.user_id, user_id));
  }

  await updateVerificationTokens(and(...updateConditions) as SQL, { status: 'verified' }, tx);

  return existingToken;
};
