import z from 'zod';

import { createRolePermissionSchema } from '@/src/modules/role-permission/role-permission.type';

import { apiUuidOrArrayParam, apiUuidSchema } from '@/docs/schemas/common';
import { apiUpdateRolePermissionBodySchema as rolePermissionUpdateBodySchema } from '@/docs/schemas/entities';

export const apiCreateRolePermissionSchema = createRolePermissionSchema.openapi(
  'CreateRolePermissionRequest'
);
export const apiUpdateRolePermissionBodySchema = rolePermissionUpdateBodySchema.openapi(
  'UpdateRolePermissionRequest'
);

export const apiGetRolePermissionsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
    offset: z.coerce.number().int().min(0).default(0).optional(),
    role_id: apiUuidSchema.optional(),
    permission_id: apiUuidSchema.optional(),
    can_do_the_action: z.coerce.boolean().optional(),
    exclude_entity_ids: apiUuidOrArrayParam,
    include_entity_ids: apiUuidOrArrayParam
  })
  .openapi('GetRolePermissionsQuery');
