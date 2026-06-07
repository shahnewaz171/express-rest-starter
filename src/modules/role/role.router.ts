import { Router } from 'express';

import { authorizer } from '@/src/middlewares/authorizer';

import { roleController } from '@/src/modules/role/role.controller';

const roleRouter: ReturnType<typeof Router> = Router();

roleRouter.post('/', authorizer(['admin', 'developer']), roleController.createARole);

roleRouter.put('/:entity_id', authorizer(['admin', 'developer']), roleController.updateARole);

roleRouter.delete('/:entity_id', authorizer(['admin', 'developer']), roleController.deleteARole);

roleRouter.get('/', authorizer(['admin', 'developer']), roleController.getRoles);

roleRouter.get('/:entity_id', authorizer(['admin', 'developer']), roleController.getARole);

export { roleRouter };
