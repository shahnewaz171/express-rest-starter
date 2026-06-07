import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { bearerSecurity, errorResponses } from '@/docs/helpers/common';
import { apiEntityIdParamsSchema } from '@/docs/schemas/common';
import { apiRoleSchema } from '@/docs/schemas/entities';
import {
  apiCreateRoleSchema,
  apiGetRolesQuerySchema,
  apiUpdateRoleBodySchema
} from '@/docs/schemas/requests/role';
import { apiPaginatedResponseSchema, apiSuccessResponseSchema } from '@/docs/schemas/responses';

const roleSuccessSchema = apiSuccessResponseSchema(apiRoleSchema, 'RoleSuccess');
const rolesPaginatedSchema = apiPaginatedResponseSchema(apiRoleSchema, 'RolesPaginated');

export const registerRoleRoutes = (registry: OpenAPIRegistry) => {
  registry.registerPath({
    method: 'post',
    path: '/roles',
    tags: ['Roles'],
    summary: 'Create a new role',
    security: bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': { schema: apiCreateRoleSchema }
        }
      }
    },
    responses: {
      201: {
        description: 'Role created',
        content: { 'application/json': { schema: roleSuccessSchema } }
      },
      400: errorResponses.badRequest,
      401: errorResponses.unauthorized,
      409: errorResponses.conflict
    }
  });

  registry.registerPath({
    method: 'put',
    path: '/roles/{entity_id}',
    tags: ['Roles'],
    summary: 'Update a role',
    security: bearerSecurity,
    request: {
      params: apiEntityIdParamsSchema,
      body: {
        content: {
          'application/json': { schema: apiUpdateRoleBodySchema }
        }
      }
    },
    responses: {
      200: {
        description: 'Role updated',
        content: { 'application/json': { schema: roleSuccessSchema } }
      },
      400: errorResponses.badRequest,
      401: errorResponses.unauthorized,
      404: errorResponses.notFound
    }
  });

  registry.registerPath({
    method: 'delete',
    path: '/roles/{entity_id}',
    tags: ['Roles'],
    summary: 'Delete a role',
    security: bearerSecurity,
    request: {
      params: apiEntityIdParamsSchema
    },
    responses: {
      200: {
        description: 'Role deleted',
        content: { 'application/json': { schema: roleSuccessSchema } }
      },
      401: errorResponses.unauthorized,
      404: errorResponses.notFound
    }
  });

  registry.registerPath({
    method: 'get',
    path: '/roles',
    tags: ['Roles'],
    summary: 'Get all roles',
    security: bearerSecurity,
    request: {
      query: apiGetRolesQuerySchema
    },
    responses: {
      200: {
        description: 'Roles list',
        content: { 'application/json': { schema: rolesPaginatedSchema } }
      },
      401: errorResponses.unauthorized
    }
  });

  registry.registerPath({
    method: 'get',
    path: '/roles/{entity_id}',
    tags: ['Roles'],
    summary: 'Get a role by ID',
    security: bearerSecurity,
    request: {
      params: apiEntityIdParamsSchema
    },
    responses: {
      200: {
        description: 'Role found',
        content: { 'application/json': { schema: roleSuccessSchema } }
      },
      401: errorResponses.unauthorized,
      404: errorResponses.notFound
    }
  });
};
