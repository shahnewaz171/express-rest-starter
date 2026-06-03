import type { Request } from 'express';

import type { userStatusEnum } from '@/src/modules/user/user.schema';

export type UserStatus = (typeof userStatusEnum.enumValues)[number];

export interface RegisterUserInput {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface UserQueryParams {
  email?: string;
  search_keyword?: string;
  status?: string;
  exclude_entity_ids?: string[];
  include_entity_ids?: string[];
}

export interface GetUsersParams {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  old_passwords: string[];
  new_email: string | null;
  status: UserStatus;
  image: string | null;
  last_login_at: Date | null;
}

export interface PermissionsOfARole {
  action: string;
  can_do_the_action: boolean;
}

export interface AuthRequest extends Request {
  user?:
    | {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        status: string;
        image: string | null;
        created_at: Date;
        updated_at: Date;
        last_login_at: Date | null;
        roles: string[];
        role: string | null;
        permissions: Record<string, PermissionsOfARole[]>;
        user_id: string;
      }
    | null
    | undefined;
}
