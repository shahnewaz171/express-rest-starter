import z from 'zod';

import { emailSchema, passwordSchema, uuidSchema } from '@/src/modules/common/common.validation';
import { userStatusEnum } from '@/src/modules/user/user.schema';

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
  new_password: passwordSchema,
  user_id: uuidSchema
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

const idArrayParam = z
  .union([uuidSchema, z.array(uuidSchema)])
  .transform((val) => (Array.isArray(val) ? val : [val]))
  .optional();

export const getUsersQuerySchema = z.object({
  email: emailSchema.optional(),
  search_keyword: z.string().trim().min(1).optional(),
  status: z.enum(userStatusEnum.enumValues).optional(),
  exclude_entity_ids: idArrayParam,
  include_entity_ids: idArrayParam,
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
