export interface CreateRolePermissionInput {
  role_id: string;
  permission_id: string;
  can_do_the_action?: boolean;
}

export interface UpdateRolePermissionInput {
  can_do_the_action?: boolean;
}

export interface RolePermissionQueryParams {
  role_id?: string;
  permission_id?: string;
  can_do_the_action?: boolean;
  exclude_entity_ids?: string[];
  include_entity_ids?: string[];
}
