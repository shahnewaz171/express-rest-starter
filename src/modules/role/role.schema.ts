import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { user } from '@/src/modules/user/user.schema';

export const role = pgTable(
  'roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull().unique(),
    created_by: uuid('created_by').references(() => user.id, { onDelete: 'set null' }),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow()
  },
  (table) => [
    uniqueIndex('roles_id_idx').on(table.id),
    uniqueIndex('roles_name_idx').on(table.name),
    index('roles_created_at_idx').on(table.created_at),
    index('roles_created_by_idx').on(table.created_by),
    index('roles_updated_at_idx').on(table.updated_at)
  ]
);

export type Role = typeof role.$inferSelect;
export type NewRole = typeof role.$inferInsert;
