import { permission } from '@/src/modules/permission/permission.schema';

import type { DB } from '@/src/db';

const modules = ['permission', 'role', 'role_permission', 'role_user', 'user'] as const;
const actions = ['create', 'read', 'update', 'delete'] as const;

export default async function seedPermission(db: DB) {
  const permissions = modules.flatMap((mod) =>
    actions.map((act) => ({ action: act, module: mod }))
  );

  await db.insert(permission).values(permissions).onConflictDoNothing();
}
