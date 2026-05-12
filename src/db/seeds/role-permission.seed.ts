import { permission } from '@/src/modules/permission/permission.schema';
import { role } from '@/src/modules/role/role.schema';
import { rolePermission } from '@/src/modules/role-permission/role-permission.schema';

import type { DB } from '@/src/db';

export default async function seedRolePermission(db: DB) {
  const allRoles = await db.select().from(role);
  const allPermissions = await db.select().from(permission);

  const adminRole = allRoles.find((r) => r.name === 'admin');
  if (!adminRole) return;

  const adminRolePermissions = allPermissions.map((perm) => ({
    role_id: adminRole.id,
    permission_id: perm.id,
    can_do_the_action: true
  }));

  await db.insert(rolePermission).values(adminRolePermissions).onConflictDoNothing();
}
