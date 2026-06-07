import z from 'zod';

import {
  permissionActionsEnum,
  permissionModulesEnum
} from '@/src/modules/permission/permission.schema';
import { roleNameEnum } from '@/src/modules/role/role.schema';
import { userStatusEnum } from '@/src/modules/user/user.schema';

import { apiUuidSchema } from '@/docs/schemas/common';

export const apiUserSchema = z
  .object({
    id: z.uuid(),
    email: z.email(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    phone_number: z.string().nullable().optional(),
    status: z.enum(userStatusEnum.enumValues),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime()
  })
  .openapi('User');

export const apiRoleSchema = z
  .object({
    id: z.uuid(),
    name: z.enum(roleNameEnum.enumValues),
    created_by: z.uuid().nullable().optional(),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime()
  })
  .openapi('Role');

export const apiPermissionSchema = z
  .object({
    id: z.uuid(),
    action: z.enum(permissionActionsEnum.enumValues),
    module: z.enum(permissionModulesEnum.enumValues),
    created_by: z.uuid().nullable().optional(),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime()
  })
  .openapi('Permission');

export const apiRoleUserSchema = z
  .object({
    id: z.uuid(),
    role_id: z.uuid(),
    user_id: z.uuid(),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime()
  })
  .openapi('RoleUser');

export const apiRolePermissionSchema = z
  .object({
    id: z.uuid(),
    role_id: z.uuid(),
    permission_id: z.uuid(),
    can_do_the_action: z.boolean(),
    created_by: z.uuid().nullable().optional(),
    updated_by: z.uuid().nullable().optional(),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime()
  })
  .openapi('RolePermission');

export const apiAuthUserSchema = z
  .object({
    user_id: z.uuid(),
    email: z.email(),
    roles: z.array(z.string()).optional(),
    permissions: z.record(z.string(), z.array(z.unknown())).optional()
  })
  .openapi('AuthUser');

export const apiAuthTokensSchema = z
  .object({
    access_token: z.string(),
    refresh_token: z.string()
  })
  .openapi('AuthTokens');

export const apiUpdateRoleUserBodySchema = z.object({
  role_id: apiUuidSchema.optional(),
  user_id: apiUuidSchema.optional()
});

export const apiUpdateRolePermissionBodySchema = z.object({
  can_do_the_action: z.boolean()
});
