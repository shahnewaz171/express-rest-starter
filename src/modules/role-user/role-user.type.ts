import z from 'zod';

import { uuidSchema } from '@/src/modules/common/common.validation';

export interface CreateRoleUserInput {
  role_id: string;
  user_id: string;
}

export interface UpdateRoleUserInput {
  role_id?: string;
  user_id?: string;
}

export interface RoleUserQueryParams {
  role_id?: string;
  user_id?: string;
  exclude_entity_ids?: string[];
  include_entity_ids?: string[];
}

// ZOD
export const createRoleUserSchema = z.object({
  role_id: uuidSchema,
  user_id: uuidSchema
});

export const updateRoleUserSchema = z.object({
  entity_id: uuidSchema,
  role_id: uuidSchema.optional(),
  user_id: uuidSchema.optional()
});
