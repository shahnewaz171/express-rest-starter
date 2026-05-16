import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from 'drizzle-orm/pg-core';

export const userStatusEnum = pgEnum('status', ['active', 'inactive', 'invited', 'unverified']);
export type UserStatus = (typeof userStatusEnum.enumValues)[number];

export const user = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    first_name: text('first_name'),
    last_name: text('last_name'),
    new_email: text('new_email'),
    phone_number: text('phone_number'),
    password: text('password'),
    old_passwords: jsonb('old_passwords').$type<string[]>().notNull().default([]),
    status: userStatusEnum('status').notNull().default('unverified'),
    image: text('image'),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
    last_login_at: timestamp('last_login_at')
  },
  (table) => [
    uniqueIndex('users_id_idx').on(table.id),
    uniqueIndex('users_email_idx').on(table.email),
    index('users_name_idx').on(table.first_name, table.last_name),
    index('users_status_idx').on(table.status),
    index('users_created_at_idx').on(table.created_at),
    index('users_updated_at_idx').on(table.updated_at)
  ]
);
