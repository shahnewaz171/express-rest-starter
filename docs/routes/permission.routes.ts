import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { bearerSecurity, errorResponses } from '@/docs/helpers/common';
import { apiEntityIdParamsSchema } from '@/docs/schemas/common';
import { apiPermissionSchema } from '@/docs/schemas/entities';
import {
  apiCreatePermissionSchema,
  apiGetPermissionsQuerySchema,
  apiUpdatePermissionBodySchema
} from '@/docs/schemas/requests/permission';
import { apiPaginatedResponseSchema, apiSuccessResponseSchema } from '@/docs/schemas/responses';

const permissionSuccessSchema = apiSuccessResponseSchema(apiPermissionSchema, 'PermissionSuccess');
const permissionsPaginatedSchema = apiPaginatedResponseSchema(
  apiPermissionSchema,
  'PermissionsPaginated'
);

export const registerPermissionRoutes = (registry: OpenAPIRegistry) => {
  registry.registerPath({
    method: 'post',
    path: '/permissions',
    tags: ['Permissions'],
    summary: 'Create a new permission',
    security: bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': { schema: apiCreatePermissionSchema }
        }
      }
    },
    responses: {
      201: {
        description: 'Permission created',
        content: { 'application/json': { schema: permissionSuccessSchema } }
      },
      400: errorResponses.badRequest,
      401: errorResponses.unauthorized,
      409: errorResponses.conflict
    }
  });

  registry.registerPath({
    method: 'put',
    path: '/permissions/{entity_id}',
    tags: ['Permissions'],
    summary: 'Update a permission',
    security: bearerSecurity,
    request: {
      params: apiEntityIdParamsSchema,
      body: {
        content: {
          'application/json': { schema: apiUpdatePermissionBodySchema }
        }
      }
    },
    responses: {
      200: {
        description: 'Permission updated',
        content: { 'application/json': { schema: permissionSuccessSchema } }
      },
      400: errorResponses.badRequest,
      401: errorResponses.unauthorized,
      404: errorResponses.notFound
    }
  });

  registry.registerPath({
    method: 'delete',
    path: '/permissions/{entity_id}',
    tags: ['Permissions'],
    summary: 'Delete a permission',
    security: bearerSecurity,
    request: {
      params: apiEntityIdParamsSchema
    },
    responses: {
      200: {
        description: 'Permission deleted',
        content: { 'application/json': { schema: permissionSuccessSchema } }
      },
      401: errorResponses.unauthorized,
      404: errorResponses.notFound
    }
  });

  registry.registerPath({
    method: 'get',
    path: '/permissions',
    tags: ['Permissions'],
    summary: 'Get all permissions',
    security: bearerSecurity,
    request: {
      query: apiGetPermissionsQuerySchema
    },
    responses: {
      200: {
        description: 'Permissions list',
        content: { 'application/json': { schema: permissionsPaginatedSchema } }
      },
      401: errorResponses.unauthorized
    }
  });

  registry.registerPath({
    method: 'get',
    path: '/permissions/{entity_id}',
    tags: ['Permissions'],
    summary: 'Get a permission by ID',
    security: bearerSecurity,
    request: {
      params: apiEntityIdParamsSchema
    },
    responses: {
      200: {
        description: 'Permission found',
        content: { 'application/json': { schema: permissionSuccessSchema } }
      },
      401: errorResponses.unauthorized,
      404: errorResponses.notFound
    }
  });
};
