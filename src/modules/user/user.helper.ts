import { and, eq, ilike, inArray, not, or, type SQL, sql } from 'drizzle-orm';
import find from 'lodash/find';
import join from 'lodash/join';
import map from 'lodash/map';

import * as commonHelper from '@/src/modules/common/common.helper';
import * as roleHelper from '@/src/modules/role/role.helper';
import type { RoleName } from '@/src/modules/role/role.type';
import { user } from '@/src/modules/user/user.schema';
import type { UserQueryParams } from '@/src/modules/user/user.type';

import type { DB } from '@/src/db';
import { db } from '@/src/db';
import { role } from '@/src/db/schema';

export const countUsers = async (where?: SQL) => {
  const result = await db.select({ count: sql<number>`count(*)` }).from(user).where(where);

  return Number(result[0]?.count ?? 0);
};

export const getAUser = (options: { where?: SQL; withRoles?: boolean }, tx: DB) => {
  const { where, withRoles } = options;

  if (withRoles) {
    return tx.query.user.findFirst({
      where,
      with: {
        role_users: {
          with: {
            role: true
          }
        }
      }
    });
  }

  return tx.query.user.findFirst({ where });
};

export const getUsers = async (options: { where?: SQL; limit?: number; offset?: number }) =>
  db.query.user.findMany({
    where: options?.where,
    limit: options?.limit,
    offset: options?.offset,
    orderBy: (u, { desc }) => [desc(u.created_at)]
  });

export const prepareGetUsersQuery = (params: UserQueryParams) => {
  const conditions: SQL[] = [];

  if (params.email) {
    conditions.push(eq(user.email, params.email));
  }

  if (params.search_keyword) {
    const keyword = `%${params.search_keyword}%`;
    conditions.push(
      or(
        ilike(user.email, keyword),
        ilike(user.first_name, keyword),
        ilike(user.last_name, keyword)
      ) as SQL
    );
  }

  if (params.status) {
    conditions.push(
      eq(user.status, params.status as 'active' | 'inactive' | 'invited' | 'unverified')
    );
  }

  const excludeIds = params.exclude_entity_ids ?? [];
  if (excludeIds.length > 0) {
    conditions.push(not(inArray(user.id, excludeIds)));
  }

  const includeIds = params.include_entity_ids ?? [];
  if (includeIds.length > 0) {
    conditions.push(inArray(user.id, includeIds));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
};

export const getAUserForQuery = async (query: { entity_id: string }) => {
  const foundUser = await db.query.user.findFirst({
    where: eq(user.id, query.entity_id),
    columns: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      status: true
    }
  });

  return foundUser;
};

export const getUsersForQuery = async (
  params: UserQueryParams,
  options: { limit?: number; offset?: number }
) => {
  const where = prepareGetUsersQuery(params);

  const [users, total] = await Promise.all([
    db.query.user.findMany({
      where,
      limit: options.limit,
      offset: options.offset,
      orderBy: (u, { desc }) => [desc(u.created_at)],
      columns: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        status: true,
        created_at: true,
        updated_at: true
      }
    }),
    countUsers(where)
  ]);

  return { users, total };
};

export const getAuthUserWithRolesAndPermissions = async (params: {
  roles: RoleName[];
  user_id: string;
  tx?: DB;
}) => {
  const { roles, user_id, tx = db } = params;

  if (!commonHelper.validateUUID(user_id)) {
    throw new Error('INVALID_USER_ID');
  }

  if (roles.length === 0) {
    throw new Error('USER_HAS_NO_ROLE');
  }

  const userResult = await tx.query.user.findFirst({
    // columns: {
    //   id: true,
    //   email: true,
    //   first_name: true,
    //   last_name: true,
    //   status: true
    // },
    where: eq(user.id, user_id),
    with: {
      role_users: {
        with: {
          role: {
            ...(roles.length > 0 ? { where: inArray(role.name, roles) } : {}),
            with: {
              role_permissions: {
                with: {
                  permission: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!userResult?.id) {
    throw new Error('USER_DOES_NOT_EXIST');
  }

  const userRoles = map(userResult.role_users, (ru) => ru.role?.name).filter(Boolean) as RoleName[];
  const topRole = roleHelper.getTopRoleOfAUser(userRoles);

  const permissions: Record<string, string[]> = {};
  const topRolePermissions =
    find(userResult.role_users, (ru) => ru.role?.name === topRole)?.role?.role_permissions || [];

  for (const rp of topRolePermissions) {
    const permission = rp.permission;

    if (permission) {
      const module = permission.module;

      if (!permissions[module]) {
        permissions[module] = [];
      }

      permissions[module].push(permission.action);

      // permissions[module].push({
      //   id: permission.id,
      //   action: permission.action,
      //   can_do_the_action: rp.can_do_the_action,
      //   module: permission.module
      // });
    }
  }

  return {
    id: userResult.id,
    email: userResult.email,
    first_name: userResult.first_name,
    last_name: userResult.last_name,
    status: userResult.status,
    image: userResult.image,
    created_at: userResult.created_at,
    updated_at: userResult.updated_at,
    last_login_at: userResult.last_login_at,
    roles: userRoles,
    role: topRole,
    permissions,
    user_id: userResult.id
  };
};

export const getUsernameByNames = (
  email: string,
  first_name?: string | null,
  last_name?: string | null
) => {
  const parts = [first_name, last_name].filter(Boolean);

  if (parts.length === 0) {
    return email;
  }

  return join(parts, ' ');
};
