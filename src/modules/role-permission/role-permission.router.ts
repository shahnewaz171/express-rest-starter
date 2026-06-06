import { Router } from 'express';

import { authorizer } from '@/src/middlewares/authorizer';

import { rolePermissionController } from '@/src/modules/controllers';

const rolePermissionRouter: ReturnType<typeof Router> = Router();

/**
 * @swagger
 * /role-permissions:
 *   post:
 *     tags: [Role Permissions]
 *     summary: Create a role permission
 *     security: [{ tokenAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_id: { type: string, format: uuid }
 *               permission_id: { type: string, format: uuid }
 *               can_do_the_action: { type: boolean }
 *             required: [role_id, permission_id]
 *     responses:
 *       201: { description: SUCCESS }
 *       400: { description: VALIDATION_ERROR }
 *       401: { description: UNAUTHORIZED }
 */
rolePermissionRouter.post(
  '/',
  authorizer(['admin', 'developer']),
  rolePermissionController.createARolePermission
);

/**
 * @swagger
 * /role-permissions:
 *   get:
 *     tags: [Role Permissions]
 *     summary: Get all role permissions
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
 *         name: permission_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: can_do_the_action
 *         schema: { type: boolean }
 *       - in: query
 *         name: exclude_entity_ids
 *         schema: { type: array, items: { type: string, format: uuid } }
 *       - in: query
 *         name: include_entity_ids
 *         schema: { type: array, items: { type: string, format: uuid } }
 *     responses:
 *       200: { description: SUCCESS }
 */
rolePermissionRouter.get(
  '/',
  authorizer(['admin', 'developer']),
  rolePermissionController.getRolePermissions
);

/**
 * @swagger
 * /role-permissions/{entity_id}:
 *   get:
 *     tags: [Role Permissions]
 *     summary: Get a role permission by ID
 *     security: [{ tokenAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: SUCCESS }
 *       404: { description: ROLE_PERMISSION_NOT_FOUND }
 */
rolePermissionRouter.get(
  '/:entity_id',
  authorizer(['admin', 'developer']),
  rolePermissionController.getARolePermission
);

/**
 * @swagger
 * /role-permissions/{entity_id}:
 *   put:
 *     tags: [Role Permissions]
 *     summary: Update a role permission
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
 *               can_do_the_action: { type: boolean }
 *             required: [can_do_the_action]
 *     responses:
 *       200: { description: SUCCESS }
 *       400: { description: VALIDATION_ERROR }
 *       404: { description: ROLE_PERMISSION_NOT_FOUND }
 */
rolePermissionRouter.put(
  '/:entity_id',
  authorizer(['admin', 'developer']),
  rolePermissionController.updateARolePermission
);

/**
 * @swagger
 * /role-permissions/{entity_id}:
 *   delete:
 *     tags: [Role Permissions]
 *     summary: Delete a role permission
 *     security: [{ tokenAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: SUCCESS }
 *       404: { description: ROLE_PERMISSION_NOT_FOUND }
 */
rolePermissionRouter.delete(
  '/:entity_id',
  authorizer(['admin', 'developer']),
  rolePermissionController.deleteARolePermission
);

export { rolePermissionRouter };
