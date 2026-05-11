import { getTableName, sql, type Table } from 'drizzle-orm';

import { DB_SEEDING } from '@/src/utils/env';

import { client, type DB, db } from '@/src/db';
import * as schema from '@/src/db/schema';
import * as seeds from '@/src/db/seeds';

if (!DB_SEEDING) {
  throw new Error('You must set DB_SEEDING to "true" when running seeds');
}

async function resetTables(database: DB, tables: Table[]) {
  const tableNames = tables.map((table) => getTableName(table)).join(', ');

  await database.execute(sql.raw(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`));
}

// Start the database seeding and reset tables before seeding
const startDBSeeding = async () => {
  try {
    console.log('Starting database seeding...');

    // Reset all tables before seeding
    await resetTables(db, [schema.user]);

    // Start database seeding
    await seeds.user(db);

    console.log('Database seeding completed');
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit();
  } finally {
    // Close the database connection after seeding
    await client.end();
  }
};

await startDBSeeding();
