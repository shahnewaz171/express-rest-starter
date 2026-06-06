import type { NextFunction, Request, Response } from 'express';

import { CustomError } from '@/src/utils/error';

import {
  refreshTokenSchema,
  revokeAnAuthTokenSchema
} from '@/src/modules/auth-token/auth-token.validation';
import * as commonService from '@/src/modules/common/common.service';
import { emailSchema } from '@/src/modules/common/common.validation';
import * as userHelper from '@/src/modules/user/user.helper';
import * as userService from '@/src/modules/user/user.service';
import type { AuthRequest } from '@/src/modules/user/user.type';
import {
  changeEmailSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  getUsersQuerySchema,
  loginSchema,
  registerSchema,
  setUserPasswordByAdminSchema,
  verifyChangeEmailSchema,
  verifyForgotPasswordSchema,
  verifyUserEmailSchema,
  verifyUserPasswordSchema
} from '@/src/modules/user/user.validation';

import { useTransaction } from '@/src/db';

export const userController = {
  registerUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = registerSchema.safeParse(req.body || {});
      if (!parsed.success) {
        throw new CustomError(400, 'INVALID_INPUT', parsed.error.issues);
      }

      const data = await useTransaction(async (tx) => userService.registerUser(parsed.data, tx));
      res.status(201).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  verifyUserEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = verifyUserEmailSchema.safeParse(req.body || {});
      if (!parsed.success) {
        throw new CustomError(400, 'INVALID_INPUT', parsed.error.issues);
      }

      const data = await useTransaction(async (tx) => userService.verifyUserEmail(parsed.data, tx));
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  resendVerificationEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const emailParsed = emailSchema.safeParse(req.body?.email);
      if (!emailParsed.success) {
        throw new CustomError(400, 'EMAIL_REQUIRED');
      }

      const data = await useTransaction(async (tx) =>
        userService.resendUserVerificationEmail({ email: emailParsed.data }, tx)
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  loginUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = loginSchema.safeParse(req.body || {});
      if (!parsed.success) {
        throw new CustomError(400, 'INVALID_INPUT', parsed.error.issues);
      }

      const data = await useTransaction(async (tx) => userService.loginUser(parsed.data, tx));
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  getRefreshedTokens: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = refreshTokenSchema.safeParse(req.body || {});
      if (!parsed.success) {
        throw new CustomError(400, 'VALIDATION_ERROR', parsed.error.issues);
      }

      const { refresh_token, access_token } = parsed.data;
      const refreshParams =
        access_token === undefined ? { refresh_token } : { refresh_token, access_token };

      const data = await useTransaction(async (tx) =>
        userService.refreshTokensForUser(refreshParams, tx)
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  getAuthUser: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.user_id) {
        throw new CustomError(401, 'UNAUTHORIZED');
      }
      await Promise.resolve();
      res.status(200).json({ data: req.user, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  logoutUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const access_token = commonService.getTokenFromAuthorizationHeader(req);
      if (!access_token) {
        throw new CustomError(401, 'MISSING_TOKEN');
      }

      const parsed = revokeAnAuthTokenSchema.safeParse({
        token: access_token,
        type: 'access_token'
      });
      if (!parsed.success) {
        throw new CustomError(400, 'TOKEN_IS_INVALID');
      }

      const data = await useTransaction(async (tx) =>
        userService.logoutAUser({ access_token: parsed.data.token }, tx)
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  changeEmail: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = changeEmailSchema.safeParse({
        new_email: req.body?.email,
        user_id: req.user?.user_id || ''
      });
      if (!parsed.success) {
        throw new CustomError(400, 'VALIDATION_ERROR', parsed.error.issues);
      }

      const data = await useTransaction(async (tx) =>
        userService.changeEmailByUser(parsed.data, tx)
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  cancelChangeEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const emailParsed = emailSchema.safeParse(req.body?.email || '');
      if (!emailParsed.success) {
        throw new CustomError(400, 'INVALID_INPUT', emailParsed.error.issues);
      }

      const data = await useTransaction(async (tx) =>
        userService.cancelChangeEmailByUser({ email: emailParsed.data }, tx)
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  verifyNewEmail: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = verifyChangeEmailSchema.safeParse({
        token: req.body?.token,
        user_id: req.user?.user_id || ''
      });
      if (!parsed.success) {
        throw new CustomError(400, 'VALIDATION_ERROR', parsed.error.issues);
      }

      const data = await useTransaction(async (tx) =>
        userService.verifyChangeEmailByUser(parsed.data, tx)
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  setUserEmailByAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const emailParsed = emailSchema.safeParse(req.body?.new_email);
      if (!emailParsed.success) {
        throw new CustomError(400, 'INVALID_INPUT', emailParsed.error.issues);
      }

      const data = await useTransaction(async (tx) =>
        userService.setUserEmailByAdmin(
          { new_email: emailParsed.data, user_id: req.body?.user_id },
          tx
        )
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  changePassword: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = changePasswordSchema.safeParse({
        new_password: req.body?.new_password,
        old_password: req.body?.old_password,
        user_id: req.user?.user_id || ''
      });
      if (!parsed.success) {
        throw new CustomError(400, 'INVALID_INPUT', parsed.error.issues);
      }

      const data = await useTransaction(async (tx) =>
        userService.changePasswordByUser(parsed.data, tx)
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  setUserPasswordByAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = setUserPasswordByAdminSchema.safeParse(req.body || {});
      if (!parsed.success) {
        throw new CustomError(400, 'INVALID_INPUT', parsed.error.issues);
      }

      const data = await useTransaction(async (tx) =>
        userService.changePasswordByAdmin(parsed.data, tx)
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  tryForgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body || {});
      if (!parsed.success) {
        throw new CustomError(400, 'INVALID_INPUT', parsed.error.issues);
      }

      const data = await useTransaction(async (tx) => userService.forgotPassword(parsed.data, tx));
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  retryForgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body || {});
      if (!parsed.success) {
        throw new CustomError(400, 'INVALID_INPUT', parsed.error.issues);
      }

      const data = await useTransaction(async (tx) =>
        userService.retryForgotPassword(parsed.data, tx)
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  verifyForgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = verifyForgotPasswordSchema.safeParse(req.body || {});
      if (!parsed.success) {
        throw new CustomError(400, 'INVALID_INPUT', parsed.error.issues);
      }

      const data = await useTransaction(async (tx) =>
        userService.verifyForgotPassword(parsed.data, tx)
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  verifyForgotPasswordCode: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = verifyUserEmailSchema.safeParse(req.body || {});
      if (!parsed.success) {
        throw new CustomError(400, 'INVALID_INPUT', parsed.error.issues);
      }

      const data = await useTransaction(async (tx) =>
        userService.verifyForgotPasswordCode(parsed.data, tx)
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  verifyUserPassword: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = verifyUserPasswordSchema.safeParse({
        password: req.body?.password,
        user_id: req.user?.user_id || ''
      });
      if (!parsed.success) {
        throw new CustomError(400, 'INVALID_INPUT', parsed.error.issues);
      }

      const data = await useTransaction(async (tx) =>
        userService.verifyUserPassword(parsed.data, tx)
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  getUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = getUsersQuerySchema.safeParse(req.query || {});
      if (!parsed.success) {
        throw new CustomError(400, 'INVALID_INPUT', parsed.error.issues);
      }

      const { limit, offset, ...queryParams } = parsed.data;
      const data = await userHelper.getUsersForQuery(queryParams, { limit, offset });
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  getAUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await userHelper.getAUserForQuery({ entity_id: String(req.params.entity_id) });
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  }
};
