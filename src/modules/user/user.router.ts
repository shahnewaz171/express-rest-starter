import { Router } from 'express';

import { authorizer } from '@/src/middlewares/authorizer';

import { userController } from '@/src/modules/controllers';

export const userRouter: ReturnType<typeof Router> = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Users]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               first_name: { type: string, minLength: 1 }
 *               last_name: { type: string, minLength: 1 }
 *             required: [email, password, first_name, last_name]
 *     responses:
 *       201: { description: SUCCESS }
 *       400: { description: INVALID_INPUT }
 */
userRouter.post('/register', userController.registerUser);

/**
 * @swagger
 * /auth/verify-user-email:
 *   post:
 *     tags: [Users]
 *     summary: Verify user email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *               token: { type: string, minLength: 6 }
 *             required: [email, token]
 *     responses:
 *       200: { description: SUCCESS }
 *       400: { description: INVALID_INPUT }
 */
userRouter.post('/verify-user-email', userController.verifyUserEmail);

/**
 * @swagger
 * /auth/resend-verification-email:
 *   post:
 *     tags: [Users]
 *     summary: Resend verification email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *             required: [email]
 *     responses:
 *       200: { description: SUCCESS }
 *       400: { description: EMAIL_REQUIRED }
 */
userRouter.post('/resend-verification-email', userController.resendVerificationEmail);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Users]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 1 }
 *             required: [email, password]
 *     responses:
 *       200: { description: SUCCESS }
 *       400: { description: INVALID_INPUT }
 */
userRouter.post('/login', userController.loginUser);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     tags: [Users]
 *     summary: Refresh user tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               access_token: { type: string, minLength: 1 }
 *               refresh_token: { type: string, minLength: 1 }
 *             required: [refresh_token]
 *     responses:
 *       200: { description: SUCCESS }
 *       400: { description: VALIDATION_ERROR }
 */
userRouter.post('/refresh-token', userController.getRefreshedTokens);

/**
 * @swagger
 * /auth/user:
 *   get:
 *     tags: [Users]
 *     summary: Get authenticated user
 *     security: [{ tokenAuth: [] }]
 *     responses:
 *       200: { description: SUCCESS }
 *       401: { description: UNAUTHORIZED }
 */
userRouter.get('/user', authorizer(), userController.getAuthUser);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Users]
 *     summary: Logout user
 *     security: [{ tokenAuth: [] }]
 *     responses:
 *       200: { description: SUCCESS }
 *       401: { description: MISSING_TOKEN }
 */
userRouter.post('/logout', authorizer(), userController.logoutUser);

/**
 * @swagger
 * /auth/change-email:
 *   post:
 *     tags: [Users]
 *     summary: Change user email
 *     security: [{ tokenAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *             required: [email]
 *     responses:
 *       200: { description: SUCCESS }
 *       400: { description: VALIDATION_ERROR }
 */
userRouter.post('/change-email', authorizer(), userController.changeEmail);

/**
 * @swagger
 * /auth/cancel-change-email:
 *   post:
 *     tags: [Users]
 *     summary: Cancel email change
 *     security: [{ tokenAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *             required: [email]
 *     responses:
 *       200: { description: SUCCESS }
 *       400: { description: INVALID_INPUT }
 */
userRouter.post('/cancel-change-email', authorizer(), userController.cancelChangeEmail);

/**
 * @swagger
 * /auth/verify-change-email:
 *   post:
 *     tags: [Users]
 *     summary: Verify new email
 *     security: [{ tokenAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token: { type: string, minLength: 6 }
 *             required: [token]
 *     responses:
 *       200: { description: SUCCESS }
 *       400: { description: VALIDATION_ERROR }
 */
userRouter.post('/verify-change-email', authorizer(), userController.verifyNewEmail);

/**
 * @swagger
 * /auth/set-user-email:
 *   post:
 *     tags: [Users]
 *     summary: Set user email by admin
 *     security: [{ tokenAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               new_email: { type: string, format: email }
 *               user_id: { type: string, format: uuid }
 *             required: [new_email, user_id]
 *     responses:
 *       200: { description: SUCCESS }
 *       400: { description: INVALID_INPUT }
 *       401: { description: UNAUTHORIZED }
 */
