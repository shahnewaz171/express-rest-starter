import z from 'zod';

import { emailSchema, passwordSchema, uuidSchema } from '@/src/modules/common/common.validation';

export const registerSchema = z.object({
  email: emailSchema,
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  password: passwordSchema
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1)
});

export const verifyUserEmailSchema = z.object({
  email: emailSchema,
  token: z.string().min(6)
});

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const verifyForgotPasswordSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  token: z.string().min(1)
});

export const changeEmailSchema = z.object({
  new_email: emailSchema,
  user_id: uuidSchema
});

export const changePasswordSchema = z.object({
  old_password: z.string().min(1),
  new_password: passwordSchema
});

export const verifyChangeEmailSchema = z.object({
  token: z.string().min(6),
  user_id: z.string().min(1)
});

export const setUserPasswordByAdminSchema = z.object({
  password: passwordSchema,
  user_id: uuidSchema
});

export const verifyUserPasswordSchema = z.object({
  password: passwordSchema,
  user_id: z.string().min(1)
});
