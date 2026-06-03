import type { NextFunction, Request, Response } from 'express';

import { CustomError } from '@/src/utils/error';

import { commonHelper, roleHelper } from '@/src/modules/helpers';
import { roleService } from '@/src/modules/services';
import type { AuthRequest } from '@/src/modules/user/user.type';

import { useTransaction } from '@/src/db';

export const roleController = {
  createARole: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError(401, 'UNAUTHORIZED');
      }

      const newRole = await useTransaction(async (tx) =>
        roleService.createARoleForMutation(req.body, { user_id: userId }, tx)
      );
      res.status(201).json({ data: newRole });
    } catch (err) {
      next(err);
    }
  },

  updateARole: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const updatedRole = await useTransaction(async (tx) =>
        roleService.updateARoleForMutation(
          { entity_id: String(req.params.entity_id), data: req.body },
          { user_id: req.user?.id ?? '' },
          tx
        )
      );
      res.json({ data: updatedRole });
    } catch (err) {
      next(err);
    }
  },

  deleteARole: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedRole = await useTransaction(async (tx) =>
        roleService.deleteARoleForMutation(
          {
            entity_id: String(req.params.entity_id)
          },
          tx
        )
      );
      res.json({ data: deletedRole });
    } catch (err) {
      next(err);
    }
  },

  getRoles: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, offset } = commonHelper.getOptionsFromQuery(
        req.query as Record<string, string | undefined>
      );
      const { data, meta_data } = await roleHelper.getRolesForQuery(
        req.query as Record<string, string | string[] | undefined>,
        { limit, offset }
      );

      res.json({
        data,
        meta_data
      });
    } catch (err) {
      next(err);
    }
  },

  getARole: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const foundRole = await roleHelper.getARoleForQuery({
        entity_id: String(req.params.entity_id)
      });
      if (!foundRole) {
        throw new CustomError(404, 'ROLE_NOT_FOUND');
      }

      res.json({ data: foundRole });
    } catch (err) {
      next(err);
    }
  }
};
