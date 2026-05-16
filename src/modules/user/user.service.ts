import { and, eq, or, type SQL, sql } from 'drizzle-orm';
import { omit, slice } from 'lodash-es';

import { CustomError } from '@/src/utils/error';

import * as authTokenService from '@/src/modules/auth-token/auth-token.service';
import * as commonService from '@/src/modules/common/common.service';
import {
  changePasswordSchema,
  emailSchema,
  forgotPasswordSchema,
  loginSchema,
  passwordSchema,
  refreshTokenSchema,
  registerSchema,
  verifyForgotPasswordSchema
} from '@/src/modules/common/common.validation';
import { commonHelper, userHelper, verificationTokenHelper } from '@/src/modules/helpers';
import * as roleUserService from '@/src/modules/role-user/role-user.service';
import { user } from '@/src/modules/user/user.schema';
import type {
  GetUsersParams,
  LoginUserInput,
  RegisterUserInput
} from '@/src/modules/user/user.type';
import { verificationToken } from '@/src/modules/verification-token/verification-token.schema';
import * as verificationTokenService from '@/src/modules/verification-token/verification-token.service';
import type { CreateVerificationTokenInput } from '@/src/modules/verification-token/verification-token.type';

import type { DB } from '@/src/db';
import { db } from '@/src/db';

export const createAUser = async (
  data: { email: string; first_name?: string; last_name?: string; password?: string },
  tx?: DB
) => {
  const executor = tx ?? db;

  const [createdUser] = await executor.insert(user).values(data).returning();

  if (!createdUser) {
    throw new CustomError(500, 'COULD_NOT_CREATE_USER');
  }
  return createdUser;
};

export const updateAUser = async (id: string, data: Partial<GetUsersParams>, tx?: DB) => {
  const executor = tx ?? db;

  const [updatedUser] = await executor.update(user).set(data).where(eq(user.id, id)).returning();

  if (!updatedUser) {
    throw new CustomError(404, 'USER_NOT_FOUND');
  }
  return updatedUser;
};

export const deleteAUser = async (id: string, tx?: DB) => {
  const executor = tx ?? db;

  const [deletedUser] = await executor.delete(user).where(eq(user.id, id)).returning();

  if (!deletedUser) {
    throw new CustomError(404, 'USER_NOT_FOUND');
  }
  return deletedUser;
};

export const registerUser = async (params: RegisterUserInput, tx?: DB) => {
  const parsed = registerSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, parsed.error.issues.map((i) => i.message).join(', '));
  }

  const { email, first_name, last_name, password } = parsed.data;

  if (!commonHelper.validatePassword(password)) {
    throw new CustomError(400, 'PASSWORD_DID_NOT_CONFORM_OUR_POLICY');
  }

  const executor = tx ?? db;

  const existingUser = await executor.query.user.findFirst({
    where: eq(user.email, email)
  });

  if (existingUser) {
    throw new CustomError(400, 'EMAIL_IS_ALREADY_ASSOCIATED_WITH_A_USER');
  }

  const hashedPassword = commonService.generateHashPassword(password);

  const [createdUser] = await executor
    .insert(user)
    .values({
      email,
      first_name,
      last_name,
      password: hashedPassword
    })
    .returning();

  if (!createdUser) {
    throw new CustomError(500, 'COULD_NOT_CREATE_USER');
  }

  await roleUserService.assignARoleToUserByName({ role_name: 'user', user_id: createdUser.id });

  const verificationData: CreateVerificationTokenInput = {
    email,
    type: 'user_verification',
    user_id: createdUser.id
  };
  if (first_name) verificationData.first_name = first_name;
  if (last_name) verificationData.last_name = last_name;

  await verificationTokenService.createAVerificationTokenForUser(verificationData, tx);

  const hiddenFields = [
    'created_at',
    'new_email',
    'old_passwords',
    'password',
    'updated_at'
  ] as const;
  const userData = omit(createdUser, hiddenFields) as Omit<
    typeof createdUser,
    (typeof hiddenFields)[number]
  >;

  return userData;
};

