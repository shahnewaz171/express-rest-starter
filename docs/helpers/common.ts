import type { ResponseConfig } from '@asteasolutions/zod-to-openapi';

import { apiErrorResponseSchema } from '@/docs/schemas/responses';

export const bearerSecurity: Array<{ bearerAuth: string[] }> = [{ bearerAuth: [] }];

export const errorResponse = (description: string): ResponseConfig => ({
  description,
  content: {
    'application/json': {
      schema: apiErrorResponseSchema
    }
  }
});

export const errorResponses = {
  badRequest: errorResponse('Validation error'),
  unauthorized: errorResponse('Unauthorized'),
  forbidden: errorResponse('Forbidden'),
  notFound: errorResponse('Resource not found'),
  conflict: errorResponse('Conflict')
};
