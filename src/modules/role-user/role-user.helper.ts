import { and, eq, inArray, not, sql } from 'drizzle-orm';
import isArray from 'lodash/isArray';

import { CustomError } from '@/src/utils/error';

import type { QueryOptions } from '@/src/modules/common/common.type';
import { roleUser } from '@/src/modules/role-user/role-user.schema';
import type { RoleUserQueryParams } from '@/src/modules/role-user/role-user.type';

import { db } from '@/src/db';

export const countRoleUsers = async (params: RoleUserQueryParams = {}) => {
  const conditions = prepareRoleUserQuery(params);

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(roleUser)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return Number(result[0]?.count ?? 0);
};

export const getARoleUser = async (id: string) => {
  const result = await db.query.roleUser.findFirst({
    where: eq(roleUser.id, id),
    with: { role: true, user: true }
  });

  return result;
};

export const getRoleUsers = async (
  params: RoleUserQueryParams = {},
  options: QueryOptions = {}
) => {
  const { limit = 50, offset = 0 } = options;
  const conditions = prepareRoleUserQuery(params);

  const results = await db.query.roleUser.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { role: true, user: true },
    limit,
    offset,
    orderBy: (ru, { desc }) => [desc(ru.created_at)]
  });

  return results;
};

export const prepareRoleUserQuery = (params: RoleUserQueryParams) => {
  const { role_id, user_id, exclude_entity_ids, include_entity_ids } = params || {};

  const conditions = [];

  if (role_id) {
    conditions.push(eq(roleUser.role_id, role_id));
  }

  if (user_id) {
    conditions.push(eq(roleUser.user_id, user_id));
  }

  if (isArray(exclude_entity_ids) && exclude_entity_ids.length > 0) {
    conditions.push(not(inArray(roleUser.id, exclude_entity_ids)));
  }

  if (isArray(include_entity_ids) && include_entity_ids.length > 0) {
    conditions.push(inArray(roleUser.id, include_entity_ids));
  }

  return conditions;
};

export const getARoleUserForQuery = async (id: string) => {
  const result = await db.query.roleUser.findFirst({
    where: eq(roleUser.id, id),
    with: { role: true, user: true }
  });

  if (!result) {
    throw new CustomError(404, 'ROLE_USER_DOES_NOT_EXIST');
  }

  return result;
};

export const getRoleUsersForQuery = async (
  params: RoleUserQueryParams = {},
  options: QueryOptions = {}
) => {
  const { limit = 50, offset = 0 } = options;
  const conditions = prepareRoleUserQuery(params);

  const [data, totalResult] = await Promise.all([
    db.query.roleUser.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: { role: true, user: true },
      limit,
      offset,
      orderBy: (ru, { desc }) => [desc(ru.created_at)]
    }),
    countRoleUsers(params)
  ]);

  return {
    data,
    meta_data: {
      filtered_rows: data.length,
      total_rows: totalResult
    }
  };
};
