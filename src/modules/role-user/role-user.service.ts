import { and, eq, not } from 'drizzle-orm';
import type { z } from 'zod';

import { CustomError } from '@/src/utils/error';

import { role } from '@/src/modules/role/role.schema';
import type { RoleName } from '@/src/modules/role/role.type';
import { roleUser } from '@/src/modules/role-user/role-user.schema';
import type {
  CreateRoleUserInput,
  createRoleUserSchema,
  UpdateRoleUserInput,
  updateRoleUserSchema
} from '@/src/modules/role-user/role-user.type';
import { user } from '@/src/modules/user/user.schema';

import type { DB } from '@/src/db';
import { useTransaction } from '@/src/db';

export const createARoleUser = async (data: CreateRoleUserInput) =>
  useTransaction(async (tx) => {
    const [created] = await tx.insert(roleUser).values(data).returning();

    return created;
  });

export const updateARoleUser = async (id: string, data: UpdateRoleUserInput) =>
  useTransaction(async (tx) => {
    const [updated] = await tx.update(roleUser).set(data).where(eq(roleUser.id, id)).returning();

    if (!updated) {
      throw new CustomError(404, 'ROLE_USER_NOT_FOUND');
    }

    return updated;
  });

export const deleteARoleUser = async (id: string) =>
  useTransaction(async (tx) => {
    const [deleted] = await tx.delete(roleUser).where(eq(roleUser.id, id)).returning();

    if (!deleted) {
      throw new CustomError(404, 'ROLE_USER_NOT_FOUND');
    }

    return deleted;
  });

export const createARoleUserForMutation = async (
  params: z.infer<typeof createRoleUserSchema>,
  tx: DB
) => {
  const foundRole = await tx.query.role.findFirst({
    where: eq(role.id, params.role_id)
  });
  if (!foundRole) {
    throw new CustomError(404, 'ROLE_DOES_NOT_EXIST');
  }

  const foundUser = await tx.query.user.findFirst({
    where: eq(user.id, params.user_id)
  });
  if (!foundUser) {
    throw new CustomError(404, 'USER_DOES_NOT_EXIST');
  }

  const existing = await tx.query.roleUser.findFirst({
    where: and(eq(roleUser.role_id, params.role_id), eq(roleUser.user_id, params.user_id))
  });
  if (existing) {
    throw new CustomError(409, 'ROLE_USER_ALREADY_EXISTS');
  }

  const [created] = await tx
    .insert(roleUser)
    .values({
      role_id: params.role_id,
      user_id: params.user_id
    })
    .returning();

  if (!created) {
    throw new CustomError(409, 'ROLE_USER_ALREADY_EXISTS');
  }

  return created;
};

export const updateARoleUserForMutation = async (
  params: z.infer<typeof updateRoleUserSchema>,
  tx: DB
) => {
  const { entity_id, ...data } = params;

  if (data.role_id === undefined && data.user_id === undefined) {
    throw new CustomError(400, 'NO_FIELDS_TO_UPDATE');
  }

  if (data.role_id) {
    const foundRole = await tx.query.role.findFirst({
      where: eq(role.id, data.role_id)
    });
    if (!foundRole) {
      throw new CustomError(404, 'ROLE_DOES_NOT_EXIST');
    }
  }

  if (data.user_id) {
    const foundUser = await tx.query.user.findFirst({
      where: eq(user.id, data.user_id)
    });
    if (!foundUser) {
      throw new CustomError(404, 'USER_DOES_NOT_EXIST');
    }
  }

  if (data.role_id && data.user_id) {
    const existing = await tx.query.roleUser.findFirst({
      where: and(
        eq(roleUser.role_id, data.role_id),
        eq(roleUser.user_id, data.user_id),
        not(eq(roleUser.id, entity_id))
      )
    });
    if (existing) {
      throw new CustomError(409, 'ROLE_USER_ALREADY_EXISTS');
    }
  }

  const [updated] = await tx
    .update(roleUser)
    .set(data)
    .where(eq(roleUser.id, entity_id))
    .returning();

  if (!updated) {
    throw new CustomError(404, 'ROLE_USER_NOT_FOUND');
  }

  return updated;
};

export const deleteARoleUserForMutation = async (tx: DB, id: string) => {
  const [deleted] = await tx.delete(roleUser).where(eq(roleUser.id, id)).returning();

  if (!deleted) {
    throw new CustomError(404, 'ROLE_USER_NOT_FOUND');
  }

  return deleted;
};

export const assignARoleToUserByName = async (
  params: { role_name: RoleName; user_id: string },
  tx: DB
) => {
  const foundRole = await tx.query.role.findFirst({
    where: eq(role.name, params.role_name)
  });

  if (!foundRole) {
    throw new CustomError(404, 'ROLE_NOT_FOUND');
  }

  const existing = await tx.query.roleUser.findFirst({
    where: and(eq(roleUser.role_id, foundRole.id), eq(roleUser.user_id, params.user_id))
  });

  if (existing) {
    return existing;
  }

  const [created] = await tx
    .insert(roleUser)
    .values({ role_id: foundRole.id, user_id: params.user_id })
    .returning();

  return created;
};

export const revokeARoleFromUserByName = async (
  params: { role_name: RoleName; user_id: string },
  tx: DB
) => {
  const foundRole = await tx.query.role.findFirst({
    where: eq(role.name, params.role_name)
  });

  if (!foundRole) {
    throw new CustomError(404, 'ROLE_NOT_FOUND');
  }

  const [deleted] = await tx
    .delete(roleUser)
    .where(and(eq(roleUser.role_id, foundRole.id), eq(roleUser.user_id, params.user_id)))
    .returning();

  if (!deleted) {
    throw new CustomError(400, 'COULD_NOT_REMOVE_ROLE_USER');
  }

  return deleted;
};
