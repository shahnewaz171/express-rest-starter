import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { bearerSecurity, errorResponses } from '@/docs/helpers/common';
import { apiEntityIdParamsSchema } from '@/docs/schemas/common';
import { apiRolePermissionSchema } from '@/docs/schemas/entities';
import {
  apiCreateRolePermissionSchema,
  apiGetRolePermissionsQuerySchema,
  apiUpdateRolePermissionBodySchema
} from '@/docs/schemas/requests/role-permission';
import { apiPaginatedResponseSchema, apiSuccessResponseSchema } from '@/docs/schemas/responses';

const rolePermissionSuccessSchema = apiSuccessResponseSchema(
  apiRolePermissionSchema,
  'RolePermissionSuccess'
);
const rolePermissionsPaginatedSchema = apiPaginatedResponseSchema(
  apiRolePermissionSchema,
  'RolePermissionsPaginated'
);

export const registerRolePermissionRoutes = (registry: OpenAPIRegistry) => {
  registry.registerPath({
    method: 'post',
    path: '/role-permissions',
    tags: ['Role Permissions'],
    summary: 'Create a role permission',
    security: bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': { schema: apiCreateRolePermissionSchema }
        }
      }
    },
    responses: {
      201: {
        description: 'Role permission created',
        content: { 'application/json': { schema: rolePermissionSuccessSchema } }
      },
      400: errorResponses.badRequest,
      401: errorResponses.unauthorized
    }
  });

  registry.registerPath({
    method: 'get',
    path: '/role-permissions',
    tags: ['Role Permissions'],
    summary: 'Get all role permissions',
    security: bearerSecurity,
    request: {
      query: apiGetRolePermissionsQuerySchema
    },
    responses: {
      200: {
        description: 'Role permissions list',
        content: { 'application/json': { schema: rolePermissionsPaginatedSchema } }
      },
      401: errorResponses.unauthorized
    }
  });

  registry.registerPath({
    method: 'get',
    path: '/role-permissions/{entity_id}',
    tags: ['Role Permissions'],
    summary: 'Get a role permission by ID',
    security: bearerSecurity,
    request: {
      params: apiEntityIdParamsSchema
    },
    responses: {
      200: {
        description: 'Role permission found',
        content: { 'application/json': { schema: rolePermissionSuccessSchema } }
      },
      401: errorResponses.unauthorized,
      404: errorResponses.notFound
    }
  });

  registry.registerPath({
    method: 'put',
    path: '/role-permissions/{entity_id}',
    tags: ['Role Permissions'],
    summary: 'Update a role permission',
    security: bearerSecurity,
    request: {
      params: apiEntityIdParamsSchema,
      body: {
        content: {
          'application/json': { schema: apiUpdateRolePermissionBodySchema }
        }
      }
    },
    responses: {
      200: {
        description: 'Role permission updated',
        content: { 'application/json': { schema: rolePermissionSuccessSchema } }
      },
      400: errorResponses.badRequest,
      401: errorResponses.unauthorized,
      404: errorResponses.notFound
    }
  });

  registry.registerPath({
    method: 'delete',
    path: '/role-permissions/{entity_id}',
    tags: ['Role Permissions'],
    summary: 'Delete a role permission',
    security: bearerSecurity,
    request: {
      params: apiEntityIdParamsSchema
    },
    responses: {
      200: {
        description: 'Role permission deleted',
        content: { 'application/json': { schema: rolePermissionSuccessSchema } }
      },
      401: errorResponses.unauthorized,
      404: errorResponses.notFound
    }
  });
};
