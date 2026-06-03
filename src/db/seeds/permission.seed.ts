import {
  permission,
  permissionActionsEnum,
  permissionModulesEnum
} from '@/src/modules/permission/permission.schema';

import type { DB } from '@/src/db';

const modules = permissionModulesEnum.enumValues;
const actions = permissionActionsEnum.enumValues;

export default async function seedPermission(db: DB) {
  const permissions = modules.flatMap((mod) =>
    actions.map((act) => ({ action: act, module: mod }))
  );

  await db.insert(permission).values(permissions).onConflictDoNothing();
}
