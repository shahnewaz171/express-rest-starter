export interface CreatePermissionInput {
  action: string;
  module: string;
}

export interface UpdatePermissionInput {
  action?: string;
  module?: string;
}

export interface PermissionQueryParams {
  action?: string;
  module?: string;
  exclude_entity_ids?: string[];
  include_entity_ids?: string[];
}
