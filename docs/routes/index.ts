import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { registerPermissionRoutes } from '@/docs/routes/permission.routes';
import { registerRoleRoutes } from '@/docs/routes/role.routes';
import { registerRolePermissionRoutes } from '@/docs/routes/role-permission.routes';
import { registerRoleUserRoutes } from '@/docs/routes/role-user.routes';
import { registerUserRoutes } from '@/docs/routes/user.routes';

export const registerAllRoutes = (registry: OpenAPIRegistry) => {
  registerUserRoutes(registry);
  registerRoleRoutes(registry);
  registerPermissionRoutes(registry);
  registerRoleUserRoutes(registry);
  registerRolePermissionRoutes(registry);
};
