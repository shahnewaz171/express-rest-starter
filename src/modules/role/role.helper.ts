import { and, eq, inArray, not, type SQL, sql } from 'drizzle-orm';
import head from 'lodash/head';
import intersection from 'lodash/intersection';

import { role, roleNameEnum } from '@/src/modules/role/role.schema';
import type { RoleName } from '@/src/modules/role/role.type';

import { db } from '@/src/db';

const toArray = (v: string | string[] | undefined): string[] => {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
};

export const countRoles = async (where?: SQL) => {
  const result = await db.select({ count: sql<number>`count(*)` }).from(role).where(where);

  return Number(result[0]?.count ?? 0);
};

export const getARole = async (where?: SQL) => db.query.role.findFirst({ where });

export const getRoles = async (options?: { where?: SQL; limit?: number; offset?: number }) =>
  db.query.role.findMany({
    where: options?.where,
    limit: options?.limit,
    offset: options?.offset,
    orderBy: (roles, { desc }) => [desc(roles.created_at)]
  });

export const prepareRoleQuery = (params: {
  exclude_entity_ids?: string | string[];
  include_entity_ids?: string | string[];
  names?: RoleName | RoleName[];
}) => {
  const conditions: SQL[] = [];

  const excludeIds = toArray(params.exclude_entity_ids);
  if (excludeIds?.length > 0) {
    conditions.push(not(inArray(role.id, excludeIds)));
  }

  const includeIds = toArray(params.include_entity_ids);
  if (includeIds?.length > 0) {
    conditions.push(inArray(role.id, includeIds));
  }

  const names = toArray(params.names) as RoleName[];
  if (names?.length > 0) {
    const validNames = inArray(role.name, names);
    conditions.push(validNames);
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
};

export const getARoleForQuery = async (params: { entity_id: string }) =>
  db.query.role.findFirst({
    where: eq(role.id, params.entity_id),
    with: {
      role_permissions: {
        with: {
          permission: true
        }
      }
    }
  });

export const getRolesForQuery = async (
  query: {
    exclude_entity_ids?: string | string[];
    include_entity_ids?: string | string[];
    names?: RoleName | RoleName[];
  },
  options: { limit?: number; offset?: number }
) => {
  const where = prepareRoleQuery(query);

  const [data, total_rows] = await Promise.all([
    db.query.role.findMany({
      where,
      limit: options.limit,
      offset: options.offset,
      orderBy: (r, { desc }) => [desc(r.created_at)],
      with: {
        role_permissions: {
          with: {
            permission: true
          }
        }
      }
    }),
    countRoles(where)
  ]);

  return {
    data,
    meta_data: {
      filtered_rows: data.length,
      total_rows
    }
  };
};

export const getTopRoleOfAUser = (roles: RoleName[]) =>
  head(intersection(roleNameEnum.enumValues, roles)) ?? null;
