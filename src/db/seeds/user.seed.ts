import { inArray } from 'drizzle-orm';

import { generateHashPassword } from '@/src/modules/common/common.service';
import { role } from '@/src/modules/role/role.schema';
import type { RoleName } from '@/src/modules/role/role.type';
import { roleUser } from '@/src/modules/role-user/role-user.schema';
import { user } from '@/src/modules/user/user.schema';
import type { UserStatus } from '@/src/modules/user/user.type';

import type { DB } from '@/src/db';
import users from '@/src/db/seeds/data/users.json' with { type: 'json' };

export default async function seedUser(tx: DB) {
  const userValues = await Promise.all(
    users.map(async ({ roles: _roles, ...u }) => ({
      ...u,
      password: await generateHashPassword('123456aA@'),
      status: u.status as UserStatus
    }))
  );
  await tx.insert(user).values(userValues).onConflictDoNothing();

  const seedEmails = users.map((u) => u.email);
  const seededUsers = await tx.select().from(user).where(inArray(user.email, seedEmails));

  const roleUserEntries: { role_id: string; user_id: string }[] = [];
  const roles = await tx.select().from(role);
  const roleMap = new Map(roles.map((r) => [r.name, r.id]));
  const dummyUserEmails = new Map(users.map((u) => [u.email, u]));

  for (const insertedUser of seededUsers) {
    const userRoles = dummyUserEmails.get(insertedUser.email)?.roles;

    if (userRoles) {
      for (const item of userRoles) {
        const roleId = roleMap.get(item.name as RoleName);

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
    await tx.insert(roleUser).values(roleUserEntries).onConflictDoNothing();
  }
}
