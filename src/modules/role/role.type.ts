import type { roleNameEnum } from '@/src/modules/role/role.schema';

export type RoleName = (typeof roleNameEnum.enumValues)[number];

export interface CreateRoleInput {
  name: RoleName;
}

export interface UpdateRoleInput {
  name?: RoleName;
}

export interface RoleQueryParams {
  exclude_entity_ids?: string[];
  include_entity_ids?: string[];
  names?: RoleName[];
}
