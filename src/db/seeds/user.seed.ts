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
      users.map(({ roles: _roles, ...u }) => ({
        ...u,
        password: generateHashPassword(u.password),
        status: u.status as UserStatus
      }))
    )
    .onConflictDoNothing({ target: [user.email] })
    .returning();

  const roleMap = new Map(roles.map((r) => [r.name, r.id]));
  const dummyUserEmails = new Map(users.map((u) => [u.email, u]));
  const roleUserEntries: { role_id: string; user_id: string }[] = [];

  for (const insertedUser of insertedUsers) {
    const userRoles = dummyUserEmails.get(insertedUser.email)?.roles;

    if (userRoles) {
      for (const role of userRoles) {
        const roleId = roleMap.get(role?.name);

        if (roleId) {
          roleUserEntries.push({
            role_id: roleId,
            user_id: insertedUser.id
          });
        }
      }
    }
  }

  if (roleUserEntries.length > 0) {
    await db
      .insert(roleUser)
      .values(roleUserEntries)
      .onConflictDoNothing({ target: [roleUser.role_id, roleUser.user_id] });
  }
}
