import { z } from 'zod';

export const emailSchema = z.string().email().toLowerCase();
export const passwordSchema = z
  .string()
  .min(8)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*(){}[\]])/,
    'Password must contain at least 1 lowercase, 1 uppercase, 1 number, and 1 special character'
  );
export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  order: z.string().optional()
});

export const entityQuerySchema = z.object({
  entity_id: uuidSchema
});

export const excludeIncludeSchema = z.object({
  exclude_entity_ids: z.array(uuidSchema).optional(),
  include_entity_ids: z.array(uuidSchema).optional()
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1)
});

export const registerSchema = z.object({
  email: emailSchema,
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  password: passwordSchema
});

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const verifyForgotPasswordSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  token: z.string().min(1)
});

export const changePasswordSchema = z.object({
  old_password: z.string().min(1),
  new_password: passwordSchema
});

export const refreshTokenSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1)
});
