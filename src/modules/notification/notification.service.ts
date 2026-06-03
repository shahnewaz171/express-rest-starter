import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import { eq } from 'drizzle-orm';
import Handlebars from 'handlebars';
import MailComposer from 'nodemailer/lib/mail-composer';

import { AWS_ACCESS_KEY, AWS_REGION, AWS_SECRET_KEY, FROM_EMAIL } from '@/src/utils/env';

import * as authTemplateHelper from '@/src/modules/auth-template/auth-template.helper';
import { authTemplate } from '@/src/modules/auth-template/auth-template.schema';
import type {
  SendEmailParams,
  SendNotificationParams
} from '@/src/modules/notification/notification.type';

Handlebars.registerHelper('current_year', () => new Date().getFullYear());

const sesClient = new SESClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY
  }
});

export const sendEmailBySES = async (params: SendEmailParams) => {
  const mail = new MailComposer({
    from: params.from_email || FROM_EMAIL,
    to: params.to_email,
    replyTo: params.reply_to || undefined,
    subject: params.subject,
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8" /></head><body>${params?.html}</body></html>`
  });

  const message = await mail.compile().build();

  const command = new SendRawEmailCommand({
    RawMessage: { Data: message }
  });
  const response = await sesClient.send(command);

  return response;
};

export const sendNotification = async (params: SendNotificationParams) => {
  const { event, to_email } = params;

  if (!(event && to_email)) {
    throw new Error('MISSING_REQUIRED_FIELDS_TO_SEND_NOTIFICATION');
  }

  const template = await authTemplateHelper.getAnAuthTemplate({
    where: eq(authTemplate.event, event)
  });

  if (!template?.id) {
    throw new Error('AUTH_TEMPLATE_IS_NOT_FOUND');
  }

  if (!template?.body || !template?.subject) {
    throw new Error('MISSING_AUTH_TEMPLATE_BODY_OR_SUBJECT');
  }

  const variables = params.variables || {};
  const compiledBody = Handlebars.compile(template.body)(variables);
  const compiledSubject = Handlebars.compile(template.subject)(variables);

  const emailParams: SendEmailParams = {
    from_email: params.from_email ?? FROM_EMAIL,
    to_email: params.to_email,
    reply_to: params.reply_to ?? '',
    subject: compiledSubject,
    html: compiledBody
  };

  return sendEmailBySES(emailParams);
};
