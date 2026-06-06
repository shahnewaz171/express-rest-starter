import { Router } from 'express';

import { authorizer } from '@/src/middlewares/authorizer';

import { permissionController } from '@/src/modules/permission/permission.controller';

const permissionRouter: ReturnType<typeof Router> = Router();

/**
 * @swagger
 * /permissions:
 *   post:
 *     tags: [Permissions]
 *     summary: Create a new permission
 *     security: [{ tokenAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action: { type: string, enum: [create, read, update, delete] }
 *               module: { type: string, enum: [permission, role, role_permission, role_user, user] }
 *             required: [action, module]
 *     responses:
 *       201: { description: SUCCESS }
 *       400: { description: VALIDATION_ERROR }
 *       401: { description: UNAUTHORIZED }
 *       409: { description: PERMISSION_ALREADY_EXISTS }
 */
permissionRouter.post(
  '/',
  authorizer(['admin', 'developer']),
  permissionController.createAPermission
);

/**
 * @swagger
 * /permissions/{entity_id}:
 *   put:
 *     tags: [Permissions]
 *     summary: Update a permission
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
 *               action: { type: string, enum: [create, read, update, delete] }
 *               module: { type: string, enum: [permission, role, role_permission, role_user, user] }
 *     responses:
 *       200: { description: SUCCESS }
 *       400: { description: VALIDATION_ERROR }
 *       404: { description: PERMISSION_NOT_FOUND }
 */
permissionRouter.put(
  '/:entity_id',
  authorizer(['admin', 'developer']),
  permissionController.updateAPermission
);

/**
 * @swagger
 * /permissions/{entity_id}:
 *   delete:
 *     tags: [Permissions]
 *     summary: Delete a permission
 *     security: [{ tokenAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: SUCCESS }
 *       404: { description: PERMISSION_NOT_FOUND }
 */
permissionRouter.delete(
  '/:entity_id',
  authorizer(['admin', 'developer']),
  permissionController.deleteAPermission
);

/**
 * @swagger
 * /permissions:
 *   get:
 *     tags: [Permissions]
 *     summary: Get all permissions
 *     security: [{ tokenAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *       - in: query
 *         name: action
 *         schema: { type: string, enum: [create, read, update, delete] }
 *       - in: query
 *         name: module
 *         schema: { type: string, enum: [permission, role, role_permission, role_user, user] }
 *       - in: query
 *         name: exclude_entity_ids
 *         schema: { type: array, items: { type: string, format: uuid } }
 *       - in: query
 *         name: include_entity_ids
 *         schema: { type: array, items: { type: string, format: uuid } }
 *     responses:
 *       200: { description: SUCCESS }
 */
permissionRouter.get('/', authorizer(['admin', 'developer']), permissionController.getPermissions);

/**
 * @swagger
 * /permissions/{entity_id}:
 *   get:
 *     tags: [Permissions]
 *     summary: Get a permission by ID
 *     security: [{ tokenAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: SUCCESS }
 *       404: { description: PERMISSION_DOES_NOT_EXIST }
 */
permissionRouter.get(
  '/:entity_id',
  authorizer(['admin', 'developer']),
  permissionController.getAPermission
);

export { permissionRouter };
