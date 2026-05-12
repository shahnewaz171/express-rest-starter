import { Router } from 'express';

import { authorizer } from '@/src/middlewares/authorizer';

import { rolePermissionController } from '@/src/modules/controllers';

const rolePermissionRouter: ReturnType<typeof Router> = Router();

rolePermissionRouter.post(
  '/',
  authorizer(['admin', 'developer']),
  rolePermissionController.createARolePermission
);
rolePermissionRouter.get(
  '/',
  authorizer(['admin', 'developer']),
  rolePermissionController.getRolePermissions
);
rolePermissionRouter.get(
  '/:entity_id',
  authorizer(['admin', 'developer']),
  rolePermissionController.getARolePermission
);
rolePermissionRouter.put(
  '/:entity_id',
  authorizer(['admin', 'developer']),
  rolePermissionController.updateARolePermission
);
rolePermissionRouter.delete(
  '/:entity_id',
  authorizer(['admin', 'developer']),
  rolePermissionController.deleteARolePermission
);

export { rolePermissionRouter };
