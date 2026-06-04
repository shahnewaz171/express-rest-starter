import { and, eq, type SQL } from 'drizzle-orm';
import type { NextFunction, Response } from 'express';
import intersection from 'lodash/intersection';
import size from 'lodash/size';

import { CustomError } from '@/src/utils/error';

import * as authTokenHelper from '@/src/modules/auth-token/auth-token.helper';
import { authToken } from '@/src/modules/auth-token/auth-token.schema';
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

  // Ensure the access token still exists in the store. This makes logout and
  // password-change revocation take effect immediately instead of waiting for
  // the JWT to expire.
  const storedToken = await authTokenHelper.getAnAuthToken({
    where: and(eq(authToken.access_token, token), eq(authToken.user_id, jwtPayload.user_id)) as SQL
  });
  if (!storedToken?.id) {
    throw new CustomError(401, 'INVALID_TOKEN');
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
      const access_token = commonService.getTokenFromAuthorizationHeader(req);
      if (!access_token) {
        throw new CustomError(401, 'MISSING_TOKEN');
      }

      const authUser = await validateTokenAndGetAuthUser(access_token);
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
