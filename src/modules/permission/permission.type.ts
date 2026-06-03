import type {
  permissionActionsEnum,
  permissionModulesEnum
} from '@/src/modules/permission/permission.schema';

export type PermissionAction = (typeof permissionActionsEnum.enumValues)[number];
export type PermissionModule = (typeof permissionModulesEnum.enumValues)[number];

export interface PermissionInput {
  action: PermissionAction;
  module: PermissionModule;
}

export interface PermissionQueryParams extends Partial<PermissionInput> {
  exclude_entity_ids?: string[];
  include_entity_ids?: string[];
}