userRouter.post('/set-user-email', authorizer(['admin']), userController.setUserEmailByAdmin);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     tags: [Users]
 *     summary: Change user password
 *     security: [{ tokenAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               old_password: { type: string, minLength: 1 }
 *               new_password: { type: string, minLength: 8 }
 *             required: [old_password, new_password]
 *     responses:
 *       200: { description: SUCCESS }
 *       400: { description: INVALID_INPUT }
 */
userRouter.post('/change-password', authorizer(), userController.changePassword);

/**
 * @swagger
 * /auth/set-user-password:
 *   post:
 *     tags: [Users]
 *     summary: Set user password by admin
 *     security: [{ tokenAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id: { type: string, format: uuid }
 *               password: { type: string, minLength: 8 }
 *             required: [user_id, password]
 *     responses:
 *       200: { description: SUCCESS }
 *       400: { description: INVALID_INPUT }
 *       401: { description: UNAUTHORIZED }
 */
userRouter.post('/set-user-password', authorizer(['admin']), userController.setUserPasswordByAdmin);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Users]
 *     summary: Request forgot password email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *             required: [email]
 *     responses:
 *       200: { description: SUCCESS }
 *       400: { description: INVALID_INPUT }
 */
userRouter.post('/forgot-password', userController.tryForgotPassword);

/**
 * @swagger
 * /auth/retry-forgot-password:
 *   post:
 *     tags: [Users]
 *     summary: Retry forgot password email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *             required: [email]
 *     responses:
 *       200: { description: SUCCESS }
 *       400: { description: INVALID_INPUT }
 */
userRouter.post('/retry-forgot-password', userController.retryForgotPassword);

/**
 * @swagger
 * /auth/verify-forgot-password:
 *   post:
 *     tags: [Users]
 *     summary: Reset password with forgot password token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               token: { type: string, minLength: 1 }
 *             required: [email, password, token]
 *     responses:
 *       200: { description: SUCCESS }
 *       400: { description: INVALID_INPUT }
 */
userRouter.post('/verify-forgot-password', userController.verifyForgotPassword);

/**
 * @swagger
 * /auth/verify-forgot-password-code:
 *   post:
 *     tags: [Users]
 *     summary: Verify forgot password OTP code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *               token: { type: string, minLength: 6 }
 *             required: [email, token]
 *     responses:
 *       200: { description: SUCCESS }
 *       400: { description: INVALID_INPUT }
 */
userRouter.post('/verify-forgot-password-code', userController.verifyForgotPasswordCode);

/**
 * @swagger
 * /auth/verify-user-password:
 *   post:
 *     tags: [Users]
 *     summary: Verify current user password
 *     security: [{ tokenAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password: { type: string, minLength: 8 }
 *             required: [password]
 *     responses:
 *       200: { description: SUCCESS }
 *       400: { description: INVALID_INPUT }
 */
userRouter.post('/verify-user-password', authorizer(), userController.verifyUserPassword);

/**
 * @swagger
 * /auth/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     security: [{ tokenAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, minimum: 0, default: 0 }
 *       - in: query
 *         name: email
 *         schema: { type: string, format: email }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive, invited, unverified] }
 *       - in: query
 *         name: search_keyword
 *         schema: { type: string }
 *       - in: query
 *         name: exclude_entity_ids
 *         schema: { type: array, items: { type: string, format: uuid } }
 *       - in: query
 *         name: include_entity_ids
 *         schema: { type: array, items: { type: string, format: uuid } }
 *     responses:
 *       200: { description: SUCCESS }
 *       400: { description: INVALID_INPUT }
 */
userRouter.get('/users', authorizer(['admin', 'developer']), userController.getUsers);

/**
 * @swagger
 * /auth/users/{entity_id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by ID
 *     security: [{ tokenAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: SUCCESS }
 *       404: { description: USER_DOES_NOT_EXIST }
 */
userRouter.get('/users/:entity_id', authorizer(['admin', 'developer']), userController.getAUser);
