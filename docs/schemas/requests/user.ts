import z from 'zod';

import { userStatusEnum } from '@/src/modules/user/user.schema';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  setUserPasswordByAdminSchema,
  verifyForgotPasswordSchema,
  verifyUserEmailSchema
} from '@/src/modules/user/user.validation';

import {
  apiEmailSchema,
  apiPasswordSchema,
  apiUuidOrArrayParam,
  apiUuidSchema
} from '@/docs/schemas/common';

export const apiRegisterSchema = registerSchema.openapi('RegisterRequest');
export const apiLoginSchema = loginSchema.openapi('LoginRequest');
export const apiVerifyUserEmailSchema = verifyUserEmailSchema.openapi('VerifyUserEmailRequest');
export const apiForgotPasswordSchema = forgotPasswordSchema.openapi('ForgotPasswordRequest');
export const apiVerifyForgotPasswordSchema = verifyForgotPasswordSchema.openapi(
  'VerifyForgotPasswordRequest'
);

export const apiChangeEmailRequestSchema = z
  .object({
    email: apiEmailSchema
  })
  .openapi('ChangeEmailRequest');

export const apiCancelChangeEmailRequestSchema = z
  .object({
    email: apiEmailSchema
  })
  .openapi('CancelChangeEmailRequest');

export const apiChangePasswordRequestSchema = z
  .object({
    old_password: z.string().min(1),
    new_password: apiPasswordSchema
  })
  .openapi('ChangePasswordRequest');

export const apiVerifyChangeEmailRequestSchema = z
  .object({
    token: z.string().min(6)
  })
  .openapi('VerifyChangeEmailRequest');

export const apiSetUserEmailRequestSchema = z
  .object({
    new_email: apiEmailSchema,
    user_id: apiUuidSchema
  })
  .openapi('SetUserEmailRequest');

export const apiSetUserPasswordByAdminSchema = setUserPasswordByAdminSchema.openapi(
  'SetUserPasswordByAdminRequest'
);

export const apiVerifyUserPasswordRequestSchema = z
  .object({
    password: apiPasswordSchema
  })
  .openapi('VerifyUserPasswordRequest');

export const apiResendVerificationEmailRequestSchema = z
  .object({
    email: apiEmailSchema
  })
  .openapi('ResendVerificationEmailRequest');

export const apiGetUsersQuerySchema = z
  .object({
    email: apiEmailSchema.optional(),
    search_keyword: z.string().trim().min(1).optional(),
    status: z.enum(userStatusEnum.enumValues).optional(),
    exclude_entity_ids: apiUuidOrArrayParam,
    include_entity_ids: apiUuidOrArrayParam,
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0)
  })
  .openapi('GetUsersQuery');
