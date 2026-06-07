import { Router } from 'express';

import { authorizer } from '@/src/middlewares/authorizer';

import { permissionController } from '@/src/modules/permission/permission.controller';

const permissionRouter: ReturnType<typeof Router> = Router();

permissionRouter.post(
  '/',
  authorizer(['admin', 'developer']),
  permissionController.createAPermission
);

permissionRouter.put(
  '/:entity_id',
  authorizer(['admin', 'developer']),
  permissionController.updateAPermission
);

permissionRouter.delete(
  '/:entity_id',
  authorizer(['admin', 'developer']),
  permissionController.deleteAPermission
);

permissionRouter.get('/', authorizer(['admin', 'developer']), permissionController.getPermissions);

permissionRouter.get(
  '/:entity_id',
  authorizer(['admin', 'developer']),
  permissionController.getAPermission
);

export { permissionRouter };
