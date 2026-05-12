import { and, eq, type SQL } from 'drizzle-orm';

import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from '@/src/utils/env';

import type { NewAuthToken } from '@/src/modules/auth-token/auth-token.schema';
import { authToken } from '@/src/modules/auth-token/auth-token.schema';
import type {
  RefreshTokenInput,
  RevokeTokenInput,
  VerifyTokenInput
} from '@/src/modules/auth-token/auth-token.type';
import * as commonService from '@/src/modules/common/common.service';
import { authTokenHelper } from '@/src/modules/helpers';

import type { DB } from '@/src/db';
import { db } from '@/src/db';

export const createAnAuthToken = async (data: NewAuthToken, tx?: DB) => {
  const executor = tx ?? db;

  const [created] = await executor.insert(authToken).values(data).returning();

  return created;
};

export const deleteAnAuthToken = async (where: SQL, tx?: DB) => {
  const executor = tx ?? db;

  const [deleted] = await executor.delete(authToken).where(where).returning();

  return deleted;
};

export const deleteAuthTokens = async (where: SQL, tx?: DB) => {
  const executor = tx ?? db;

  const results = await executor.delete(authToken).where(where).returning();

  return results;
};

export const createAuthTokensForUser = async (
  params: { user_id: string; roles?: string[] },
  tx?: DB
) => {
  const { user_id, roles = [] } = params;

  const access_token = commonService.generateJWTToken(
    { roles, sub: user_id, user_id },
    ACCESS_TOKEN_EXPIRY as Parameters<typeof commonService.generateJWTToken>[1]
  );

  const refresh_token = commonService.generateJWTToken(
    { sub: user_id, user_id },
    REFRESH_TOKEN_EXPIRY as Parameters<typeof commonService.generateJWTToken>[1]
  );

  await createAnAuthToken({ access_token, refresh_token, user_id }, tx);

  return { access_token, refresh_token };
};

export const verifyAnAuthTokenForUser = async (params: VerifyTokenInput, _tx?: DB) => {
  const { token, type } = params;

  const { user_id } = (commonService.decodeJWTToken(token) as { user_id?: string }) || {};

  const where =
    type === 'access_token'
      ? and(eq(authToken.access_token, token), eq(authToken.user_id, user_id ?? ''))
      : and(eq(authToken.refresh_token, token), eq(authToken.user_id, user_id ?? ''));

  const authTokenData = where ? await authTokenHelper.getAnAuthToken({ where }) : null;

  if (!authTokenData?.id) {
    return { message: 'INVALID_TOKEN', success: false };
  }

  return commonService.verifyJWTToken(token) || {};
};

export const refreshAuthTokensForUser = async (params: RefreshTokenInput, tx?: DB) => {
  const { refresh_token, roles, user_id } = params;

  const verification = commonService.verifyJWTToken(refresh_token);

  if (!verification.success) {
    return { message: verification.message, success: false };
  }

  const where = and(eq(authToken.refresh_token, refresh_token), eq(authToken.user_id, user_id));

  const existingToken = where
    ? await authTokenHelper.getAnAuthToken({ where, with: { user: true } })
    : null;

  if (!existingToken) {
    return { message: 'REFRESH_TOKEN_NOT_FOUND', success: false };
  }

  const user = (existingToken as Record<string, unknown>).user as
    | { id?: string; status?: string }
    | undefined;

  if (!user?.id) {
    throw new Error('USER_DOES_NOT_EXIST');
  }

  if (user.status !== 'active') {
    throw new Error('USER_IS_NOT_ACTIVE');
  }

  await deleteAnAuthToken(eq(authToken.id, existingToken.id), tx);

  const tokens = await createAuthTokensForUser({ user_id, roles }, tx);

  return tokens;
};

export const revokeAnAuthTokenForUser = async (params: RevokeTokenInput, tx?: DB) => {
  const { token, type } = params;

  const where =
    type === 'access_token'
      ? eq(authToken.access_token, token)
      : eq(authToken.refresh_token, token);

  const deleted = await deleteAnAuthToken(where, tx);

  if (!deleted) {
    return { message: 'INVALID_TOKEN', success: false };
  }

  return { message: 'LOGGED_OUT', success: true };
};

export const revokeAuthTokensForUser = async (params: { user_id: string }, tx?: DB) => {
  const { user_id } = params;

  const user = await db.query.user.findFirst({
    where: (users, { eq: eqFn }) => eqFn(users.id, user_id)
  });

  if (!user?.id) {
    throw new Error('USER_DOES_NOT_EXIST');
  }

  if (user.status !== 'active') {
    throw new Error('USER_IS_NOT_ACTIVE');
  }

  const deleted = await deleteAuthTokens(eq(authToken.user_id, user_id), tx);

  if (deleted.length === 0) {
    return { message: 'INVALID_TOKEN', success: false };
  }

  return { message: 'LOGGED_OUT', success: true };
};
