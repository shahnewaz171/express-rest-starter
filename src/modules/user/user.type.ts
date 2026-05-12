import type { Request } from 'express';

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
  status: 'active' | 'inactive' | 'invited' | 'unverified';
  image: string | null;
  last_login_at: Date | null;
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
        permissions: Record<string, { action: string; can_do_the_action: boolean }[]>;
        user_id: string;
      }
    | null
    | undefined;
}
