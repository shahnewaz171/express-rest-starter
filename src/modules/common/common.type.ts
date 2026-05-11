import type { SignOptions } from 'jsonwebtoken';

export interface QueryOptions {
  limit?: string;
  offset?: string;
  order?: string;
}

export interface ValidateUserPermissionParams {
  action: string;
  module: string;
  permissions?: Record<string, { action: string; can_do_the_action: boolean }[]>;
}

// JWT Authentication
export interface JWTPayload {
  sub?: string;
  aud?: string;
  jti?: string;
  [key: string]: unknown;
}

export type GenerateJWTOptions = {
  payload?: JWTPayload;
  expiresIn?: SignOptions['expiresIn'];
};
