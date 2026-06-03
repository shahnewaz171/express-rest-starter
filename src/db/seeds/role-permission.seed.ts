import isEmpty from 'lodash/isEmpty';

import { permission } from '@/src/modules/permission/permission.schema';
import { rolePermission } from '@/src/modules/role-permission/role-permission.schema';

import type { DB } from '@/src/db';
import { role } from '@/src/db/schema';

const protectedModules = new Set(['user', 'role']);

export default async function seedRolePermission(tx: DB) {
  const roles = await tx.select().from(role);
  const permissions = await tx.select().from(permission);

  const rolePermissions = [];

  for (const item of roles) {
    for (const perm of permissions) {
      const isDeveloperRestricted = perm.action === 'delete' && protectedModules.has(perm.module);

      if (item.name === 'admin') {
        rolePermissions.push({
          role_id: item.id,
          permission_id: perm.id,
          can_do_the_action: true
        });
      } else if (item.name === 'developer' && !isDeveloperRestricted) {
        rolePermissions.push({
          role_id: item.id,
          permission_id: perm.id,
          can_do_the_action: true
        });
      }
    }
  }

  if (isEmpty(rolePermissions)) {
    console.warn('No role permissions to insert, skipping seed');
    return;
  }

  await tx.insert(rolePermission).values(rolePermissions).onConflictDoNothing();
}
