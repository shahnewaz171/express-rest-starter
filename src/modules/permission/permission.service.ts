import { and, eq, not } from 'drizzle-orm';
import type { z } from 'zod';

import { CustomError } from '@/src/utils/error';

import type { NewPermission } from '@/src/modules/permission/permission.schema';
import { permission } from '@/src/modules/permission/permission.schema';
import type {
  createPermissionSchema,
  PermissionInput,
  updatePermissionSchema
} from '@/src/modules/permission/permission.type';

import type { DB } from '@/src/db';

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
  params: z.infer<typeof createPermissionSchema>,
  user: { user_id: string },
  tx: DB
) => {
  const existing = await tx.query.permission.findFirst({
    where: and(eq(permission.action, params.action), eq(permission.module, params.module))
  });
  if (existing) {
    throw new CustomError(409, 'PERMISSION_ALREADY_EXISTS');
  }

  return await createAPermission(
    {
      action: params.action,
      module: params.module,
      created_by: user.user_id
    },
    tx
  );
};

export const updateAPermissionForMutation = async (
  params: z.infer<typeof updatePermissionSchema>,
  _user: { user_id: string },
  tx: DB
) => {
  const { entity_id, data } = params;

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
