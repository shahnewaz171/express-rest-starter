import type { SignOptions } from 'jsonwebtoken';

export interface QueryOptions {
  limit?: number;
  offset?: number;
  order?: string | [string, string][];
}

export interface ValidateUserPermissionParams {
  action: string;
  module: string;
  permissions?: Record<string, { action: string; can_do_the_action: boolean }[]>;
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
