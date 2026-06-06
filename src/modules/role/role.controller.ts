import type { NextFunction, Request, Response } from 'express';

import { CustomError } from '@/src/utils/error';

import * as commonHelper from '@/src/modules/common/common.helper';
import * as roleHelper from '@/src/modules/role/role.helper';
import * as roleService from '@/src/modules/role/role.service';
import { createRoleSchema, deleteRoleSchema, updateRoleSchema } from '@/src/modules/role/role.type';
import type { AuthRequest } from '@/src/modules/user/user.type';

import { useTransaction } from '@/src/db';

export const roleController = {
  createARole: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError(401, 'UNAUTHORIZED');
      }

      const parsed = createRoleSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new CustomError(400, parsed.error.issues[0]?.message ?? 'VALIDATION_ERROR');
      }

      const newRole = await useTransaction(async (tx) =>
        roleService.createARoleForMutation(parsed.data, { user_id: userId }, tx)
      );
      res.status(201).json({ data: newRole });
    } catch (err) {
      next(err);
    }
  },

  updateARole: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = updateRoleSchema.safeParse({
        entity_id: String(req.params.entity_id),
        data: req.body
      });
      if (!parsed.success) {
        throw new CustomError(400, parsed.error.issues[0]?.message ?? 'VALIDATION_ERROR');
      }

      const updatedRole = await useTransaction(async (tx) =>
        roleService.updateARoleForMutation(parsed.data, { user_id: req.user?.id ?? '' }, tx)
      );
      res.json({ data: updatedRole });
    } catch (err) {
      next(err);
    }
  },

  deleteARole: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = deleteRoleSchema.safeParse({
        entity_id: String(req.params.entity_id)
      });
      if (!parsed.success) {
        throw new CustomError(400, parsed.error.issues[0]?.message ?? 'VALIDATION_ERROR');
      }

      const deletedRole = await useTransaction(async (tx) =>
        roleService.deleteARole(parsed.data.entity_id, tx)
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
