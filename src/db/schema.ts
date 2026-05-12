import { relations } from 'drizzle-orm';

import { authTemplate } from '@/src/modules/auth-template/auth-template.schema';
import { authToken } from '@/src/modules/auth-token/auth-token.schema';
import { permission } from '@/src/modules/permission/permission.schema';
import { role } from '@/src/modules/role/role.schema';
import { rolePermission } from '@/src/modules/role-permission/role-permission.schema';
import { roleUser } from '@/src/modules/role-user/role-user.schema';
import { user } from '@/src/modules/user/user.schema';
import { verificationToken } from '@/src/modules/verification-token/verification-token.schema';

export const userRelations = relations(user, ({ many }) => ({
  auth_tokens: many(authToken),
  verification_tokens: many(verificationToken),
  role_users: many(roleUser),
  created_roles: many(role, { relationName: 'created_by' }),
  created_permissions: many(permission, { relationName: 'created_by' }),
  created_role_permissions: many(rolePermission, { relationName: 'rp_created_by' }),
  updated_role_permissions: many(rolePermission, { relationName: 'rp_updated_by' }),
  created_auth_templates: many(authTemplate, { relationName: 'at_created_by' })
}));

export const roleRelations = relations(role, ({ one, many }) => ({
  creator: one(user, {
    fields: [role.created_by],
    references: [user.id],
    relationName: 'created_by'
  }),
  role_users: many(roleUser),
  role_permissions: many(rolePermission)
}));

export const permissionRelations = relations(permission, ({ one, many }) => ({
  creator: one(user, {
    fields: [permission.created_by],
    references: [user.id],
    relationName: 'created_by'
  }),
  role_permissions: many(rolePermission)
}));

export const rolePermissionRelations = relations(rolePermission, ({ one }) => ({
  role: one(role, { fields: [rolePermission.role_id], references: [role.id] }),
  permission: one(permission, {
    fields: [rolePermission.permission_id],
    references: [permission.id]
  }),
  creator: one(user, {
    fields: [rolePermission.created_by],
    references: [user.id],
    relationName: 'rp_created_by'
  }),
  updater: one(user, {
    fields: [rolePermission.updated_by],
    references: [user.id],
    relationName: 'rp_updated_by'
  })
}));

export const roleUserRelations = relations(roleUser, ({ one }) => ({
  role: one(role, { fields: [roleUser.role_id], references: [role.id] }),
  user: one(user, { fields: [roleUser.user_id], references: [user.id] })
}));

export const authTokenRelations = relations(authToken, ({ one }) => ({
  user: one(user, { fields: [authToken.user_id], references: [user.id] })
}));

export const verificationTokenRelations = relations(verificationToken, ({ one }) => ({
  user: one(user, { fields: [verificationToken.user_id], references: [user.id] })
}));

export const authTemplateRelations = relations(authTemplate, ({ one }) => ({
  creator: one(user, {
    fields: [authTemplate.created_by],
    references: [user.id],
    relationName: 'at_created_by'
  })
}));

export {
  authTemplate,
  authToken,
  permission,
  role,
  rolePermission,
  roleUser,
  user,
  verificationToken
};
