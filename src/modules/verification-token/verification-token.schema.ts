import dayjs from 'dayjs';
import { index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

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
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    expires_at: timestamp('expires_at')
      .notNull()
      .$defaultFn(() => dayjs().add(5, 'minute').toDate()),
    status: verificationTokenStatusEnum('status').notNull().default('unverified'),
    token: text('token').notNull(),
    type: verificationTokenTypeEnum('type').notNull().default('user_verification'),
    user_id: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date())
  },
  (table) => [
    index('verification_tokens_user_type_created_idx').on(
      table.user_id,
      table.type,
      table.created_at
    ),
    index('verification_tokens_user_type_status_idx').on(table.user_id, table.type, table.status),
    index('verification_tokens_created_at_idx').on(table.created_at),
    index('verification_tokens_updated_at_idx').on(table.updated_at)
  ]
);

export type VerificationToken = typeof verificationToken.$inferSelect;
export type NewVerificationToken = typeof verificationToken.$inferInsert;
