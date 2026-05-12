import { eq, ilike, or, type SQL, sql } from 'drizzle-orm';

import { CustomError } from '@/src/utils/error';

import { authTemplate } from '@/src/modules/auth-template/auth-template.schema';
import type { AuthTemplateQueryParams } from '@/src/modules/auth-template/auth-template.type';
import { getOptionsFromQuery } from '@/src/modules/common/common.helper';
import type { QueryOptions } from '@/src/modules/common/common.type';

import { db } from '@/src/db';

export const countAuthTemplates = async (where?: SQL) => {
  const result = await db.select({ count: sql<number>`count(*)` }).from(authTemplate).where(where);

  return Number(result[0]?.count ?? 0);
};

export const getAnAuthTemplate = async (options: { where?: SQL }) => {
  const result = await db.select().from(authTemplate).where(options.where).limit(1);

  return result[0] ?? null;
};

export const getAuthTemplates = async (options: {
  where?: SQL;
  limit?: number;
  offset?: number;
  order?: [string, string][];
}) => {
  const { where, limit = 50, offset = 0 } = options;

  const result = await db
    .select()
    .from(authTemplate)
    .where(where)
    .limit(limit)
    .offset(offset)
    .orderBy(authTemplate.created_at);

  return result;
};

export const prepareAuthTemplateQuery = (params: AuthTemplateQueryParams) => {
  const conditions: SQL[] = [];

  if (params.entity_id) {
    conditions.push(eq(authTemplate.id, params.entity_id));
  }

  if (params.event) {
    conditions.push(eq(authTemplate.event, params.event));
  }

  if (params.subject) {
    conditions.push(eq(authTemplate.subject, params.subject));
  }

  if (params.search_keyword) {
    const pattern = `%${params.search_keyword}%`;
    const orCondition = or(
      ilike(authTemplate.body, pattern),
      ilike(authTemplate.event, pattern),
      ilike(authTemplate.subject, pattern)
    );

    if (orCondition) {
      conditions.push(orCondition);
    }
  }

  return conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;
};

export const getAnAuthTemplateForQuery = async (params: AuthTemplateQueryParams) => {
  const where = prepareAuthTemplateQuery(params);
  const template = await getAnAuthTemplate(where === undefined ? {} : { where });

  if (!template) {
    throw new CustomError(404, 'AUTH_TEMPLATE_NOT_FOUND');
  }

  return template;
};

export const getAuthTemplatesForQuery = async (params: AuthTemplateQueryParams & QueryOptions) => {
  const { limit, offset } = getOptionsFromQuery(params);
  const where = prepareAuthTemplateQuery(params);

  const [data, totalRows] = await Promise.all([
    getAuthTemplates(where === undefined ? { limit, offset } : { where, limit, offset }),
    countAuthTemplates(where)
  ]);

  return {
    data,
    meta_data: {
      filtered_rows: data.length,
      total_rows: totalRows
    }
  };
};
