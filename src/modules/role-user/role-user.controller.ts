import type { NextFunction, Request, Response } from 'express';

import { CustomError } from '@/src/utils/error';

import * as commonHelper from '@/src/modules/common/common.helper';
import * as roleUserHelper from '@/src/modules/role-user/role-user.helper';
import * as roleUserService from '@/src/modules/role-user/role-user.service';
import {
  createRoleUserSchema,
  type RoleUserQueryParams,
  updateRoleUserSchema
} from '@/src/modules/role-user/role-user.type';

import { useTransaction } from '@/src/db';

export const roleUserController = {
  createARoleUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createRoleUserSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new CustomError(400, parsed.error.issues[0]?.message ?? 'VALIDATION_ERROR');
      }

      const data = await useTransaction(async (tx) =>
        roleUserService.createARoleUserForMutation(parsed.data, tx)
      );

      res.status(201).json({ data, message: 'SUCCESS' });
    } catch (err) {
      next(err);
    }
  },

  updateARoleUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateRoleUserSchema.safeParse({
        entity_id: req.params.entity_id as string,
        ...req.body
      });
      if (!parsed.success) {
        throw new CustomError(400, parsed.error.issues[0]?.message ?? 'VALIDATION_ERROR');
      }

      const data = await useTransaction(async (tx) =>
        roleUserService.updateARoleUserForMutation(parsed.data, tx)
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
      const options = commonHelper.getOptionsFromQuery(
        req.query as Record<string, string | undefined>
      );
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
