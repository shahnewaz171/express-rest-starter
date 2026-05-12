import { eq } from 'drizzle-orm';

import { CustomError } from '@/src/utils/error';

import {
  getAnAuthTemplate,
  getAnAuthTemplateForQuery,
  getAuthTemplatesForQuery
} from '@/src/modules/auth-template/auth-template.helper';
import type { NewAuthTemplate } from '@/src/modules/auth-template/auth-template.schema';
import { authTemplate } from '@/src/modules/auth-template/auth-template.schema';
import type {
  AuthTemplateQueryParams,
  CreateAuthTemplateInput,
  UpdateAuthTemplateInput
} from '@/src/modules/auth-template/auth-template.type';

import type { DB } from '@/src/db';
import { db } from '@/src/db';

export const createAnAuthTemplate = async (data: NewAuthTemplate, tx?: DB) => {
  const executor = tx || db;
  const result = await executor.insert(authTemplate).values(data).returning();

  return result[0];
};

export const updateAnAuthTemplate = async (id: string, data: UpdateAuthTemplateInput, tx?: DB) => {
  const executor = tx || db;
  const updateData: Record<string, unknown> = { updated_at: new Date() };

  if (data.body !== undefined) updateData.body = data.body;
  if (data.event !== undefined) updateData.event = data.event;
  if (data.subject !== undefined) updateData.subject = data.subject;

  const result = await executor
    .update(authTemplate)
    .set(updateData)
    .where(eq(authTemplate.id, id))
    .returning();

  return result[0] ?? null;
};

export const deleteAnAuthTemplate = async (id: string, tx?: DB) => {
  const executor = tx || db;
  const result = await executor.delete(authTemplate).where(eq(authTemplate.id, id)).returning();

  return result[0] ?? null;
};

export const createAnAuthTemplateForMutation = async (
  params: CreateAuthTemplateInput,
  userId: string,
  tx?: DB
) => {
  const existing = await getAnAuthTemplate({
    where: eq(authTemplate.event, params.event)
  });

  if (existing) {
    throw new CustomError(409, 'AUTH_TEMPLATE_ALREADY_EXISTS');
  }

  return createAnAuthTemplate(
    {
      body: params.body,
      event: params.event,
      subject: params.subject,
      created_by: userId
    },
    tx
  );
};

export const updateAnAuthTemplateForMutation = async (
  params: AuthTemplateQueryParams & UpdateAuthTemplateInput,
  tx?: DB
) => {
  const template = await getAnAuthTemplateForQuery(params);

  const updateData: UpdateAuthTemplateInput = {};
  if (params.body !== undefined) updateData.body = params.body;
  if (params.event !== undefined) updateData.event = params.event;
  if (params.subject !== undefined) updateData.subject = params.subject;

  return updateAnAuthTemplate(template.id, updateData, tx);
};

export const removeAnAuthTemplateForMutation = async (params: AuthTemplateQueryParams, tx?: DB) => {
  const template = await getAnAuthTemplateForQuery(params);

  return deleteAnAuthTemplate(template.id, tx);
};

export { getAnAuthTemplateForQuery, getAuthTemplatesForQuery };
