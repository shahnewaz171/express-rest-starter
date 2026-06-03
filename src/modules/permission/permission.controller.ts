import type { NextFunction, Request, Response } from 'express';

import { CustomError } from '@/src/utils/error';

import * as commonHelper from '@/src/modules/common/common.helper';
import * as permissionHelper from '@/src/modules/permission/permission.helper';
import * as permissionService from '@/src/modules/permission/permission.service';
import type { AuthRequest } from '@/src/modules/user/user.type';

import { useTransaction } from '@/src/db';

export const permissionController = {
  createAPermission: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError(401, 'UNAUTHORIZED');
      }
      const newPermission = await useTransaction(async (tx) =>
        permissionService.createAPermissionForMutation(
          req.body,
          {
            user_id: userId
          },
          tx
        )
      );
      res.status(201).json({ data: newPermission });
    } catch (err) {
      next(err);
    }
  },

  updateAPermission: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const updatedPermission = await useTransaction(async (tx) =>
        permissionService.updateAPermissionForMutation(
          { entity_id: String(req.params.entity_id), data: req.body },
          { user_id: req.user?.id ?? '' },
          tx
        )
      );
      res.json({ data: updatedPermission });
    } catch (err) {
      next(err);
    }
  },

  deleteAPermission: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedPermission = await useTransaction(async (tx) =>
        permissionService.deleteAPermissionForMutation(
          {
            entity_id: String(req.params.entity_id)
          },
          tx
        )
      );
      res.json({ data: deletedPermission });
    } catch (err) {
      next(err);
    }
  },

  getPermissions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, offset } = commonHelper.getOptionsFromQuery(
        req.query as Record<string, string | undefined>
      );
      const { data, meta_data } = await permissionHelper.getPermissionsForQuery(
        req.query as Record<string, string | string[] | undefined>,
        {
          limit,
          offset
        }
      );

      res.json({
        data,
        meta_data
      });
    } catch (err) {
      next(err);
    }
  },

  getAPermission: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const foundPermission = await permissionHelper.getAPermissionForQuery({
        entity_id: String(req.params.entity_id)
      });

      res.json({ data: foundPermission });
    } catch (err) {
      next(err);
    }
  }
};
