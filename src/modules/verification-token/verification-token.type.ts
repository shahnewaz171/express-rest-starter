import type {
  verificationTokenStatusEnum,
  verificationTokenTypeEnum
} from '@/src/modules/verification-token/verification-token.schema';

export type VerificationTokenStatus = (typeof verificationTokenStatusEnum.enumValues)[number];
export type VerificationTokenType = (typeof verificationTokenTypeEnum.enumValues)[number];

export interface CreateVerificationTokenInput {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
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
