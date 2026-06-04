import z from 'zod';

export const revokeAnAuthTokenSchema = z.object({
  token: z.string().min(1),
  type: z.enum(['access_token', 'refresh_token'])
});

export const refreshTokenSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1)
});
