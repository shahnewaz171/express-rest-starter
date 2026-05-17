import { index, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { role } from '@/src/modules/role/role.schema';
import { user } from '@/src/modules/user/user.schema';

export const roleUser = pgTable(
  'role_users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    role_id: uuid('role_id')
      .notNull()
      .references(() => role.id, { onDelete: 'cascade' }),
    user_id: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow()
  },
  (table) => [
    uniqueIndex('role_users_role_id_user_id_idx').on(table.role_id, table.user_id),
    index('role_users_created_at_idx').on(table.created_at),
    index('role_users_updated_at_idx').on(table.updated_at)
  ]
);

export type RoleUser = typeof roleUser.$inferSelect;
export type NewRoleUser = typeof roleUser.$inferInsert;
