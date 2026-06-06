import { Router } from 'express';

import { authorizer } from '@/src/middlewares/authorizer';

import { roleUserController } from '@/src/modules/controllers';

const roleUserRouter: ReturnType<typeof Router> = Router();

/**
 * @swagger
 * /role-users:
 *   post:
 *     tags: [Role Users]
 *     summary: Assign a role to a user
 *     security: [{ tokenAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_id: { type: string, format: uuid }
 *               user_id: { type: string, format: uuid }
 *             required: [role_id, user_id]
 *     responses:
 *       201: { description: SUCCESS }
 *       400: { description: VALIDATION_ERROR }
 *       401: { description: UNAUTHORIZED }
 */
roleUserRouter.post('/', authorizer(['admin', 'developer']), roleUserController.createARoleUser);

/**
 * @swagger
 * /role-users:
 *   get:
 *     tags: [Role Users]
 *     summary: Get all role-user assignments
 *     security: [{ tokenAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *       - in: query
 *         name: role_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: user_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: exclude_entity_ids
 *         schema: { type: array, items: { type: string, format: uuid } }
 *       - in: query
 *         name: include_entity_ids
 *         schema: { type: array, items: { type: string, format: uuid } }
 *     responses:
 *       200: { description: SUCCESS }
 */
roleUserRouter.get('/', authorizer(['admin', 'developer']), roleUserController.getRoleUsers);

/**
 * @swagger
 * /role-users/{entity_id}:
 *   get:
 *     tags: [Role Users]
 *     summary: Get a role-user assignment by ID
 *     security: [{ tokenAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: SUCCESS }
 *       404: { description: ROLE_USER_NOT_FOUND }
 */
roleUserRouter.get(
  '/:entity_id',
  authorizer(['admin', 'developer']),
  roleUserController.getARoleUser
);

/**
 * @swagger
 * /role-users/{entity_id}:
 *   put:
 *     tags: [Role Users]
 *     summary: Update a role-user assignment
 *     security: [{ tokenAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_id: { type: string, format: uuid }
 *               user_id: { type: string, format: uuid }
 *     responses:
 *       200: { description: SUCCESS }
 *       400: { description: VALIDATION_ERROR }
 *       404: { description: ROLE_USER_NOT_FOUND }
 */
roleUserRouter.put(
  '/:entity_id',
  authorizer(['admin', 'developer']),
  roleUserController.updateARoleUser
);

/**
 * @swagger
 * /role-users/{entity_id}:
 *   delete:
 *     tags: [Role Users]
 *     summary: Delete a role-user assignment
 *     security: [{ tokenAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: SUCCESS }
 *       404: { description: ROLE_USER_NOT_FOUND }
 */
roleUserRouter.delete(
  '/:entity_id',
  authorizer(['admin', 'developer']),
  roleUserController.deleteARoleUser
);

export { roleUserRouter };
