import { sql } from 'drizzle-orm';
import { index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { user } from '@/src/modules/user/user.schema';

export const verificationTokenStatusEnum = pgEnum('verification_token_status', [
  'cancelled',
  'verified',
  'unverified'
]);
export const verificationTokenTypeEnum = pgEnum('verification_token_type', [
  'forgot_password',
  'user_verification'
]);

export const verificationToken = pgTable(
  'verification_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    expired_at: timestamp('expired_at').notNull().default(sql`NOW() + INTERVAL '5 minutes'`),
    status: verificationTokenStatusEnum('status').notNull().default('unverified'),
    token: text('token').notNull(),
    type: verificationTokenTypeEnum('type').notNull().default('user_verification'),
    user_id: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow()
  },
  (table) => [
    uniqueIndex('verification_tokens_id_idx').on(table.id),
    index('verification_tokens_email_token_user_id_idx').on(
      table.email,
      table.token,
      table.user_id
    ),
    index('verification_tokens_created_at_idx').on(table.created_at),
    index('verification_tokens_updated_at_idx').on(table.updated_at)
  ]
);

export type VerificationToken = typeof verificationToken.$inferSelect;
export type NewVerificationToken = typeof verificationToken.$inferInsert;
