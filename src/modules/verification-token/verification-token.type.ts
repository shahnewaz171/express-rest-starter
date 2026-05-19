export type VerificationTokenType = 'forgot_password' | 'user_verification';
export type VerificationTokenStatus = 'cancelled' | 'verified' | 'unverified';

export interface CreateVerificationTokenInput {
  email: string;
  first_name?: string;
  last_name?: string;
  type: VerificationTokenType;
  user_id: string;
  event?: string;
}

export interface ValidateVerificationTokenInput {
  email?: string;
  token: string;
  type: VerificationTokenType;
  user_id?: string;
}
