import { authTemplate } from '@/src/modules/auth-template/auth-template.schema';

import type { DB } from '@/src/db';

export default async function seedAuthTemplate(db: DB) {
  await db
    .insert(authTemplate)
    .values([
      {
        event: 'send_user_verification_token',
        body: '<p>Welcome, {{username}}! Verify your email with this OTP: <strong>{{token}}</strong></p>',
        subject: 'Verify Your Email'
      },
      {
        event: 'send_forgot_password_token',
        body: '<p>Hi {{username}}, use this OTP to reset your password: <strong>{{token}}</strong>. If you did not request this, please ignore this email.</p>',
        subject: 'Password Reset Request'
      },
      {
        event: 'send_change_email_token',
        body: '<p>Hi {{username}}, confirm your new email with this OTP: <strong>{{token}}</strong>. If you did not request this, please ignore this email.</p>',
        subject: 'Confirm Your Email Change'
      },
      {
        event: 'send_password_changed',
        body: '<p>Hi {{username}}, your password was just changed. If this was not you, please contact support immediately.</p>',
        subject: 'Your Password Was Changed'
      },
      {
        event: 'send_email_changed',
        body: '<p>Hi {{username}}, your account email was updated to {{email}}. If this was not you, please contact support immediately.</p>',
        subject: 'Your Email Was Changed'
      }
    ])
    .onConflictDoNothing();
}