export const loginUser = async (params: LoginUserInput, tx: DB) => {
  const parsed = loginSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, parsed.error.issues.map((i) => i.message).join(', '));
  }

  const { email, password } = parsed.data;

  const existingUser = await tx.query.user.findFirst({
    where: eq(user.email, email),
    with: {
      role_users: {
        with: {
          role: true
        }
      }
    }
  });

  if (!existingUser) {
    throw new CustomError(400, 'USER_DOES_NOT_EXIST');
  }

  if (existingUser.status !== 'active') {
    throw new CustomError(400, 'USER_ACCOUNT_IS_NOT_ACTIVE');
  }

  if (!existingUser.password) {
    throw new CustomError(400, 'PASSWORD_IS_INCORRECT');
  }

  const isPasswordValid = commonService.compareHashPassword(password, existingUser.password);
  if (!isPasswordValid) {
    throw new CustomError(400, 'PASSWORD_IS_INCORRECT');
  }

  const roles = existingUser.role_users.map((ru) => ru.role?.name ?? '').filter(Boolean);

  const tokens = await authTokenService.createAuthTokensForUser(
    { user_id: existingUser.id, roles },
    tx
  );

  await tx.update(user).set({ last_login_at: new Date() }).where(eq(user.id, existingUser.id));

  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token
  };
};

export const logoutAUser = async (params: { access_token: string }, tx?: DB) => {
  const deleted = await authTokenService.revokeAnAuthTokenForUser(
    { token: params.access_token, type: 'access_token' },
    tx
  );

  return deleted;
};

