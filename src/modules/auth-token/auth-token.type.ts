export interface CreateAuthTokenInput {
  access_token: string;
  refresh_token?: string;
  user_id: string;
}

export interface VerifyTokenInput {
  token: string;
  type: 'access_token' | 'refresh_token';
}

export interface RefreshTokenInput {
  refresh_token: string;
  roles: string[];
  user_id: string;
}

export interface RevokeTokenInput {
  token: string;
  type: 'access_token' | 'refresh_token';
}
