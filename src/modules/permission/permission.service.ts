import { and, eq, not } from 'drizzle-orm';
import { z } from 'zod';

import { CustomError } from '@/src/utils/error';

import { uuidSchema } from '@/src/modules/common/common.validation';
import type { NewPermission } from '@/src/modules/permission/permission.schema';
import {
  permission,
  permissionActionsEnum,
  permissionModulesEnum
} from '@/src/modules/permission/permission.schema';
import type { PermissionInput } from '@/src/modules/permission/permission.type';

import type { DB } from '@/src/db';

const createPermissionSchema = z.object({
  action: z.enum(permissionActionsEnum.enumValues),
  module: z.enum(permissionModulesEnum.enumValues)
});

const updatePermissionSchema = z.object({
  entity_id: uuidSchema,
  data: z.object({
    action: z.enum(permissionActionsEnum.enumValues).optional(),
    module: z.enum(permissionModulesEnum.enumValues).optional()
  })
});

const deletePermissionSchema = z.object({
  entity_id: uuidSchema
});

export const createAPermission = async (data: NewPermission, tx: DB) => {
  const [created] = await tx.insert(permission).values(data).returning();
  return created;
};

export const createPermissions = async (data: NewPermission[], tx: DB) => {
  const created = await tx.insert(permission).values(data).returning();
  return created;
};

export const updateAPermission = async (id: string, data: Partial<PermissionInput>, tx: DB) => {
  const [updated] = await tx.update(permission).set(data).where(eq(permission.id, id)).returning();
  return updated;
};

export const deleteAPermission = async (id: string, tx: DB) => {
  const [deleted] = await tx.delete(permission).where(eq(permission.id, id)).returning();
  return deleted;
};

export const createAPermissionForMutation = async (
  params: PermissionInput,
  user: { user_id: string },
  tx: DB
) => {
  const parsed = createPermissionSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, parsed.error.issues[0]?.message ?? 'VALIDATION_ERROR');
  }

  const existing = await tx.query.permission.findFirst({
    where: and(eq(permission.action, parsed.data.action), eq(permission.module, parsed.data.module))
  });
  if (existing) {
    throw new CustomError(409, 'PERMISSION_ALREADY_EXISTS');
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
  params: { entity_id: string; data: PermissionInput },
  _user: { user_id: string },
  tx: DB
) => {
  const parsed = updatePermissionSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, parsed.error.issues[0]?.message ?? 'VALIDATION_ERROR');
  }

  const { entity_id, data } = parsed.data;

  if (!data.action && !data.module) {
    throw new CustomError(400, 'NO_FIELDS_TO_UPDATE');
  }

  const current = await tx.query.permission.findFirst({
    where: eq(permission.id, entity_id)
  });
  if (!current) {
    throw new CustomError(404, 'PERMISSION_NOT_FOUND');
  }

  const updateData: PermissionInput = {
    action: data.action ?? current.action,
    module: data.module ?? current.module
  };

  const conflict = await tx.query.permission.findFirst({
    where: and(
      eq(permission.action, updateData.action),
      eq(permission.module, updateData.module),
      not(eq(permission.id, entity_id))
    )
  });
  if (conflict) {
    throw new CustomError(409, 'PERMISSION_ALREADY_EXISTS');
  }

  return await updateAPermission(entity_id, updateData, tx);
};

export const deleteAPermissionForMutation = async (params: { entity_id: string }, tx: DB) => {
  const parsed = deletePermissionSchema.safeParse(params);
  if (!parsed.success) {
    throw new CustomError(400, parsed.error.issues[0]?.message ?? 'VALIDATION_ERROR');
  }

  return await deleteAPermission(parsed.data.entity_id, tx);
};
