import type { NextFunction, Request, Response } from 'express';

import { CustomError } from '@/src/utils/error';

import { commonHelper, permissionHelper } from '@/src/modules/helpers';
import { permissionService } from '@/src/modules/services';
import type { AuthRequest } from '@/src/modules/user/user.type';

export const permissionController = {
  createAPermission: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError(401, 'UNAUTHORIZED');
      }

      const newPermission = await permissionService.createAPermissionForMutation(req.body, {
        user_id: userId
      });
      res.status(201).json({ data: newPermission });
    } catch (err) {
      next(err);
    }
  },

  updateAPermission: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const updatedPermission = await permissionService.updateAPermissionForMutation(
        { entity_id: String(req.params.entity_id), data: req.body },
        { user_id: req.user?.id ?? '' }
      );
      res.json({ data: updatedPermission });
    } catch (err) {
      next(err);
    }
  },

  deleteAPermission: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedPermission = await permissionService.deleteAPermissionForMutation({
        entity_id: String(req.params.entity_id)
      });
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
