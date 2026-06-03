import type { NextFunction, Response } from 'express';
import intersection from 'lodash/intersection';
import size from 'lodash/size';

import { CustomError } from '@/src/utils/error';

import * as commonService from '@/src/modules/common/common.service';
import type { RoleName } from '@/src/modules/role/role.type';
import * as userHelper from '@/src/modules/user/user.helper';
import type { AuthRequest } from '@/src/modules/user/user.type';

export const validateTokenAndGetAuthUser = async (token: string) => {
  const { payload } = commonService.verifyJWTToken(token) || {};
  if (!payload || typeof payload !== 'object' || !('user_id' in payload)) {
    throw new CustomError(401, 'INVALID_TOKEN');
  }

  const jwtPayload = payload as { user_id: string; roles?: string[] };
  if (!jwtPayload.user_id) {
    throw new CustomError(401, 'UNAUTHORIZED');
  }

  return await userHelper.getAuthUserWithRolesAndPermissions({
    roles: (jwtPayload.roles ?? []) as RoleName[],
    user_id: jwtPayload.user_id
  });
};

export const authorizer =
  (requiredRoles: string[] = ['admin', 'developer', 'moderator', 'user']) =>
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      const token = req.headers?.authorization || '';
      if (!token) {
        throw new CustomError(401, 'MISSING_TOKEN');
      }

      const authUser = await validateTokenAndGetAuthUser(token);
      req.user = authUser as AuthRequest['user'];

      if (requiredRoles.length > 0 && !size(intersection(requiredRoles, authUser?.roles))) {
        throw new CustomError(401, 'MISSING_REQUIRED_ROLES');
      }

      return next();
    } catch (err: unknown) {
      const error = err as { statusCode?: number };
      error.statusCode = error?.statusCode || 401;
      next(err);
    }
  };
