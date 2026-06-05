import type { SignOptions } from 'jsonwebtoken';

import type { PermissionsOfARole } from '@/src/modules/user/user.type';

export interface QueryOptions {
  limit?: number;
  offset?: number;
  order?: string | [string, string][];
}

export interface ValidateUserPermissionParams {
  action: string;
  module: string;
  permissions?: Record<string, PermissionsOfARole[]>;
}

export interface JWTPayload {
  sub?: string;
  aud?: string;
  jti?: string;
  roles?: string[];
  user_id?: string;
  [key: string]: unknown;
}

export type GenerateJWTOptions = {
  payload?: JWTPayload;
  expiresIn?: SignOptions['expiresIn'];
};

export interface PaginationMeta {
  filtered_rows: number;
  total_rows: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta_data: PaginationMeta;
}

export interface ZodCustomError {
  message: string;
  code: string;
  path: string[];
}

export interface ApiErrorResponse {
  statusCode?: number;
  message: string;
  errors?: ZodCustomError[];
  traceId?: string; // useful for debugging in production
}
