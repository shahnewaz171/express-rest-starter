import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { user } from '@/src/modules/user/user.schema';

export const authToken = pgTable(
  'auth_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    access_token: text('access_token').notNull(),
    refresh_token: text('refresh_token'),
    expires_at: timestamp('expires_at'),
    user_id: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow()
  },
  (table) => [
    uniqueIndex('auth_tokens_id_idx').on(table.id),
    uniqueIndex('auth_tokens_access_token_user_id_idx').on(table.access_token, table.user_id),
    index('auth_tokens_created_at_idx').on(table.created_at),
    index('auth_tokens_refresh_token_idx').on(table.refresh_token),
    index('auth_tokens_updated_at_idx').on(table.updated_at)
  ]
);

export type AuthToken = typeof authToken.$inferSelect;
export type NewAuthToken = typeof authToken.$inferInsert;
