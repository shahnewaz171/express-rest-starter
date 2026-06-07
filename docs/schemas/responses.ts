import z from 'zod';

export const apiZodCustomErrorSchema = z
  .object({
    field: z.string(),
    code: z.string(),
    message: z.string()
  })
  .openapi('ZodCustomError');

export const apiErrorResponseSchema = z
  .object({
    message: z.string(),
    errors: z.array(apiZodCustomErrorSchema).optional()
  })
  .openapi('ApiErrorResponse');

export const apiPaginationMetaSchema = z
  .object({
    filtered_rows: z.number(),
    total_rows: z.number()
  })
  .openapi('PaginationMeta');

export const apiSuccessResponseSchema = <T extends z.ZodType>(dataSchema: T, refId: string) =>
  z
    .object({
      data: dataSchema,
      message: z.string().optional()
    })
    .openapi(refId);

export const apiPaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T, refId: string) =>
  z
    .object({
      data: z.array(itemSchema),
      meta_data: apiPaginationMetaSchema,
      message: z.string().optional()
    })
    .openapi(refId);

export const apiMessageOnlySuccessSchema = z
  .object({
    message: z.string().optional()
  })
  .openapi('MessageOnlySuccess');
