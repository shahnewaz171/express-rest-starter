import { relations } from 'drizzle-orm';

import { user } from '@/src/modules/user/user.schema';

export const userRelations = relations(user, () => ({
  //
}));

// Export all schemas
export { user };
