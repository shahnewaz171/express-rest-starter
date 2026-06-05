import dayjs from 'dayjs';
import { and, eq, inArray, not, or, type SQL, sql } from 'drizzle-orm';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import size from 'lodash/size';

import { CustomError } from '@/src/utils/error';

import * as authTokenService from '@/src/modules/auth-token/auth-token.service';
import { refreshTokenSchema } from '@/src/modules/auth-token/auth-token.validation';
import * as commonHelper from '@/src/modules/common/common.helper';
import * as commonService from '@/src/modules/common/common.service';
import { emailSchema } from '@/src/modules/common/common.validation';
import * as notificationService from '@/src/modules/email/email.service';
import * as roleUserService from '@/src/modules/role-user/role-user.service';
import * as userHelper from '@/src/modules/user/user.helper';
import { user } from '@/src/modules/user/user.schema';
import type {
  GetUsersParams,
  LoginUserInput,
  RegisterUserInput
} from '@/src/modules/user/user.type';
import {
  changeEmailSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  setUserPasswordByAdminSchema,
  verifyChangeEmailSchema,
  verifyForgotPasswordSchema,
  verifyUserEmailSchema,
  verifyUserPasswordSchema
} from '@/src/modules/user/user.validation';
import * as verificationTokenHelper from '@/src/modules/verification-token/verification-token.helper';
import { verificationToken } from '@/src/modules/verification-token/verification-token.schema';
import * as verificationTokenService from '@/src/modules/verification-token/verification-token.service';
import type { CreateVerificationTokenInput } from '@/src/modules/verification-token/verification-token.type';

import type { DB } from '@/src/db';

export const createAUser = async (
  data: { email: string; first_name: string; last_name: string; password: string },
  tx: DB
) => {
  const [createdUser] = await tx.insert(user).values(data).returning();

  if (!createdUser) {
    throw new CustomError(500, 'COULD_NOT_CREATE_USER');
  }
  return createdUser;
};

export const updateAUser = async (id: string, data: Partial<GetUsersParams>, tx: DB) => {
  const [updatedUser] = await tx.update(user).set(data).where(eq(user.id, id)).returning();

  if (!updatedUser) {
    throw new CustomError(404, 'USER_DOES_NOT_EXIST');
  }
  return updatedUser;
};

export const deleteAUser = async (id: string, tx: DB) => {
  const [deletedUser] = await tx.delete(user).where(eq(user.id, id)).returning();

  if (!deletedUser) {
    throw new CustomError(404, 'USER_DOES_NOT_EXIST');
  }
  return deletedUser;
};

export const registerUser = async (params: RegisterUserInput, tx: DB) => {
  const parsed = registerSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, 'INVALID_INPUT', parsed.error.issues);
  }

  const { email, first_name, last_name, password } = parsed.data;

  if (!commonHelper.validatePassword(password)) {
    throw new CustomError(400, 'PASSWORD_DID_NOT_CONFORM_OUR_POLICY');
  }

  const existingUser = await tx.query.user.findFirst({
    where: eq(user.email, email)
  });

  if (existingUser) {
    throw new CustomError(400, 'EMAIL_IS_ALREADY_ASSOCIATED_WITH_A_USER');
  }

  const hashedPassword = await commonService.generateHashPassword(password);

  const [createdUser] = await tx
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

  await roleUserService.assignARoleToUserByName({ role_name: 'user', user_id: createdUser.id }, tx);

  const verificationData: CreateVerificationTokenInput = {
    email,
    type: 'user_verification',
    user_id: createdUser.id,
    first_name,
    last_name
  };

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
    throw new CustomError(400, 'INVALID_INPUT', parsed.error.issues);
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

  if (!existingUser.password) {
    throw new CustomError(400, 'USER_DID_NOT_SET_PASSWORD');
  }

  if (existingUser.status !== 'active') {
    throw new CustomError(400, `USER_ACCOUNT_IS_${existingUser.status.toUpperCase()}`);
  }

  const isPasswordValid = await commonService.compareHashPassword(password, existingUser.password);
  if (!isPasswordValid) {
    throw new CustomError(400, 'PASSWORD_IS_INCORRECT');
  }

  const roles = existingUser.role_users.map((ru) => ru.role?.name ?? '').filter(Boolean);

  const tokens = await authTokenService.createAuthTokensForUser(
    { user_id: existingUser.id, roles },
    tx
  );

  await tx
    .update(user)
    .set({ last_login_at: dayjs().toDate() })
    .where(eq(user.id, existingUser.id));

  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token
  };
};

