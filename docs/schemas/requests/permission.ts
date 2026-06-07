import z from 'zod';

import {
  permissionActionsEnum,
  permissionModulesEnum
} from '@/src/modules/permission/permission.schema';
import {
  createPermissionSchema,
  updatePermissionBodySchema
} from '@/src/modules/permission/permission.type';

import { apiUuidOrArrayParam } from '@/docs/schemas/common';

export const apiCreatePermissionSchema = createPermissionSchema.openapi('CreatePermissionRequest');
export const apiUpdatePermissionBodySchema =
  updatePermissionBodySchema.openapi('UpdatePermissionRequest');

export const apiGetPermissionsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
    offset: z.coerce.number().int().min(0).default(0).optional(),
    action: z.enum(permissionActionsEnum.enumValues).optional(),
    module: z.enum(permissionModulesEnum.enumValues).optional(),
    exclude_entity_ids: apiUuidOrArrayParam,
    include_entity_ids: apiUuidOrArrayParam
  })
  .openapi('GetPermissionsQuery');
