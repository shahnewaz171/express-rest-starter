import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { CustomError } from '@/src/utils/error';

import { uuidSchema } from '@/src/modules/common/common.validation';
import type { NewRole } from '@/src/modules/role/role.schema';
import { role, roleNameEnum } from '@/src/modules/role/role.schema';
import type { CreateRoleInput, UpdateRoleInput } from '@/src/modules/role/role.type';

import type { DB } from '@/src/db';

const createRoleSchema = z.object({
  name: z.enum(roleNameEnum.enumValues)
});

const updateRoleSchema = z.object({
  entity_id: uuidSchema,
  data: z.object({
    name: z.enum(roleNameEnum.enumValues).optional()
  })
});

const deleteRoleSchema = z.object({
  entity_id: uuidSchema
});

export const createARole = async (data: NewRole, tx: DB) => {
  const [created] = await tx.insert(role).values(data).returning();
  return created;
};

export const createRoles = async (data: NewRole[], tx: DB) => {
  const created = await tx.insert(role).values(data).returning();
  return created;
};

export const updateARole = async (id: string, data: Partial<NewRole>, tx: DB) => {
  const [updated] = await tx.update(role).set(data).where(eq(role.id, id)).returning();
  return updated;
};

export const deleteARole = async (id: string, tx: DB) => {
  const [deleted] = await tx.delete(role).where(eq(role.id, id)).returning();
  return deleted;
};

export const createARoleForMutation = async (
  params: CreateRoleInput,
  user: { user_id: string },
  tx: DB
) => {
  const parsed = createRoleSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, parsed.error.issues[0]?.message ?? 'VALIDATION_ERROR');
  }

  const existingRole = await tx.query.role.findFirst({
    where: eq(role.name, parsed.data.name)
  });
  if (existingRole) {
    throw new CustomError(409, 'ROLE_ALREADY_EXISTS');
  }

  return await createARole(
    {
      name: parsed.data.name,
      created_by: user.user_id
    },
    tx
  );
};

export const updateARoleForMutation = async (
  params: { entity_id: string; data: UpdateRoleInput },
  _user: { user_id: string },
  tx: DB
) => {
  const parsed = updateRoleSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, parsed.error.issues[0]?.message ?? 'VALIDATION_ERROR');
  }

  const { entity_id, data } = parsed.data;

  if (data.name === undefined) {
    throw new CustomError(400, 'NO_FIELDS_TO_UPDATE');
  }

  const current = await tx.query.role.findFirst({
    where: eq(role.id, entity_id)
  });
  if (!current) {
    throw new CustomError(404, 'ROLE_NOT_FOUND');
  }

  return await updateARole(entity_id, { name: data.name }, tx);
};

export const deleteARoleForMutation = async (params: { entity_id: string }, tx: DB) => {
  const parsed = deleteRoleSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, parsed.error.issues[0]?.message ?? 'VALIDATION_ERROR');
  }

  return await deleteARole(parsed.data.entity_id, tx);
};
