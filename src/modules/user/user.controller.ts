import type { NextFunction, Request, Response } from 'express';

import { CustomError } from '@/src/utils/error';

import * as commonService from '@/src/modules/common/common.service';
import * as userHelper from '@/src/modules/user/user.helper';
import * as userService from '@/src/modules/user/user.service';
import type { AuthRequest } from '@/src/modules/user/user.type';
import { getUsersQuerySchema } from '@/src/modules/user/user.validation';

import { useTransaction } from '@/src/db';

export const userController = {
  registerUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) => userService.registerUser(req.body, tx));
      res.status(201).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  verifyUserEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) => userService.verifyUserEmail(req.body, tx));
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  resendVerificationEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) =>
        userService.resendUserVerificationEmail(req.body, tx)
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  loginUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) => userService.loginUser(req.body, tx));
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  getRefreshedTokens: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) =>
        userService.refreshTokensForUser(req.body, tx)
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

      const data = await useTransaction(async (tx) =>
        userService.logoutAUser({ access_token }, tx)
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  changeEmail: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) =>
        userService.changeEmailByUser(
          { new_email: req.body?.email, user_id: req.user?.user_id || '' },
          tx
        )
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  cancelChangeEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) =>
        userService.cancelChangeEmailByUser({ email: req.body?.email || '' }, tx)
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  verifyNewEmail: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) =>
        userService.verifyChangeEmailByUser(
          { token: req.body?.token, user_id: req.user?.user_id || '' },
          tx
        )
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  setUserEmailByAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) =>
        userService.setUserEmailByAdmin(req.body, tx)
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  changePassword: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) =>
        userService.changePasswordByUser(
          {
            new_password: req.body?.new_password,
            old_password: req.body?.old_password,
            user_id: req.user?.user_id || ''
          },
          tx
        )
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  setUserPasswordByAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) =>
        userService.changePasswordByAdmin(req.body, tx)
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  tryForgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) => userService.forgotPassword(req.body, tx));
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  retryForgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) =>
        userService.retryForgotPassword(req.body, tx)
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  verifyForgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) =>
        userService.verifyForgotPassword(req.body, tx)
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  verifyForgotPasswordCode: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) =>
        userService.verifyForgotPasswordCode(req.body, tx)
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  verifyUserPassword: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) =>
        userService.verifyUserPassword(
          { password: req.body?.password, user_id: req.user?.user_id || '' },
          tx
        )
      );
      res.status(200).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  getUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = getUsersQuerySchema.safeParse(req.query);
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
