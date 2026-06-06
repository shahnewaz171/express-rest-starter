import z from 'zod';

import { uuidSchema } from '@/src/modules/common/common.validation';

export interface CreateRolePermissionInput {
  role_id: string;
  permission_id: string;
  can_do_the_action?: boolean;
}

export interface UpdateRolePermissionInput {
  can_do_the_action?: boolean;
}

export interface RolePermissionQueryParams {
  role_id?: string;
  permission_id?: string;
  can_do_the_action?: boolean;
  exclude_entity_ids?: string[];
  include_entity_ids?: string[];
}

// ZOD
export const createRolePermissionSchema = z.object({
  role_id: uuidSchema,
  permission_id: uuidSchema,
  can_do_the_action: z.boolean().optional()
});

export const updateRolePermissionSchema = z.object({
  entity_id: uuidSchema,
  can_do_the_action: z.boolean()
});
