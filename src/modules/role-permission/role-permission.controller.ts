import type { NextFunction, Request, Response } from 'express';

import * as commonHelper from '@/src/modules/common/common.helper';
import * as rolePermissionHelper from '@/src/modules/role-permission/role-permission.helper';
import * as rolePermissionService from '@/src/modules/role-permission/role-permission.service';
import type { RolePermissionQueryParams } from '@/src/modules/role-permission/role-permission.type';
import type { AuthRequest } from '@/src/modules/user/user.type';

import { useTransaction } from '@/src/db';

export const rolePermissionController = {
  createARolePermission: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) =>
        rolePermissionService.createARolePermissionForMutation(
          req.body,
          { user_id: req.user?.id ?? '' },
          tx
        )
      );

      res.status(201).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  updateARolePermission: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) =>
        rolePermissionService.updateARolePermissionForMutation(
          {
            entity_id: req.params.entity_id as string,
            can_do_the_action: req.body.can_do_the_action
          },
          { user_id: req.user?.id ?? '' },
          tx
        )
      );

      res.json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  deleteARolePermission: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await useTransaction(async (tx) =>
        rolePermissionService.deleteARolePermissionForMutation(tx, req.params.entity_id as string)
      );

      res.json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  getRolePermissions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryParams = req.query as unknown as RolePermissionQueryParams;
      const options = commonHelper.getOptionsFromQuery(
        req.query as Record<string, string | undefined>
      );
      const [data, total] = await Promise.all([
        rolePermissionHelper.getRolePermissions(queryParams, options),
        rolePermissionHelper.countRolePermissions(queryParams)
      ]);

      res.json({
        data,
        meta_data: { filtered_rows: data.length, total_rows: total }
      });
    } catch (err) {
      next(err);
    }
  },

  getARolePermission: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await rolePermissionHelper.getARolePermission(req.params.entity_id as string);

      if (!data) {
        return res.status(404).json({ message: 'ROLE_PERMISSION_NOT_FOUND' });
      }

      res.json({ data });
    } catch (err) {
      next(err);
    }
  }
};
