import { role, roleNameEnum } from '@/src/modules/role/role.schema';

import type { DB } from '@/src/db';

export default async function seedRole(db: DB) {
  const roles = roleNameEnum.enumValues.map((name) => ({ name }));

  await db.insert(role).values(roles).onConflictDoNothing();
}
