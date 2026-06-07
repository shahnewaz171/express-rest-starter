import z from 'zod';

import { roleNameEnum } from '@/src/modules/role/role.schema';
import { createRoleSchema } from '@/src/modules/role/role.type';

import { apiUuidOrArrayParam } from '@/docs/schemas/common';
import { apiUpdateRoleUserBodySchema } from '@/docs/schemas/entities';

export const apiCreateRoleSchema = createRoleSchema.openapi('CreateRoleRequest');
export const apiUpdateRoleBodySchema = apiUpdateRoleUserBodySchema.openapi('UpdateRoleRequest');

export const apiGetRolesQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
    offset: z.coerce.number().int().min(0).default(0).optional(),
    names: z
      .union([z.enum(roleNameEnum.enumValues), z.array(z.enum(roleNameEnum.enumValues))])
      .optional(),
    exclude_entity_ids: apiUuidOrArrayParam,
    include_entity_ids: apiUuidOrArrayParam
  })
  .openapi('GetRolesQuery');
