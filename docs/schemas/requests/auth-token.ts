import {
  refreshTokenSchema,
  revokeAnAuthTokenSchema
} from '@/src/modules/auth-token/auth-token.validation';

export const apiRevokeAuthTokenSchema = revokeAnAuthTokenSchema.openapi('RevokeAuthToken');
export const apiRefreshTokenSchema = refreshTokenSchema.openapi('RefreshTokenRequest');
