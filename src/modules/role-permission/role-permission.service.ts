import { and, eq } from 'drizzle-orm';
import type { z } from 'zod';

import { CustomError } from '@/src/utils/error';

import { permission } from '@/src/modules/permission/permission.schema';
import { role } from '@/src/modules/role/role.schema';
import { rolePermission } from '@/src/modules/role-permission/role-permission.schema';
import type {
  CreateRolePermissionInput,
  createRolePermissionSchema,
  UpdateRolePermissionInput,
  updateRolePermissionSchema
} from '@/src/modules/role-permission/role-permission.type';

import type { DB } from '@/src/db';
import { db, useTransaction } from '@/src/db';

export const createARolePermission = async (data: CreateRolePermissionInput, created_by?: string) =>
  useTransaction(async (tx) => {
    const [created] = await tx
      .insert(rolePermission)
      .values({ ...data, created_by })
      .returning();

    return created;
  });

export const createRolePermissions = async (data: CreateRolePermissionInput[], tx: DB = db) => {
  const created = await tx.insert(rolePermission).values(data).returning();
  return created;
};

export const updateARolePermission = async (
  id: string,
  data: UpdateRolePermissionInput,
  updated_by?: string
) =>
  useTransaction(async (tx) => {
    const [updated] = await tx
      .update(rolePermission)
      .set({ ...data, updated_by })
      .where(eq(rolePermission.id, id))
      .returning();

    if (!updated) {
      throw new CustomError(404, 'ROLE_PERMISSION_NOT_FOUND');
    }

    return updated;
  });

export const deleteARolePermission = async (id: string) =>
  useTransaction(async (tx) => {
    const [deleted] = await tx.delete(rolePermission).where(eq(rolePermission.id, id)).returning();

    if (!deleted) {
      throw new CustomError(404, 'ROLE_PERMISSION_NOT_FOUND');
    }

    return deleted;
  });

export const createARolePermissionForMutation = async (
  params: z.infer<typeof createRolePermissionSchema>,
  user: { user_id: string },
  tx: DB
) => {
  const foundRole = await tx.query.role.findFirst({
    where: eq(role.id, params.role_id)
  });
  if (!foundRole) {
    throw new CustomError(404, 'ROLE_DOES_NOT_EXIST');
  }

  const foundPermission = await tx.query.permission.findFirst({
    where: eq(permission.id, params.permission_id)
  });
  if (!foundPermission) {
    throw new CustomError(404, 'PERMISSION_DOES_NOT_EXIST');
  }

  const existing = await tx.query.rolePermission.findFirst({
    where: and(
      eq(rolePermission.role_id, params.role_id),
      eq(rolePermission.permission_id, params.permission_id)
    )
  });
  if (existing?.id) {
    throw new CustomError(409, 'ROLE_PERMISSION_ALREADY_EXISTS');
  }

  const [created] = await tx
    .insert(rolePermission)
    .values({
      role_id: params.role_id,
      permission_id: params.permission_id,
      can_do_the_action: params.can_do_the_action ?? false,
      created_by: user.user_id
    })
    .returning();

  if (!created) {
    throw new CustomError(409, 'ROLE_PERMISSION_ALREADY_EXISTS');
  }

  return created;
};

export const updateARolePermissionForMutation = async (
  params: z.infer<typeof updateRolePermissionSchema>,
  user: { user_id: string },
  tx: DB
) => {
  const [updated] = await tx
    .update(rolePermission)
    .set({ can_do_the_action: params.can_do_the_action, updated_by: user.user_id })
    .where(eq(rolePermission.id, params.entity_id))
    .returning();

  if (!updated) {
    throw new CustomError(404, 'ROLE_PERMISSION_NOT_FOUND');
  }

  return updated;
};

export const deleteARolePermissionForMutation = async (tx: DB, id: string) => {
  const [deleted] = await tx.delete(rolePermission).where(eq(rolePermission.id, id)).returning();

  if (!deleted) {
    throw new CustomError(404, 'ROLE_PERMISSION_NOT_FOUND');
  }

  return deleted;
};
