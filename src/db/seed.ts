import { getTableName, sql, type Table } from 'drizzle-orm';

import { DB_SEEDING } from '@/src/utils/env';

import { type DB, db, pool } from '@/src/db';
import * as schema from '@/src/db/schema';
import * as seeds from '@/src/db/seeds';

if (!DB_SEEDING) {
  throw new Error('You must set DB_SEEDING to "true" when running seeds');
}

async function resetTables(database: DB, tables: Table[]) {
  const tableNames = tables.map((table) => getTableName(table)).join(', ');

  await database.execute(sql.raw(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`));
}

const startDBSeeding = async () => {
  try {
    console.log('Starting database seeding...');

    // Reset tables in the correct order to avoid foreign key constraint issues. Remember to adjust the order (child tables first) to remove relationships.
    await resetTables(db, [
      schema.authTemplate,
      schema.authToken,
      schema.verificationToken,
      schema.rolePermission,
      schema.roleUser,
      schema.permission,
      schema.role,
      schema.user
    ]);

    await seeds.authTemplate(db);
    const roles = await seeds.role(db);
    await seeds.permission(db);
    await seeds.rolePermission(db);
    await seeds.user(db, roles);

    console.log('Database seeding completed');
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit();
  } finally {
    await pool.end();
  }
};

await startDBSeeding();
