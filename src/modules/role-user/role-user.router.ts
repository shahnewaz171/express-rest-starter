import { Router } from 'express';

import { authorizer } from '@/src/middlewares/authorizer';

import { roleUserController } from '@/src/modules/controllers';

const roleUserRouter: ReturnType<typeof Router> = Router();

roleUserRouter.post('/', authorizer(['admin', 'developer']), roleUserController.createARoleUser);
roleUserRouter.get('/', authorizer(['admin', 'developer']), roleUserController.getRoleUsers);
roleUserRouter.get(
  '/:entity_id',
  authorizer(['admin', 'developer']),
  roleUserController.getARoleUser
);
roleUserRouter.put(
  '/:entity_id',
  authorizer(['admin', 'developer']),
  roleUserController.updateARoleUser
);
roleUserRouter.delete(
  '/:entity_id',
  authorizer(['admin', 'developer']),
  roleUserController.deleteARoleUser
);

export { roleUserRouter };
