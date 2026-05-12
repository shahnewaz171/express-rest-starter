import { Router } from 'express';

import { authorizer } from '@/src/middlewares/authorizer';

import { roleController } from '@/src/modules/role/role.controller';

const roleRouter: ReturnType<typeof Router> = Router();

/**
 * @swagger
 * /roles:
 *   post:
 *     tags: [Roles]
 *     summary: Create a new role
 *     security: [{ tokenAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, enum: [admin, developer, moderator, user] }
 *             required: [name]
 *     responses:
 *       201: { description: SUCCESS }
 *       401: { description: UNAUTHORIZED }
 */
roleRouter.post('/', authorizer(['admin', 'developer']), roleController.createARole);

/**
 * @swagger
 * /roles/{entity_id}:
 *   put:
 *     tags: [Roles]
 *     summary: Update a role
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
 *               name: { type: string }
 *     responses:
 *       200: { description: SUCCESS }
 *       404: { description: ROLE_NOT_FOUND }
 */
roleRouter.put('/:entity_id', authorizer(['admin', 'developer']), roleController.updateARole);

/**
 * @swagger
 * /roles/{entity_id}:
 *   delete:
 *     tags: [Roles]
 *     summary: Delete a role
 *     security: [{ tokenAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: SUCCESS }
 *       404: { description: ROLE_NOT_FOUND }
 */
roleRouter.delete('/:entity_id', authorizer(['admin', 'developer']), roleController.deleteARole);

/**
 * @swagger
 * /roles:
 *   get:
 *     tags: [Roles]
 *     summary: Get all roles
 *     security: [{ tokenAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *       - in: query
 *         name: order
 *         schema: { type: string }
 *     responses:
 *       200: { description: SUCCESS }
 */
roleRouter.get('/', authorizer(['admin', 'developer']), roleController.getRoles);

/**
 * @swagger
 * /roles/{entity_id}:
 *   get:
 *     tags: [Roles]
 *     summary: Get a role by ID
 *     security: [{ tokenAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: SUCCESS }
 *       404: { description: ROLE_DOES_NOT_EXIST }
 */
roleRouter.get('/:entity_id', authorizer(['admin', 'developer']), roleController.getARole);

export { roleRouter };
