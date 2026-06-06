import z from 'zod';

import { uuidSchema } from '@/src/modules/common/common.validation';
import { roleNameEnum } from '@/src/modules/role/role.schema';

export type RoleName = (typeof roleNameEnum.enumValues)[number];

export interface CreateRoleInput {
  name: RoleName;
}

export interface UpdateRoleInput {
  name?: RoleName;
}

export interface RoleQueryParams {
  exclude_entity_ids?: string[];
  include_entity_ids?: string[];
  names?: RoleName[];
}

// ZOD
export const createRoleSchema = z.object({
  name: z.enum(roleNameEnum.enumValues)
});

export const updateRoleSchema = z.object({
  entity_id: uuidSchema,
  data: z.object({
    name: z.enum(roleNameEnum.enumValues).optional()
  })
});

export const deleteRoleSchema = z.object({
  entity_id: uuidSchema
});