export const verifyUserEmail = async (params: { email: string; token: string }, tx?: DB) => {
  const emailParsed = emailSchema.safeParse(params.email);
  if (!emailParsed.success) {
    throw new CustomError(400, 'INVALID_EMAIL');
  }

  const executor = tx ?? db;

  const existingToken = await verificationTokenService.validateVerificationTokenForUser(
    {
      email: params.email,
      token: params.token,
      type: 'user_verification'
    },
    tx
  );

  const existingUser = await executor.query.user.findFirst({
    where: eq(user.id, existingToken.user_id)
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_DOES_NOT_EXIST');
  }

  const [updatedUser] = await executor
    .update(user)
    .set({ status: 'active' })
    .where(eq(user.id, existingToken.user_id))
    .returning();

  return updatedUser;
};

export const resendUserVerificationEmail = async (params: { email: string }, tx?: DB) => {
  const emailParsed = emailSchema.safeParse(params.email);
  if (!emailParsed.success) {
    throw new CustomError(400, 'INVALID_EMAIL');
  }

  const executor = tx ?? db;

  const existingUser = await executor.query.user.findFirst({
    where: or(eq(user.email, params.email), eq(user.new_email, params.email))
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_NOT_FOUND');
  }

  if (!(existingUser.status === 'unverified') && !existingUser.new_email) {
    throw new CustomError(400, 'USER_IS_ALREADY_VERIFIED');
  }

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const recentTokens = await executor.query.verificationToken.findMany({
    where: and(
      eq(verificationToken.user_id, existingUser.id),
      eq(verificationToken.type, 'user_verification'),
      sql`${verificationToken.created_at} > ${tenMinutesAgo}`
    )
  });

  if (recentTokens.length >= 3) {
    throw new CustomError(429, 'TOO_MANY_RESEND_VERIFICATION_REQUESTS');
  }

  await verificationTokenService.updateVerificationTokens(
    and(
      eq(verificationToken.user_id, existingUser.id),
      eq(verificationToken.type, 'user_verification'),
      eq(verificationToken.status, 'unverified')
    ) as SQL,
    { status: 'cancelled' },
    tx
  );

  const vData2: CreateVerificationTokenInput = {
    email: existingUser.email,
    type: 'user_verification',
    user_id: existingUser.id
  };
  if (existingUser.first_name) vData2.first_name = existingUser.first_name;
  if (existingUser.last_name) vData2.last_name = existingUser.last_name;

  const created = await verificationTokenService.createAVerificationTokenForUser(vData2, tx);

  return created;
};

export const changeEmailByUser = async (
  params: { user_id: string; new_email: string },
  tx?: DB
) => {
  const emailParsed = emailSchema.safeParse(params.new_email);
  if (!emailParsed.success) {
    throw new CustomError(400, 'INVALID_EMAIL');
  }

  const executor = tx ?? db;

  const existingUser = await executor.query.user.findFirst({
    where: eq(user.id, params.user_id)
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_NOT_FOUND');
  }

  if (existingUser.status !== 'active') {
    throw new CustomError(400, `USER_IS_${existingUser.status}`);
  }

  const emailExists = await executor.query.user.findFirst({
    where: eq(user.email, params.new_email)
  });

  if (emailExists) {
    throw new CustomError(400, 'EMAIL_IS_ALREADY_ASSOCIATED_WITH_A_USER');
  }

  const [updatedUser] = await executor
    .update(user)
    .set({ new_email: params.new_email })
    .where(eq(user.id, params.user_id))
    .returning();

  const vData1: CreateVerificationTokenInput = {
    email: params.new_email,
    type: 'user_verification',
    user_id: existingUser.id
  };
  if (existingUser.first_name) vData1.first_name = existingUser.first_name;
  if (existingUser.last_name) vData1.last_name = existingUser.last_name;

  await verificationTokenService.createAVerificationTokenForUser(vData1, tx);

  return updatedUser;
};

export const cancelChangeEmailByUser = async (params: { email: string }, tx?: DB) => {
  const emailParsed = emailSchema.safeParse(params.email);
  if (!emailParsed.success) {
    throw new CustomError(400, 'INVALID_EMAIL');
  }

  const executor = tx ?? db;

  const existingUser = await executor.query.user.findFirst({
    where: eq(user.new_email, params.email)
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_NOT_FOUND');
  }

  if (existingUser.status !== 'active') {
    throw new CustomError(400, `USER_IS_${existingUser.status}`);
  }

  const [updatedUser] = await executor
    .update(user)
    .set({ new_email: null })
    .where(eq(user.id, existingUser.id))
    .returning();

  const deletedTokens = await verificationTokenService.deleteVerificationTokens(
    and(
      eq(verificationToken.user_id, existingUser.id),
      eq(verificationToken.type, 'user_verification'),
      eq(verificationToken.status, 'unverified')
    ) as SQL,
    tx
  );

  if (!deletedTokens || deletedTokens.length === 0) {
    throw new CustomError(400, 'NO_CHANGE_EMAIL_REQUEST_IS_FOUND');
  }

  return updatedUser;
};

export const verifyChangeEmailByUser = async (
  params: { user_id: string; token: string },
  tx?: DB
) => {
  const executor = tx ?? db;

  const existingUser = await executor.query.user.findFirst({
    where: eq(user.id, params.user_id)
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_NOT_FOUND');
  }

  if (existingUser.status !== 'active') {
    throw new CustomError(400, `USER_IS_${existingUser.status}`);
  }

  if (!existingUser.new_email) {
    throw new CustomError(400, 'NO_PENDING_EMAIL_CHANGE');
  }

  await verificationTokenService.validateVerificationTokenForUser(
    {
      email: existingUser.new_email,
      token: params.token,
      type: 'user_verification',
      user_id: params.user_id
    },
    tx
  );

  const [updatedUser] = await executor
    .update(user)
    .set({ email: existingUser.new_email, new_email: null })
    .where(eq(user.id, params.user_id))
    .returning();

  return updatedUser;
};

export const setUserEmailByAdmin = async (
  params: { user_id: string; new_email: string },
  tx?: DB
) => {
  const emailParsed = emailSchema.safeParse(params.new_email);
  if (!emailParsed.success) {
    throw new CustomError(400, 'INVALID_EMAIL');
  }

  const executor = tx ?? db;

  const existingUser = await executor.query.user.findFirst({
    where: eq(user.id, params.user_id)
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_NOT_FOUND');
  }

  const emailExists = await executor.query.user.findFirst({
    where: eq(user.email, params.new_email)
  });

  if (emailExists) {
    throw new CustomError(400, 'EMAIL_ALREADY_EXISTS');
  }

  const [updatedUser] = await executor
    .update(user)
    .set({ email: params.new_email, new_email: null })
    .where(eq(user.id, params.user_id))
    .returning();

  return updatedUser;
};

export const changePasswordByUser = async (
  params: { user_id: string; old_password: string; new_password: string },
  tx?: DB
) => {
  const parsed = changePasswordSchema.safeParse({
    old_password: params.old_password,
    new_password: params.new_password
  });
  if (!parsed.success) {
    throw new CustomError(400, parsed.error.issues.map((i) => i.message).join(', '));
  }

  const executor = tx ?? db;

  const existingUser = await executor.query.user.findFirst({
    where: eq(user.id, params.user_id)
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_NOT_FOUND');
  }

  if (existingUser.status !== 'active') {
    throw new CustomError(400, `USER_IS_${existingUser.status}`);
  }

  if (!existingUser.password) {
    throw new CustomError(400, 'PASSWORD_NOT_SET');
  }

  const isOldPasswordValid = commonService.compareHashPassword(
    parsed.data.old_password,
    existingUser.password
  );
  if (!isOldPasswordValid) {
    throw new CustomError(400, 'OLD_PASSWORD_IS_INCORRECT');
  }

  const isOldPassword = commonService.checkOldPasswords(
    parsed.data.new_password,
    existingUser.old_passwords ?? []
  );
  if (isOldPassword) {
    throw new CustomError(400, 'PASSWORD_IS_ALREADY_USED_BEFORE');
  }

  const hashedPassword = commonService.generateHashPassword(parsed.data.new_password);

  const oldPasswords = [...slice(existingUser.old_passwords ?? [], 1, 3), hashedPassword];

  const [updatedUser] = await executor
    .update(user)
    .set({ password: hashedPassword, old_passwords: oldPasswords })
    .where(eq(user.id, params.user_id))
    .returning();

  await authTokenService.revokeAuthTokensForUser({ user_id: params.user_id }, tx);

  return updatedUser;
};

export const changePasswordByAdmin = async (
  params: { user_id: string; password: string },
  tx?: DB
) => {
  const parsed = passwordSchema.safeParse(params.password);
  if (!parsed.success) {
    throw new CustomError(400, parsed.error.issues.map((i) => i.message).join(', '));
  }

  const executor = tx ?? db;

  const existingUser = await executor.query.user.findFirst({
    where: eq(user.id, params.user_id)
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_NOT_FOUND');
  }

  const hashedPassword = commonService.generateHashPassword(params.password);

  const oldPasswords = [...slice(existingUser.old_passwords ?? [], 1, 3), hashedPassword];

  const [updatedUser] = await executor
    .update(user)
    .set({ password: hashedPassword, old_passwords: oldPasswords })
    .where(eq(user.id, params.user_id))
    .returning();

  await authTokenService.revokeAuthTokensForUser({ user_id: params.user_id }, tx);

  return updatedUser;
};

export const forgotPassword = async (params: { email: string }, tx?: DB) => {
  const parsed = forgotPasswordSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, parsed.error.issues.map((i) => i.message).join(', '));
  }

  const executor = tx ?? db;

  const existingUser = await executor.query.user.findFirst({
    where: eq(user.email, parsed.data.email)
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_NOT_FOUND');
  }

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const recentTokens = await executor.query.verificationToken.findMany({
    where: and(
      eq(verificationToken.user_id, existingUser.id),
      eq(verificationToken.type, 'forgot_password'),
      sql`${verificationToken.created_at} > ${tenMinutesAgo}`
    )
  });

  if (recentTokens.length >= 3) {
    throw new CustomError(429, 'TOO_MANY_FORGOT_PASSWORD_REQUESTS');
  }

  await verificationTokenService.updateVerificationTokens(
    and(
      eq(verificationToken.user_id, existingUser.id),
      eq(verificationToken.type, 'forgot_password'),
      eq(verificationToken.status, 'unverified')
    ) as SQL,
    { status: 'cancelled' },
    tx
  );

  const vData3: CreateVerificationTokenInput = {
    email: existingUser.email,
    type: 'forgot_password',
    user_id: existingUser.id
  };
  if (existingUser.first_name) vData3.first_name = existingUser.first_name;
  if (existingUser.last_name) vData3.last_name = existingUser.last_name;

  const created = await verificationTokenService.createAVerificationTokenForUser(vData3, tx);

  return created;
};

export const retryForgotPassword = async (params: { email: string }, tx?: DB) => {
  const parsed = forgotPasswordSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, parsed.error.issues.map((i) => i.message).join(', '));
  }

  const executor = tx ?? db;

  const existingUser = await executor.query.user.findFirst({
    where: eq(user.email, parsed.data.email)
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_NOT_FOUND');
  }

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const recentTokens = await executor.query.verificationToken.findMany({
    where: and(
      eq(verificationToken.user_id, existingUser.id),
      eq(verificationToken.type, 'forgot_password'),
      sql`${verificationToken.created_at} > ${tenMinutesAgo}`
    )
  });

  if (recentTokens.length >= 3) {
    throw new CustomError(429, 'TOO_MANY_FORGOT_PASSWORD_REQUESTS');
  }

  await verificationTokenService.updateVerificationTokens(
    and(
      eq(verificationToken.user_id, existingUser.id),
      eq(verificationToken.type, 'forgot_password'),
      eq(verificationToken.status, 'unverified')
    ) as SQL,
    { status: 'cancelled' },
    tx
  );

  const vData4: CreateVerificationTokenInput = {
    email: existingUser.email,
    type: 'forgot_password',
    user_id: existingUser.id
  };
  if (existingUser.first_name) vData4.first_name = existingUser.first_name;
  if (existingUser.last_name) vData4.last_name = existingUser.last_name;

  const created = await verificationTokenService.createAVerificationTokenForUser(vData4, tx);

  return created;
};

export const verifyForgotPasswordCode = async (
  params: { email: string; token: string },
  _tx?: DB
) => {
  const emailParsed = emailSchema.safeParse(params.email);
  if (!emailParsed.success) {
    throw new CustomError(400, 'INVALID_EMAIL');
  }

  const existingToken = await verificationTokenHelper.getAVerificationToken({
    where: and(
      eq(verificationToken.email, params.email),
      eq(verificationToken.token, params.token),
      eq(verificationToken.type, 'forgot_password'),
      eq(verificationToken.status, 'unverified')
    ) as SQL
  });

  if (!existingToken) {
    throw new CustomError(400, 'INVALID_VERIFICATION_TOKEN');
  }

  if (new Date(existingToken.expired_at) < new Date()) {
    throw new CustomError(400, 'VERIFICATION_TOKEN_EXPIRED');
  }

  return { message: 'OTP_IS_VALID', success: true };
};

export const verifyForgotPassword = async (
  params: { email: string; password: string; token: string },
  tx?: DB
) => {
  const parsed = verifyForgotPasswordSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, parsed.error.issues.map((i) => i.message).join(', '));
  }

  if (!commonHelper.validatePassword(parsed.data.password)) {
    throw new CustomError(400, 'PASSWORD_DID_NOT_CONFORM_OUR_POLICY');
  }

  const executor = tx ?? db;

  const existingUser = await executor.query.user.findFirst({
    where: eq(user.email, parsed.data.email)
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_NOT_FOUND');
  }

  await verificationTokenService.validateVerificationTokenForUser(
    {
      email: parsed.data.email,
      token: parsed.data.token,
      type: 'forgot_password'
    },
    tx
  );

  const isCurrentPassword = commonService.compareHashPassword(
    parsed.data.password,
    existingUser.password ?? ''
  );

  const isOldPassword = commonService.checkOldPasswords(
    parsed.data.password,
    existingUser.old_passwords ?? []
  );

  if (isCurrentPassword || isOldPassword) {
    throw new CustomError(400, 'PASSWORD_IS_ALREADY_USED_BEFORE');
  }

  const hashedPassword = commonService.generateHashPassword(parsed.data.password);

  const oldPasswords = [...(existingUser.old_passwords ?? []), existingUser.password ?? '']
    .filter(Boolean)
    .slice(-5);

  const [updatedUser] = await executor
    .update(user)
    .set({ password: hashedPassword, old_passwords: oldPasswords })
    .where(eq(user.id, existingUser.id))
    .returning();

  await authTokenService.revokeAuthTokensForUser({ user_id: existingUser.id }, tx);

  return updatedUser;
};

export const verifyUserPassword = async (
  params: { user_id: string; password: string },
  tx?: DB
) => {
  if (!params.password) {
    throw new CustomError(400, 'PASSWORD_IS_REQUIRED');
  }

  const executor = tx ?? db;

  const existingUser = await executor.query.user.findFirst({
    where: eq(user.id, params.user_id)
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_NOT_FOUND');
  }

  if (!existingUser.password) {
    throw new CustomError(400, 'PASSWORD_NOT_SET');
  }

  const isValid = commonService.compareHashPassword(params.password, existingUser.password);

  if (!isValid) {
    return { message: 'PASSWORD_IS_INCORRECT', success: false };
  }

  return { message: 'PASSWORD_IS_CORRECT', success: true };
};

export const refreshTokensForUser = async (
  params: { access_token: string; refresh_token: string },
  tx?: DB
) => {
  const parsed = refreshTokenSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, parsed.error.issues.map((i) => i.message).join(', '));
  }

  const decoded = commonService.decodeJWTToken(parsed.data.access_token) as {
    user_id?: string;
    roles?: string[];
  } | null;

  if (!decoded?.user_id) {
    throw new CustomError(400, 'INVALID_ACCESS_TOKEN');
  }

  const freshUser = await userHelper.getAuthUserWithRolesAndPermissions({
    roles: decoded.roles ?? [],
    user_id: decoded.user_id
  });

  if (!freshUser) {
    throw new CustomError(404, 'USER_NOT_FOUND');
  }

  const tokens = await authTokenService.refreshAuthTokensForUser(
    {
      refresh_token: parsed.data.refresh_token,
      roles: freshUser.roles,
      user_id: decoded.user_id
    },
    tx
  );

  return tokens;
};

export const verifyTokenForUser = async (
  params: { token: string; type: 'access_token' | 'refresh_token' },
  tx?: DB
) => {
  const result = await authTokenService.verifyAnAuthTokenForUser(params, tx);

  return result;
};