export const logoutAUser = async (params: { access_token: string }, tx: DB) => {
  const deleted = await authTokenService.revokeAnAuthTokenForUser(
    { token: params.access_token, type: 'access_token' },
    tx
  );

  return deleted;
};

export const verifyUserEmail = async (params: { email: string; token: string }, tx: DB) => {
  const emailParsed = verifyUserEmailSchema.safeParse(params);

  if (!emailParsed.success) {
    throw new CustomError(400, 'INVALID_INPUT', emailParsed.error.issues);
  }

  const existingToken = await verificationTokenService.validateVerificationTokenForUser(
    {
      email: emailParsed.data.email,
      token: emailParsed.data.token,
      type: 'user_verification'
    },
    tx
  );

  const existingUser = await tx.query.user.findFirst({
    where: eq(user.id, existingToken.user_id)
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_DOES_NOT_EXIST');
  }

  const [updatedUser] = await tx
    .update(user)
    .set({ status: 'active' })
    .where(eq(user.id, existingToken.user_id))
    .returning();

  return omit(updatedUser, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at']);
};

export const resendUserVerificationEmail = async (params: { email: string }, tx: DB) => {
  const { email } = params || {};

  const emailParsed = emailSchema.safeParse(email);
  if (!emailParsed.success) {
    throw new CustomError(400, 'EMAIL_REQUIRED');
  }

  const existingUser = await tx.query.user.findFirst({
    where: or(eq(user.email, emailParsed.data), eq(user.new_email, emailParsed.data))
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_DOES_NOT_EXIST');
  }

  if (existingUser.status !== 'unverified' && !existingUser.new_email) {
    throw new CustomError(400, 'USER_IS_ALREADY_VERIFIED');
  }

  const tenMinutesAgo = dayjs().subtract(10, 'minute').toDate();
  const recentTokens = await tx.query.verificationToken.findMany({
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

  const isEmailChange = Boolean(existingUser.new_email);
  const targetEmail = existingUser.new_email ?? existingUser.email;

  const vData2: CreateVerificationTokenInput = {
    ...pick(existingUser, ['first_name', 'last_name']),
    email: targetEmail,
    type: 'user_verification',
    user_id: existingUser.id,
    ...(isEmailChange && { event: 'send_change_email_token' })
  };

  const created = await verificationTokenService.createAVerificationTokenForUser(vData2, tx);

  return omit(created, ['created_at', 'token', 'expires_at', 'type', 'updated_at']);
};

export const changeEmailByUser = async (params: { user_id: string; new_email: string }, tx: DB) => {
  const emailParsed = changeEmailSchema.safeParse(params);
  if (!emailParsed.success) {
    throw new CustomError(400, 'VALIDATION_ERROR', emailParsed.error.issues);
  }

  const { new_email, user_id } = params;

  if (!commonHelper.validateEmail(new_email)) {
    throw new CustomError(400, 'INVALID_EMAIL');
  }

  const existingUser = await tx.query.user.findFirst({
    where: eq(user.id, user_id)
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_DOES_NOT_EXIST');
  }

  if (existingUser.status !== 'active') {
    throw new CustomError(400, `USER_IS_${existingUser.status.toUpperCase()}`);
  }

  const emailExists = await tx.query.user.findFirst({
    where: and(
      or(eq(user.email, new_email), eq(user.new_email, new_email)),
      not(eq(user.id, user_id))
    )
  });

  if (emailExists) {
    throw new CustomError(400, 'EMAIL_IS_ALREADY_ASSOCIATED_WITH_A_USER');
  }

  const [updatedUser] = await tx
    .update(user)
    .set({ new_email })
    .where(eq(user.id, user_id))
    .returning();

  await verificationTokenService.updateVerificationTokens(
    and(
      eq(verificationToken.user_id, existingUser.id),
      eq(verificationToken.type, 'user_verification'),
      inArray(verificationToken.status, ['cancelled', 'unverified'])
    ) as SQL,
    { status: 'cancelled' },
    tx
  );

  const vData1: CreateVerificationTokenInput = {
    ...pick(existingUser, ['first_name', 'last_name']),
    email: new_email,
    type: 'user_verification',
    user_id: existingUser.id,
    event: 'send_change_email_token'
  };

  await verificationTokenService.createAVerificationTokenForUser(vData1, tx);

  return omit(updatedUser, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at']);
};

export const cancelChangeEmailByUser = async (params: { email: string }, tx: DB) => {
  const emailParsed = emailSchema.safeParse(params.email);
  if (!emailParsed.success) {
    throw new CustomError(400, 'INVALID_INPUT', emailParsed.error.issues);
  }

  const existingUser = await tx.query.user.findFirst({
    where: eq(user.new_email, emailParsed.data)
  });

  if (!existingUser?.id) {
    throw new CustomError(404, 'USER_DOES_NOT_EXIST');
  }

  if (existingUser.status !== 'active') {
    throw new CustomError(400, `USER_IS_${existingUser.status.toUpperCase()}`);
  }

  const [updatedUser] = await tx
    .update(user)
    .set({ new_email: null })
    .where(eq(user.id, existingUser.id))
    .returning();

  const cancelledTokens = await verificationTokenService.updateVerificationTokens(
    and(
      eq(verificationToken.user_id, existingUser.id),
      eq(verificationToken.type, 'user_verification'),
      inArray(verificationToken.status, ['cancelled', 'unverified'])
    ) as SQL,
    { status: 'cancelled' },
    tx
  );

  if (!cancelledTokens || size(cancelledTokens) <= 0) {
    throw new CustomError(400, 'NO_CHANGE_EMAIL_REQUEST_IS_FOUND');
  }

  return omit(updatedUser, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at']);
};

export const verifyChangeEmailByUser = async (
  params: { user_id: string; token: string },
  tx: DB
) => {
  const parsed = verifyChangeEmailSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, 'VALIDATION_ERROR', parsed.error.issues);
  }

  const existingUser = await tx.query.user.findFirst({
    where: eq(user.id, params.user_id)
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_DOES_NOT_EXIST');
  }

  if (existingUser.status !== 'active') {
    throw new CustomError(400, `USER_IS_${existingUser.status.toUpperCase()}`);
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

  const [updatedUser] = await tx
    .update(user)
    .set({ email: existingUser.new_email, new_email: null })
    .where(eq(user.id, params.user_id))
    .returning();

  await notificationService.sendEmailNotification({
    event: 'send_email_changed',
    to_email: existingUser.new_email,
    variables: {
      email: existingUser.new_email,
      username: userHelper.getUsernameByNames(
        existingUser.new_email,
        existingUser.first_name,
        existingUser.last_name
      )
    }
  });

  return omit(updatedUser, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at']);
};

export const setUserEmailByAdmin = async (
  params: { user_id: string; new_email: string },
  tx: DB
) => {
  const emailParsed = emailSchema.safeParse(params.new_email);
  if (!emailParsed.success) {
    throw new CustomError(400, 'INVALID_INPUT', emailParsed.error.issues);
  }

  const existingUser = await tx.query.user.findFirst({
    where: eq(user.id, params.user_id)
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_DOES_NOT_EXIST');
  }

  const emailExists = await tx.query.user.findFirst({
    where: and(
      or(eq(user.email, emailParsed.data), eq(user.new_email, emailParsed.data)),
      not(eq(user.id, params.user_id))
    )
  });

  if (emailExists) {
    throw new CustomError(400, 'NEW_EMAIL_IS_ALREADY_ASSOCIATED_WITH_A_USER');
  }

  const [updatedUser] = await tx
    .update(user)
    .set({ email: emailParsed.data, new_email: null })
    .where(eq(user.id, params.user_id))
    .returning();

  await notificationService.sendEmailNotification({
    event: 'send_email_changed',
    to_email: emailParsed.data,
    variables: {
      email: emailParsed.data,
      username: userHelper.getUsernameByNames(
        emailParsed.data,
        existingUser.first_name,
        existingUser.last_name
      )
    }
  });

  return omit(updatedUser, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at']);
};

export const changePasswordByUser = async (
  params: { user_id: string; old_password: string; new_password: string },
  tx: DB
) => {
  const { old_password, new_password, user_id } = params || {};

  const parsed = changePasswordSchema.safeParse({
    old_password,
    new_password,
    user_id
  });
  if (!parsed.success) {
    throw new CustomError(400, 'INVALID_INPUT', parsed.error.issues);
  }

  if (new_password === old_password) {
    throw new CustomError(400, 'NEW_PASSWORD_IS_SAME_AS_OLD_PASSWORD');
  }

  const existingUser = await tx.query.user.findFirst({
    where: eq(user.id, params.user_id)
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_DOES_NOT_EXIST');
  }

  if (existingUser.status !== 'active') {
    throw new CustomError(400, `USER_IS_${existingUser.status.toUpperCase()}`);
  }

  if (!existingUser.password) {
    throw new CustomError(400, 'PASSWORD_DID_NOT_CONFORM_OUR_POLICY');
  }

  const isOldPasswordValid = await commonService.compareHashPassword(
    parsed.data.old_password,
    existingUser.password
  );
  if (!isOldPasswordValid) {
    throw new CustomError(400, 'OLD_PASSWORD_IS_INCORRECT');
  }

  const isOldPassword = await commonService.checkOldPasswords(
    parsed.data.new_password,
    existingUser.old_passwords ?? []
  );
  if (isOldPassword) {
    throw new CustomError(400, 'PASSWORD_IS_ALREADY_USED_BEFORE');
  }

  const hashedPassword = await commonService.generateHashPassword(parsed.data.new_password);

  const oldPasswords = [...(existingUser.old_passwords ?? []), existingUser.password]
    .filter(Boolean)
    .slice(-3);

  const [updatedUser] = await tx
    .update(user)
    .set({ password: hashedPassword, old_passwords: oldPasswords })
    .where(eq(user.id, params.user_id))
    .returning();

  await authTokenService.revokeAuthTokensForUser({ user_id: params.user_id }, tx);

  await notificationService.sendEmailNotification({
    event: 'send_password_changed',
    to_email: existingUser.email,
    variables: {
      email: existingUser.email,
      username: userHelper.getUsernameByNames(
        existingUser.email,
        existingUser.first_name,
        existingUser.last_name
      )
    }
  });

  return omit(updatedUser, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at']);
};

export const changePasswordByAdmin = async (
  params: { user_id: string; password: string },
  tx: DB
) => {
  const parsed = setUserPasswordByAdminSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, 'INVALID_INPUT', parsed.error.issues);
  }

  const existingUser = await tx.query.user.findFirst({
    where: eq(user.id, params.user_id)
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_DOES_NOT_EXIST');
  }

  const hashedPassword = await commonService.generateHashPassword(params.password);

  const oldPasswords = [...(existingUser.old_passwords ?? []), existingUser.password]
    .filter(Boolean)
    .slice(-3);

  const [updatedUser] = await tx
    .update(user)
    .set({ password: hashedPassword, old_passwords: oldPasswords })
    .where(eq(user.id, params.user_id))
    .returning();

  await authTokenService.revokeAuthTokensForUser({ user_id: params.user_id }, tx);

  await notificationService.sendEmailNotification({
    event: 'send_password_changed',
    to_email: existingUser.email,
    variables: {
      email: existingUser.email,
      username: userHelper.getUsernameByNames(
        existingUser.email,
        existingUser.first_name,
        existingUser.last_name
      )
    }
  });

  return omit(updatedUser, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at']);
};

export const forgotPassword = async (params: { email: string }, tx: DB) => {
  const parsed = forgotPasswordSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, 'INVALID_INPUT', parsed.error.issues);
  }

  const existingUser = await tx.query.user.findFirst({
    where: eq(user.email, parsed.data.email)
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_DOES_NOT_EXIST');
  }

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentTokens = await tx.query.verificationToken.findMany({
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
    ...pick(existingUser, ['email', 'first_name', 'last_name']),
    type: 'forgot_password',
    user_id: existingUser.id
  };

  const created = await verificationTokenService.createAVerificationTokenForUser(vData3, tx);

  return omit(created, ['created_at', 'token', 'expires_at', 'type', 'updated_at']);
};

export const retryForgotPassword = async (params: { email: string }, tx: DB) => {
  const parsed = forgotPasswordSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, 'INVALID_INPUT', parsed.error.issues);
  }

  const existingUser = await tx.query.user.findFirst({
    where: eq(user.email, parsed.data.email)
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_DOES_NOT_EXIST');
  }

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentTokens = await tx.query.verificationToken.findMany({
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
    ...pick(existingUser, ['email', 'first_name', 'last_name']),
    type: 'forgot_password',
    user_id: existingUser.id
  };

  const created = await verificationTokenService.createAVerificationTokenForUser(vData4, tx);

  return omit(created, ['created_at', 'token', 'expires_at', 'type', 'updated_at']);
};

export const verifyForgotPasswordCode = async (
  params: { email: string; token: string },
  tx: DB
) => {
  const parsed = verifyUserEmailSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, 'INVALID_INPUT', parsed.error.issues);
  }

  const { email, token } = parsed.data;

  const existingToken = await verificationTokenHelper.getAVerificationToken({
    tx,
    where: and(
      eq(verificationToken.email, email),
      eq(verificationToken.token, token),
      eq(verificationToken.type, 'forgot_password'),
      eq(verificationToken.status, 'unverified')
    ) as SQL
  });

  if (!existingToken) {
    throw new CustomError(400, 'OTP_IS_NOT_VALID');
  }

  if (new Date(existingToken.expires_at) < new Date()) {
    throw new CustomError(400, 'OTP_IS_EXPIRED');
  }

  return { message: 'OTP_IS_VALID', success: true };
};

export const verifyForgotPassword = async (
  params: { email: string; password: string; token: string },
  tx: DB
) => {
  const parsed = verifyForgotPasswordSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, 'INVALID_INPUT', parsed.error.issues);
  }

  const { email, password, token } = params || {};

  if (!commonHelper.validatePassword(password)) {
    throw new CustomError(400, 'PASSWORD_DID_NOT_CONFORM_OUR_POLICY');
  }

  const existingUser = await tx.query.user.findFirst({
    where: eq(user.email, email)
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_DOES_NOT_EXIST');
  }

  await verificationTokenService.validateVerificationTokenForUser(
    {
      email,
      token,
      type: 'forgot_password'
    },
    tx
  );

  const isCurrentPassword = await commonService.compareHashPassword(
    parsed.data.password,
    existingUser.password ?? ''
  );

  const isOldPassword = await commonService.checkOldPasswords(
    parsed.data.password,
    existingUser.old_passwords ?? []
  );

  if (isCurrentPassword || isOldPassword) {
    throw new CustomError(400, 'PASSWORD_IS_ALREADY_USED_BEFORE');
  }

  const hashedPassword = await commonService.generateHashPassword(parsed.data.password);

  const oldPasswords = [...(existingUser.old_passwords ?? []), existingUser.password ?? '']
    .filter(Boolean)
    .slice(-3);

  const [updatedUser] = await tx
    .update(user)
    .set({ password: hashedPassword, old_passwords: oldPasswords })
    .where(eq(user.id, existingUser.id))
    .returning();

  await authTokenService.revokeAuthTokensForUser({ user_id: existingUser.id }, tx);

  await notificationService.sendEmailNotification({
    event: 'send_password_changed',
    to_email: existingUser.email,
    variables: {
      email: existingUser.email,
      username: userHelper.getUsernameByNames(
        existingUser.email,
        existingUser.first_name,
        existingUser.last_name
      )
    }
  });

  return omit(updatedUser, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at']);
};

export const verifyUserPassword = async (params: { user_id: string; password: string }, tx: DB) => {
  const { password, user_id } = params || {};

  const parsed = verifyUserPasswordSchema.safeParse({ password, user_id });
  if (!parsed.success) {
    throw new CustomError(400, 'INVALID_INPUT', parsed.error.issues);
  }

  const existingUser = await tx.query.user.findFirst({
    where: eq(user.id, params.user_id)
  });

  if (!existingUser?.id) {
    throw new CustomError(404, 'USER_DOES_NOT_EXIST');
  }

  if (existingUser.status !== 'active') {
    throw new CustomError(400, `USER_IS_${existingUser.status.toUpperCase()}`);
  }

  const isValid = await commonService.compareHashPassword(params.password, existingUser.password);

  if (!isValid) {
    return { message: 'PASSWORD_IS_INCORRECT', success: false };
  }

  return { message: 'PASSWORD_IS_CORRECT', success: true };
};

export const refreshTokensForUser = async (
  params: { access_token?: string; refresh_token: string },
  tx: DB
) => {
  const parsed = refreshTokenSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, 'VALIDATION_ERROR', parsed.error.issues);
  }

  const refreshVerification = commonService.verifyJWTToken(parsed.data.refresh_token);
  if (!refreshVerification.success) {
    throw new CustomError(400, 'INVALID_REFRESH_TOKEN');
  }

  const refreshPayload = refreshVerification.payload as { user_id?: string } | undefined;

  if (!refreshPayload?.user_id) {
    throw new CustomError(400, 'INVALID_TOKEN_PAYLOAD');
  }

  const existingUser = await tx.query.user.findFirst({
    where: eq(user.id, refreshPayload.user_id),
    with: {
      role_users: {
        with: {
          role: true
        }
      }
    }
  });

  if (!existingUser) {
    throw new CustomError(404, 'USER_DOES_NOT_EXIST');
  }

  if (existingUser.status !== 'active') {
    throw new CustomError(400, `USER_IS_${existingUser.status.toUpperCase()}`);
  }

  const roles = existingUser.role_users.map((ru) => ru.role?.name ?? '').filter(Boolean);
  if (roles.length <= 0) {
    throw new CustomError(400, 'USER_HAS_NO_ROLE');
  }

  const tokens = await authTokenService.refreshAuthTokensForUser(
    {
      refresh_token: parsed.data.refresh_token,
      roles,
      user_id: refreshPayload.user_id
    },
    tx
  );

  return tokens;
};

export const verifyTokenForUser = async (
  params: { token: string; type: 'access_token' | 'refresh_token' },
  tx: DB
) => {
  const result = await authTokenService.verifyAnAuthTokenForUser(params, tx);

  return result;
};
