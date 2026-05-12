import type { NextFunction, Request, Response } from 'express';

import { getOptionsFromQuery } from '@/src/modules/common/common.helper';
import { roleUserHelper } from '@/src/modules/helpers';
import type { RoleUserQueryParams } from '@/src/modules/role-user/role-user.type';
import { roleUserService } from '@/src/modules/services';

import { useTransaction } from '@/src/db';

export const roleUserController = {
  createARoleUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) =>
        roleUserService.createARoleUserForMutation(req.body, tx)
      );

      res.status(201).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  updateARoleUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) =>
        roleUserService.updateARoleUserForMutation(
          { entity_id: req.params.entity_id as string, ...req.body },
          tx
        )
      );

      res.json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  deleteARoleUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) =>
        roleUserService.deleteARoleUserForMutation(tx, req.params.entity_id as string)
      );

      res.json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  getRoleUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryParams = req.query as unknown as RoleUserQueryParams;
      const options = getOptionsFromQuery(req.query as Record<string, string | undefined>);
      const [data, total] = await Promise.all([
        roleUserHelper.getRoleUsers(queryParams, options),
        roleUserHelper.countRoleUsers(queryParams)
      ]);

      res.json({
        data,
        meta_data: { filtered_rows: data.length, total_rows: total }
      });
    } catch (err) {
      next(err);
    }
  },

  getARoleUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await roleUserHelper.getARoleUser(req.params.entity_id as string);

      if (!data) {
        return res.status(404).json({ message: 'ROLE_USER_NOT_FOUND' });
      }

      res.json({ data });
    } catch (err) {
      next(err);
    }
  }
};
