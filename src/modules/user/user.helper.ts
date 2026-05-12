import { and, eq, ilike, inArray, not, or, type SQL, sql } from 'drizzle-orm';

import { getTopRoleOfAUser } from '@/src/modules/role/role.helper';
import { user } from '@/src/modules/user/user.schema';
import type { UserQueryParams } from '@/src/modules/user/user.type';

import { db } from '@/src/db';

export const countUsers = async (where?: SQL) => {
  const result = await db.select({ count: sql<number>`count(*)` }).from(user).where(where);

  return Number(result[0]?.count ?? 0);
};

export const getAUser = (options: { where?: SQL; withRoles?: boolean }) => {
  const { where, withRoles } = options;

  if (withRoles) {
    return db.query.user.findFirst({
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

  return db.query.user.findFirst({ where });
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
  roles: string[];
  user_id: string;
}) => {
  const { roles, user_id } = params;

  const userResult = await db.query.user.findFirst({
    where: eq(user.id, user_id),
    with: {
      role_users: {
        with: {
          role: {
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

  if (!userResult) {
    return null;
  }

  const userRoles = userResult.role_users
    .filter((ru) => roles.includes(ru.role?.name ?? ''))
    .map((ru) => ru.role?.name ?? '')
    .filter(Boolean);

  const topRole = getTopRoleOfAUser(userRoles);

  const permissions: Record<string, { action: string; can_do_the_action: boolean }[]> = {};

  for (const ru of userResult.role_users) {
    if (ru.role?.role_permissions) {
      for (const rp of ru.role.role_permissions) {
        if (rp.permission) {
          const module = rp.permission.module;
          if (!permissions[module]) {
            permissions[module] = [];
          }

          permissions[module].push({
            action: rp.permission.action,
            can_do_the_action: rp.can_do_the_action
          });
        }
      }
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

  if (parts.length > 0) {
    return parts.join(' ');
  }

  return email;
};
