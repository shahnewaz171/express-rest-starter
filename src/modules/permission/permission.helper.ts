import { and, eq, inArray, not, type SQL, sql } from 'drizzle-orm';

import { CustomError } from '@/src/utils/error';

import { permission } from '@/src/modules/permission/permission.schema';

import { db } from '@/src/db';

const toArray = (v: string | string[] | undefined): string[] => {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
};

export const countPermissions = async (where?: SQL) => {
  const result = await db.select({ count: sql<number>`count(*)` }).from(permission).where(where);

  return Number(result[0]?.count ?? 0);
};

export const getAPermission = async (where?: SQL) => db.query.permission.findFirst({ where });

export const getPermissions = async (options?: { where?: SQL; limit?: number; offset?: number }) =>
  db.query.permission.findMany({
    where: options?.where,
    limit: options?.limit,
    offset: options?.offset,
    orderBy: (permissions, { desc }) => [desc(permissions.created_at)]
  });

export const preparePermissionQuery = (params: {
  action?: string;
  module?: string;
  exclude_entity_ids?: string | string[];
  include_entity_ids?: string | string[];
}) => {
  const conditions: SQL[] = [];

  const excludeIds = toArray(params.exclude_entity_ids);
  if (excludeIds?.length > 0) {
    conditions.push(not(inArray(permission.id, excludeIds)));
  }

  const includeIds = toArray(params.include_entity_ids);
  if (includeIds?.length > 0) {
    conditions.push(inArray(permission.id, includeIds));
  }

  if (params.action) {
    conditions.push(eq(permission.action, params.action));
  }

  if (params.module) {
    conditions.push(eq(permission.module, params.module));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
};

export const getAPermissionForQuery = async (params: { entity_id: string }) => {
  const result = await db.query.permission.findFirst({
    where: eq(permission.id, params.entity_id),
    with: {
      role_permissions: {
        with: {
          role: true
        }
      }
    }
  });

  if (!result) {
    throw new CustomError(404, 'PERMISSION_DOES_NOT_EXIST');
  }

  return result;
};

export const getPermissionsForQuery = async (
  query: {
    action?: string;
    module?: string;
    exclude_entity_ids?: string | string[];
    include_entity_ids?: string | string[];
  },
  options: { limit?: number; offset?: number }
) => {
  const where = preparePermissionQuery(query);

  const [data, total_rows] = await Promise.all([
    db.query.permission.findMany({
      where,
      limit: options.limit,
      offset: options.offset,
      orderBy: (perms, { desc }) => [desc(perms.created_at)],
      with: {
        role_permissions: {
          with: {
            role: true
          }
        }
      }
    }),
    countPermissions(where)
  ]);

  return {
    data,
    meta_data: {
      filtered_rows: data.length,
      total_rows
    }
  };
};
