import { eq } from 'drizzle-orm';

import { CustomError } from '@/src/utils/error';

import {
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

export const createAnAuthTemplate = async (data: NewAuthTemplate, tx: DB = db) => {
  const result = await tx.insert(authTemplate).values(data).onConflictDoNothing().returning();

  return result[0];
};

export const updateAnAuthTemplate = async (
  id: string,
  data: UpdateAuthTemplateInput,
  tx: DB = db
) => {
  const updateData: Record<string, unknown> = {};

  if (data.body !== undefined) updateData.body = data.body;
  if (data.event !== undefined) updateData.event = data.event;
  if (data.subject !== undefined) updateData.subject = data.subject;

  const result = await tx
    .update(authTemplate)
    .set(updateData)
    .where(eq(authTemplate.id, id))
    .returning();

  return result[0] ?? null;
};

export const deleteAnAuthTemplate = async (id: string, tx: DB = db) => {
  const result = await tx.delete(authTemplate).where(eq(authTemplate.id, id)).returning();

  return result[0] ?? null;
};

export const createAnAuthTemplateForMutation = async (
  params: CreateAuthTemplateInput,
  userId: string,
  tx?: DB
) => {
  const created = await createAnAuthTemplate(
    {
      body: params.body,
      event: params.event,
      subject: params.subject,
      created_by: userId
    },
    tx
  );

  if (!created) {
    throw new CustomError(409, 'COULD_NOT_CREATE_AUTH_TEMPLATE');
  }

  return created;
};

export const updateAnAuthTemplateForMutation = async (
  params: AuthTemplateQueryParams & UpdateAuthTemplateInput,
  tx?: DB
) => {
  const template = await getAnAuthTemplateForQuery(params, tx);

  const updateData: UpdateAuthTemplateInput = {};
  if (params.body !== undefined) updateData.body = params.body;
  if (params.event !== undefined) updateData.event = params.event;
  if (params.subject !== undefined) updateData.subject = params.subject;

  return updateAnAuthTemplate(template.id, updateData, tx);
};

export const removeAnAuthTemplateForMutation = async (params: AuthTemplateQueryParams, tx?: DB) => {
  const template = await getAnAuthTemplateForQuery(params, tx);

  return deleteAnAuthTemplate(template.id, tx);
};

export { getAuthTemplatesForQuery };
