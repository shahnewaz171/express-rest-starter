import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { bearerSecurity, errorResponses } from '@/docs/helpers/common';
import { apiEntityIdParamsSchema } from '@/docs/schemas/common';
import { apiRoleUserSchema } from '@/docs/schemas/entities';
import {
  apiCreateRoleUserSchema,
  apiGetRoleUsersQuerySchema,
  apiUpdateRoleUserBodySchema
} from '@/docs/schemas/requests/role-user';
import { apiPaginatedResponseSchema, apiSuccessResponseSchema } from '@/docs/schemas/responses';

const roleUserSuccessSchema = apiSuccessResponseSchema(apiRoleUserSchema, 'RoleUserSuccess');
const roleUsersPaginatedSchema = apiPaginatedResponseSchema(
  apiRoleUserSchema,
  'RoleUsersPaginated'
);

export const registerRoleUserRoutes = (registry: OpenAPIRegistry) => {
  registry.registerPath({
    method: 'post',
    path: '/role-users',
    tags: ['Role Users'],
    summary: 'Assign a role to a user',
    security: bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': { schema: apiCreateRoleUserSchema }
        }
      }
    },
    responses: {
      201: {
        description: 'Role-user assignment created',
        content: { 'application/json': { schema: roleUserSuccessSchema } }
      },
      400: errorResponses.badRequest,
      401: errorResponses.unauthorized
    }
  });

  registry.registerPath({
    method: 'get',
    path: '/role-users',
    tags: ['Role Users'],
    summary: 'Get all role-user assignments',
    security: bearerSecurity,
    request: {
      query: apiGetRoleUsersQuerySchema
    },
    responses: {
      200: {
        description: 'Role-user assignments list',
        content: { 'application/json': { schema: roleUsersPaginatedSchema } }
      },
      401: errorResponses.unauthorized
    }
  });

  registry.registerPath({
    method: 'get',
    path: '/role-users/{entity_id}',
    tags: ['Role Users'],
    summary: 'Get a role-user assignment by ID',
    security: bearerSecurity,
    request: {
      params: apiEntityIdParamsSchema
    },
    responses: {
      200: {
        description: 'Role-user assignment found',
        content: { 'application/json': { schema: roleUserSuccessSchema } }
      },
      401: errorResponses.unauthorized,
      404: errorResponses.notFound
    }
  });

  registry.registerPath({
    method: 'put',
    path: '/role-users/{entity_id}',
    tags: ['Role Users'],
    summary: 'Update a role-user assignment',
    security: bearerSecurity,
    request: {
      params: apiEntityIdParamsSchema,
      body: {
        content: {
          'application/json': { schema: apiUpdateRoleUserBodySchema }
        }
      }
    },
    responses: {
      200: {
        description: 'Role-user assignment updated',
        content: { 'application/json': { schema: roleUserSuccessSchema } }
      },
      400: errorResponses.badRequest,
      401: errorResponses.unauthorized,
      404: errorResponses.notFound
    }
  });

  registry.registerPath({
    method: 'delete',
    path: '/role-users/{entity_id}',
    tags: ['Role Users'],
    summary: 'Delete a role-user assignment',
    security: bearerSecurity,
    request: {
      params: apiEntityIdParamsSchema
    },
    responses: {
      200: {
        description: 'Role-user assignment deleted',
        content: { 'application/json': { schema: roleUserSuccessSchema } }
      },
      401: errorResponses.unauthorized,
      404: errorResponses.notFound
    }
  });
};
