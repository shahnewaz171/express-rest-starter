import { generateHashPassword } from '@/src/modules/common/common.service';
import { roleUser } from '@/src/modules/role-user/role-user.schema';
import type { UserStatus } from '@/src/modules/user/user.schema';
import { user } from '@/src/modules/user/user.schema';

import type { DB } from '@/src/db';
import users from '@/src/db/seeds/data/users.json' with { type: 'json' };

export default async function seedUser(db: DB, roles: { id: string; name: string }[]) {
  const insertedUsers = await db
    .insert(user)
    .values(
      users.map((u) => ({
        ...u,
        password: generateHashPassword(u.password),
        status: u.status as UserStatus
      }))
    )
    .onConflictDoNothing()
    .returning();

  const roleUserEntries: { role_id: string; user_id: string }[] = [];

  for (const insertedUser of insertedUsers) {
    for (const r of roles) {
      roleUserEntries.push({ role_id: r.id, user_id: insertedUser.id });
    }
  }

  if (roleUserEntries.length > 0) {
    await db.insert(roleUser).values(roleUserEntries).onConflictDoNothing();
  }
}
