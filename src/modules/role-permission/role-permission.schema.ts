import { boolean, index, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { permission } from '@/src/modules/permission/permission.schema';
import { role } from '@/src/modules/role/role.schema';
import { user } from '@/src/modules/user/user.schema';

export const rolePermission = pgTable(
  'role_permissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    role_id: uuid('role_id')
      .notNull()
      .references(() => role.id, { onDelete: 'cascade' }),
    permission_id: uuid('permission_id')
      .notNull()
      .references(() => permission.id, { onDelete: 'cascade' }),
    can_do_the_action: boolean('can_do_the_action').notNull().default(false),
    created_by: uuid('created_by').references(() => user.id, { onDelete: 'set null' }),
    updated_by: uuid('updated_by').references(() => user.id, { onDelete: 'set null' }),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow()
  },
  (table) => [
    uniqueIndex('role_permissions_role_id_permission_id_idx').on(
      table.role_id,
      table.permission_id
    ),
    index('role_permissions_created_at_idx').on(table.created_at),
    index('role_permissions_created_by_idx').on(table.created_by),
    index('role_permissions_updated_at_idx').on(table.updated_at)
  ]
);

export type RolePermission = typeof rolePermission.$inferSelect;
export type NewRolePermission = typeof rolePermission.$inferInsert;
