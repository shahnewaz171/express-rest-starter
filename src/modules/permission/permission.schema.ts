import { index, pgEnum, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { user } from '@/src/modules/user/user.schema';

export const permissionActionsEnum = pgEnum('permission_action', [
  'create',
  'read',
  'update',
  'delete'
]);
export const permissionModulesEnum = pgEnum('permission_module', [
  'permission',
  'role',
  'role_permission',
  'role_user',
  'user'
]);

export const permission = pgTable(
  'permissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    action: permissionActionsEnum('action').notNull(),
    module: permissionModulesEnum('module').notNull(),
    created_by: uuid('created_by').references(() => user.id, { onDelete: 'set null' }),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date())
  },
  (table) => [
    index('permissions_created_at_idx').on(table.created_at),
    index('permissions_created_by_idx').on(table.created_by),
    index('permissions_module_idx').on(table.module),
    uniqueIndex('permissions_action_module_idx').on(table.action, table.module),
    index('permissions_updated_at_idx').on(table.updated_at)
  ]
);

export type Permission = typeof permission.$inferSelect;
export type NewPermission = typeof permission.$inferInsert;
