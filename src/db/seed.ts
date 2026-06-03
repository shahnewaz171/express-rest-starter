import { getTableName, sql, type Table } from 'drizzle-orm';

import { DB_SEEDING } from '@/src/utils/env';

import { type DB, db, pool } from '@/src/db';
import * as schema from '@/src/db/schema';
import * as seeds from '@/src/db/seeds';

if (DB_SEEDING !== 'true') {
  throw new Error('You must set DB_SEEDING to "true" when running seeds');
}

async function resetTables(database: DB, tables: Table[]) {
  const tableNames = tables
    .map((table) => `"${getTableName(table).replace(/"/g, '""')}"`)
    .join(', ');

  await database.execute(sql.raw(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`));
}

const startDBSeeding = async () => {
  try {
    console.log('Starting database seeding...');

    // Reset tables in the correct order to avoid foreign key constraint issues. Remember to adjust the order (child tables first) to remove relationships.
    await db.transaction(async (tx) => {
      await resetTables(tx, [
        schema.authTemplate,
        schema.authToken,
        schema.verificationToken,
        schema.rolePermission,
        schema.roleUser,
        schema.permission,
        schema.role,
        schema.user
      ]);

      await seeds.authTemplate(tx);
      await seeds.role(tx);
      await seeds.permission(tx);
      await seeds.rolePermission(tx);
      await seeds.user(tx);
    });

    console.log('Database seeding completed');
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

await startDBSeeding();
