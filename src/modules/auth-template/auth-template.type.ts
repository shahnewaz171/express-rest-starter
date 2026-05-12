export interface CreateAuthTemplateInput {
  body: string;
  event: string;
  subject: string;
}

export interface UpdateAuthTemplateInput {
  body?: string;
  event?: string;
  subject?: string;
}

export interface AuthTemplateQueryParams {
  entity_id?: string;
  event?: string;
  subject?: string;
  search_keyword?: string;
}
