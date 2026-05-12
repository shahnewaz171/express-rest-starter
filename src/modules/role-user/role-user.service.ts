import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { CustomError } from '@/src/utils/error';

import { uuidSchema } from '@/src/modules/common/common.validation';
import { role } from '@/src/modules/role/role.schema';
import { roleUser } from '@/src/modules/role-user/role-user.schema';
import type {
  CreateRoleUserInput,
  UpdateRoleUserInput
} from '@/src/modules/role-user/role-user.type';
import { user } from '@/src/modules/user/user.schema';

import type { DB } from '@/src/db';
import { db, useTransaction } from '@/src/db';

const createRoleUserSchema = z.object({
  role_id: uuidSchema,
  user_id: uuidSchema
});

const updateRoleUserSchema = z.object({
  entity_id: uuidSchema,
  role_id: uuidSchema.optional(),
  user_id: uuidSchema.optional()
});

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

export const createARoleUserForMutation = async (params: CreateRoleUserInput, tx: DB = db) => {
  const parsed = createRoleUserSchema.safeParse(params);

  if (!parsed.success) {
    throw new CustomError(400, parsed.error.issues[0]?.message ?? 'VALIDATION_ERROR');
  }

  const foundRole = await tx.query.role.findFirst({
    where: eq(role.id, parsed.data.role_id)
  });
  if (!foundRole) {
    throw new CustomError(404, 'ROLE_DOES_NOT_EXIST');
  }

  const foundUser = await tx.query.user.findFirst({
    where: eq(user.id, parsed.data.user_id)
  });
  if (!foundUser) {
    throw new CustomError(404, 'USER_DOES_NOT_EXIST');
  }

  const existing = await tx.query.roleUser.findFirst({
    where: and(eq(roleUser.role_id, parsed.data.role_id), eq(roleUser.user_id, parsed.data.user_id))
  });
  if (existing) {
    throw new CustomError(409, 'ROLE_USER_ALREADY_EXISTS');
  }

  const [created] = await tx
    .insert(roleUser)
    .values({
      role_id: parsed.data.role_id,
      user_id: parsed.data.user_id
    })
    .returning();

  return created;
};

export const updateARoleUserForMutation = async (
  params: { entity_id: string; role_id?: string; user_id?: string },
  tx: DB = db
) => {
  const parsed = updateRoleUserSchema.safeParse(params);

  if (!parsed.success) {
    throw new CustomError(400, parsed.error.issues[0]?.message ?? 'VALIDATION_ERROR');
  }

  const { entity_id, ...data } = parsed.data;

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
        eq(roleUser.id, entity_id)
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
  params: { role_name: string; user_id: string },
  tx: DB = db
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
  params: { role_name: string; user_id: string },
  tx: DB = db
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
