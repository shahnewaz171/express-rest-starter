import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { user } from '@/src/modules/user/user.schema';

export const permission = pgTable(
  'permissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    action: text('action').notNull(),
    module: text('module').notNull(),
    created_by: uuid('created_by').references(() => user.id),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow()
  },
  (table) => [
    uniqueIndex('permissions_id_idx').on(table.id),
    uniqueIndex('permissions_action_module_idx').on(table.action, table.module),
    index('permissions_created_at_idx').on(table.created_at),
    index('permissions_created_by_idx').on(table.created_by),
    index('permissions_action_idx').on(table.action),
    index('permissions_module_idx').on(table.module),
    index('permissions_updated_at_idx').on(table.updated_at)
  ]
);

export type Permission = typeof permission.$inferSelect;
export type NewPermission = typeof permission.$inferInsert;
