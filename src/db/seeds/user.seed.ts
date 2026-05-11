import { generateHashPassword } from '@/src/modules/common/common.service';
import type { UserStatus } from '@/src/modules/user/user.schema';

import type { DB } from '@/src/db';
import * as schema from '@/src/db/schema';
import users from '@/src/db/seeds/data/users.json' with { type: 'json' };

export default async function seed(db: DB) {
  await db.insert(schema.user).values(
    users.map((user) => ({
      ...user,
      password: generateHashPassword(user.password),
      status: user.status as UserStatus
    }))
  );
}
