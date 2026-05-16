import { role } from '@/src/modules/role/role.schema';

import type { DB } from '@/src/db';

export default async function seedRole(db: DB) {
  await db
    .insert(role)
    .values([{ name: 'admin' }, { name: 'developer' }, { name: 'moderator' }, { name: 'user' }])
    .onConflictDoNothing({ target: [role.name] });

  return await db.select().from(role);
}
