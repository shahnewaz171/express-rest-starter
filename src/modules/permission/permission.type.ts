import z from 'zod';

import { uuidSchema } from '@/src/modules/common/common.validation';
import {
  permissionActionsEnum,
  permissionModulesEnum
} from '@/src/modules/permission/permission.schema';

export type PermissionAction = (typeof permissionActionsEnum.enumValues)[number];
export type PermissionModule = (typeof permissionModulesEnum.enumValues)[number];

export interface PermissionInput {
  action: PermissionAction;
  module: PermissionModule;
}

export interface PermissionQueryParams extends Partial<PermissionInput> {
  exclude_entity_ids?: string[];
  include_entity_ids?: string[];
}

// ZOD
export const createPermissionSchema = z.object({
  action: z.enum(permissionActionsEnum.enumValues),
  module: z.enum(permissionModulesEnum.enumValues)
});

export const updatePermissionSchema = z.object({
  entity_id: uuidSchema,
  data: z.object({
    action: z.enum(permissionActionsEnum.enumValues).optional(),
    module: z.enum(permissionModulesEnum.enumValues).optional()
  })
});

export const deletePermissionSchema = z.object({
  entity_id: uuidSchema
});
