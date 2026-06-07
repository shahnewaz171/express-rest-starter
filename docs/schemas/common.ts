import z from 'zod';

import {
  emailSchema,
  excludeIncludeSchema,
  paginationSchema,
  passwordSchema,
  uuidSchema
} from '@/src/modules/common/common.validation';

export const apiEmailSchema = emailSchema.openapi('Email');
export const apiPasswordSchema = passwordSchema.openapi('Password');
export const apiUuidSchema = uuidSchema.openapi('UUID');

export const apiPaginationSchema = paginationSchema.openapi('Pagination');

export const apiEntityQuerySchema = z
  .object({
    entity_id: apiUuidSchema
  })
  .openapi('EntityQuery');

export const apiEntityIdParamsSchema = z
  .object({
    entity_id: apiUuidSchema
  })
  .openapi('EntityIdParams');

export const apiExcludeIncludeSchema = excludeIncludeSchema.openapi('ExcludeInclude');

export const apiUuidOrArrayParam = z
  .union([apiUuidSchema, z.array(apiUuidSchema)])
  .optional()
  .openapi('UuidOrArrayParam');
