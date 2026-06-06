import { eq } from 'drizzle-orm';
import type { z } from 'zod';

import { CustomError } from '@/src/utils/error';

import type { NewRole } from '@/src/modules/role/role.schema';
import { role } from '@/src/modules/role/role.schema';
import type { createRoleSchema, updateRoleSchema } from '@/src/modules/role/role.type';

import type { DB } from '@/src/db';

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
  params: z.infer<typeof createRoleSchema>,
  user: { user_id: string },
  tx: DB
) => {
  const existingRole = await tx.query.role.findFirst({
    where: eq(role.name, params.name)
  });
  if (existingRole) {
    throw new CustomError(409, 'ROLE_ALREADY_EXISTS');
  }

  return await createARole(
    {
      name: params.name,
      created_by: user.user_id
    },
    tx
  );
};

export const updateARoleForMutation = async (
  params: z.infer<typeof updateRoleSchema>,
  _user: { user_id: string },
  tx: DB
) => {
  const { entity_id, data } = params;

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
