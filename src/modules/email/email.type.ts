export interface SendNotificationParams {
  event: string;
  from_email?: string;
  to_email: string;
  reply_to?: string;
  variables?: Record<string, string>;
}

export interface SendEmailParams {
  from_email?: string;
  to_email: string;
  reply_to?: string;
  subject: string;
  html: string;
}
