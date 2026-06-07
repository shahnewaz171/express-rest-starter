import z from 'zod';

import { createRoleUserSchema } from '@/src/modules/role-user/role-user.type';

import { apiUuidOrArrayParam, apiUuidSchema } from '@/docs/schemas/common';
import { apiUpdateRoleUserBodySchema as roleUserUpdateBodySchema } from '@/docs/schemas/entities';

export const apiCreateRoleUserSchema = createRoleUserSchema.openapi('CreateRoleUserRequest');
export const apiUpdateRoleUserBodySchema =
  roleUserUpdateBodySchema.openapi('UpdateRoleUserRequest');

export const apiGetRoleUsersQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
    offset: z.coerce.number().int().min(0).default(0).optional(),
    role_id: apiUuidSchema.optional(),
    user_id: apiUuidSchema.optional(),
    exclude_entity_ids: apiUuidOrArrayParam,
    include_entity_ids: apiUuidOrArrayParam
  })
  .openapi('GetRoleUsersQuery');
