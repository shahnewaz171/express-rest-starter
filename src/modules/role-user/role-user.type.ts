export interface CreateRoleUserInput {
  role_id: string;
  user_id: string;
}

export interface UpdateRoleUserInput {
  role_id?: string;
  user_id?: string;
}

export interface RoleUserQueryParams {
  role_id?: string;
  user_id?: string;
  exclude_entity_ids?: string[];
  include_entity_ids?: string[];
}
