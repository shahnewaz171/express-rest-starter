export interface CreateRoleInput {
  name: string;
}

export interface UpdateRoleInput {
  name?: string;
}

export interface RoleQueryParams {
  exclude_entity_ids?: string[];
  include_entity_ids?: string[];
  names?: string[];
}
