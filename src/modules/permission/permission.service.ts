import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { CustomError } from '@/src/utils/error';

import { uuidSchema } from '@/src/modules/common/common.validation';
import type { NewPermission } from '@/src/modules/permission/permission.schema';
import { permission } from '@/src/modules/permission/permission.schema';
import type {
  CreatePermissionInput,
  UpdatePermissionInput
} from '@/src/modules/permission/permission.type';

import type { DB } from '@/src/db';
import { db } from '@/src/db';

const createPermissionSchema = z.object({
  action: z.string().min(1),
  module: z.string().min(1)
});

const updatePermissionSchema = z.object({
  entity_id: uuidSchema,
  data: z.object({
    action: z.string().min(1).optional(),
    module: z.string().min(1).optional()
  })
});

const deletePermissionSchema = z.object({
  entity_id: uuidSchema
});

export const createAPermission = async (data: NewPermission, tx: DB = db) => {
  const [created] = await tx.insert(permission).values(data).returning();
  return created;
};

export const createPermissions = async (data: NewPermission[], tx: DB = db) => {
  const created = await tx.insert(permission).values(data).returning();
  return created;
};

export const updateAPermission = async (id: string, data: Partial<NewPermission>, tx: DB = db) => {
  const [updated] = await tx.update(permission).set(data).where(eq(permission.id, id)).returning();
  return updated;
};

export const deleteAPermission = async (id: string, tx: DB = db) => {
  const [deleted] = await tx.delete(permission).where(eq(permission.id, id)).returning();
  return deleted;
};

export const createAPermissionForMutation = async (
  params: CreatePermissionInput,
  user: { user_id: string },
  tx: DB = db
) => {
  const parsed = createPermissionSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, parsed.error.issues[0]?.message ?? 'VALIDATION_ERROR');
  }

  return await createAPermission(
    {
      action: parsed.data.action,
      module: parsed.data.module,
      created_by: user.user_id
    },
    tx
  );
};

export const updateAPermissionForMutation = async (
  params: { entity_id: string; data: UpdatePermissionInput },
  _user: { user_id: string },
  tx: DB = db
) => {
  const parsed = updatePermissionSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, parsed.error.issues[0]?.message ?? 'VALIDATION_ERROR');
  }

  const { entity_id, data } = parsed.data;

  if (data.action === undefined && data.module === undefined) {
    throw new CustomError(400, 'NO_FIELDS_TO_UPDATE');
  }

  const updateData: Partial<NewPermission> = {};
  if (data.action !== undefined) updateData.action = data.action;
  if (data.module !== undefined) updateData.module = data.module;

  return await updateAPermission(entity_id, updateData, tx);
};

export const deleteAPermissionForMutation = async (params: { entity_id: string }, tx: DB = db) => {
  const parsed = deletePermissionSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, parsed.error.issues[0]?.message ?? 'VALIDATION_ERROR');
  }

  return await deleteAPermission(parsed.data.entity_id, tx);
};
