import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { user } from '@/src/modules/user/user.schema';

export const authTemplate = pgTable(
  'auth_templates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    body: text('body').notNull(),
    event: text('event').notNull().unique(),
    subject: text('subject').notNull(),
    created_by: uuid('created_by').references(() => user.id, { onDelete: 'set null' }),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow()
  },
  (table) => [
    uniqueIndex('auth_templates_id_idx').on(table.id),
    index('auth_templates_created_at_idx').on(table.created_at),
    index('auth_templates_created_by_idx').on(table.created_by),
    index('auth_templates_subject_idx').on(table.subject),
    index('auth_templates_updated_at_idx').on(table.updated_at)
  ]
);

export type AuthTemplate = typeof authTemplate.$inferSelect;
export type NewAuthTemplate = typeof authTemplate.$inferInsert;
