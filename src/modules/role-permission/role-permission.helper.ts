import { and, eq, inArray, not, sql } from 'drizzle-orm';

import { CustomError } from '@/src/utils/error';

import type { QueryOptions } from '@/src/modules/common/common.type';
import { rolePermission } from '@/src/modules/role-permission/role-permission.schema';
import type { RolePermissionQueryParams } from '@/src/modules/role-permission/role-permission.type';

import { db } from '@/src/db';

export const countRolePermissions = async (params: RolePermissionQueryParams = {}) => {
  const conditions = prepareRolePermissionQuery(params);

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(rolePermission)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return Number(result[0]?.count ?? 0);
};

export const getARolePermission = async (id: string) => {
  const result = await db.query.rolePermission.findFirst({
    where: eq(rolePermission.id, id),
    with: { role: true, permission: true }
  });

  return result;
};

export const getRolePermissions = async (
  params: RolePermissionQueryParams = {},
  options: QueryOptions = {}
) => {
  const { limit = 50, offset = 0 } = options;
  const conditions = prepareRolePermissionQuery(params);

  const results = await db.query.rolePermission.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { role: true, permission: true },
    limit,
    offset,
    orderBy: (rp, { desc }) => [desc(rp.created_at)]
  });

  return results;
};

export const prepareRolePermissionQuery = (params: RolePermissionQueryParams = {}) => {
  const conditions = [];

  if (params.role_id) {
    conditions.push(eq(rolePermission.role_id, params.role_id));
  }

  if (params.permission_id) {
    conditions.push(eq(rolePermission.permission_id, params.permission_id));
  }

  if (params.can_do_the_action !== undefined) {
    conditions.push(eq(rolePermission.can_do_the_action, params.can_do_the_action));
  }

  if (params.exclude_entity_ids && params.exclude_entity_ids.length > 0) {
    conditions.push(not(inArray(rolePermission.id, params.exclude_entity_ids)));
  }

  if (params.include_entity_ids && params.include_entity_ids.length > 0) {
    conditions.push(inArray(rolePermission.id, params.include_entity_ids));
  }

  return conditions;
};

export const getARolePermissionForQuery = async (id: string) => {
  const result = await db.query.rolePermission.findFirst({
    where: eq(rolePermission.id, id),
    with: { role: true, permission: true }
  });

  if (!result) {
    throw new CustomError(404, 'ROLE_PERMISSION_DOES_NOT_EXIST');
  }

  return result;
};

export const getRolePermissionsForQuery = async (
  params: RolePermissionQueryParams = {},
  options: QueryOptions = {}
) => {
  const { limit = 50, offset = 0 } = options;
  const conditions = prepareRolePermissionQuery(params);

  const [data, totalResult] = await Promise.all([
    db.query.rolePermission.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: { role: true, permission: true },
      limit,
      offset,
      orderBy: (rp, { desc }) => [desc(rp.created_at)]
    }),
    countRolePermissions(params)
  ]);

  return {
    data,
    meta_data: {
      filtered_rows: data.length,
      total_rows: totalResult
    }
  };
};
