import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { bearerSecurity, errorResponses } from '@/docs/helpers/common';
import { apiEntityIdParamsSchema } from '@/docs/schemas/common';
import { apiAuthTokensSchema, apiAuthUserSchema, apiUserSchema } from '@/docs/schemas/entities';
import { apiRefreshTokenSchema } from '@/docs/schemas/requests/auth-token';
import {
  apiCancelChangeEmailRequestSchema,
  apiChangeEmailRequestSchema,
  apiChangePasswordRequestSchema,
  apiForgotPasswordSchema,
  apiGetUsersQuerySchema,
  apiLoginSchema,
  apiRegisterSchema,
  apiResendVerificationEmailRequestSchema,
  apiSetUserEmailRequestSchema,
  apiSetUserPasswordByAdminSchema,
  apiVerifyChangeEmailRequestSchema,
  apiVerifyForgotPasswordSchema,
  apiVerifyUserEmailSchema,
  apiVerifyUserPasswordRequestSchema
} from '@/docs/schemas/requests/user';
import { apiSuccessResponseSchema } from '@/docs/schemas/responses';

const registerSuccessSchema = apiSuccessResponseSchema(apiUserSchema, 'RegisterSuccess');
const loginSuccessSchema = apiSuccessResponseSchema(apiAuthTokensSchema, 'LoginSuccess');
const authUserSuccessSchema = apiSuccessResponseSchema(apiAuthUserSchema, 'AuthUserSuccess');
const userSuccessSchema = apiSuccessResponseSchema(apiUserSchema, 'UserSuccess');
const usersListSuccessSchema = apiSuccessResponseSchema(apiUserSchema.array(), 'UsersListSuccess');

const registerUserPublicRoutes = (registry: OpenAPIRegistry) => {
  registry.registerPath({
    method: 'post',
    path: '/auth/register',
    tags: ['Users'],
    summary: 'Register a new user',
    request: {
      body: {
        content: {
          'application/json': { schema: apiRegisterSchema }
        }
      }
    },
    responses: {
      201: {
        description: 'User created',
        content: { 'application/json': { schema: registerSuccessSchema } }
      },
      400: errorResponses.badRequest
    }
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/verify-user-email',
    tags: ['Users'],
    summary: 'Verify user email',
    request: {
      body: {
        content: {
          'application/json': { schema: apiVerifyUserEmailSchema }
        }
      }
    },
    responses: {
      200: {
        description: 'Email verified',
        content: { 'application/json': { schema: userSuccessSchema } }
      },
      400: errorResponses.badRequest
    }
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/resend-verification-email',
    tags: ['Users'],
    summary: 'Resend verification email',
    request: {
      body: {
        content: {
          'application/json': { schema: apiResendVerificationEmailRequestSchema }
        }
      }
    },
    responses: {
      200: {
        description: 'Verification email sent',
        content: { 'application/json': { schema: userSuccessSchema } }
      },
      400: errorResponses.badRequest
    }
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/login',
    tags: ['Users'],
    summary: 'Login user',
    request: {
      body: {
        content: {
          'application/json': { schema: apiLoginSchema }
        }
      }
    },
    responses: {
      200: {
        description: 'Login successful',
        content: { 'application/json': { schema: loginSuccessSchema } }
      },
      400: errorResponses.badRequest
    }
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/refresh-token',
    tags: ['Users'],
    summary: 'Refresh user tokens',
    request: {
      body: {
        content: {
          'application/json': { schema: apiRefreshTokenSchema }
        }
      }
    },
    responses: {
      200: {
        description: 'Tokens refreshed',
        content: { 'application/json': { schema: loginSuccessSchema } }
      },
      400: errorResponses.badRequest
    }
  });
};

const registerUserSessionRoutes = (registry: OpenAPIRegistry) => {
  registry.registerPath({
    method: 'get',
    path: '/auth/user',
    tags: ['Users'],
    summary: 'Get authenticated user',
    security: bearerSecurity,
    responses: {
      200: {
        description: 'Authenticated user',
        content: { 'application/json': { schema: authUserSuccessSchema } }
      },
      401: errorResponses.unauthorized
    }
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/logout',
    tags: ['Users'],
    summary: 'Logout user',
    security: bearerSecurity,
    responses: {
      200: {
        description: 'Logout successful',
        content: { 'application/json': { schema: userSuccessSchema } }
      },
      401: errorResponses.unauthorized
    }
  });
};

const registerUserEmailRoutes = (registry: OpenAPIRegistry) => {
  registry.registerPath({
    method: 'post',
    path: '/auth/change-email',
    tags: ['Users'],
    summary: 'Change user email',
    security: bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': { schema: apiChangeEmailRequestSchema }
        }
      }
    },
    responses: {
      200: {
        description: 'Email change initiated',
        content: { 'application/json': { schema: userSuccessSchema } }
      },
      400: errorResponses.badRequest,
      401: errorResponses.unauthorized
    }
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/cancel-change-email',
    tags: ['Users'],
    summary: 'Cancel email change',
    security: bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': { schema: apiCancelChangeEmailRequestSchema }
        }
      }
    },
    responses: {
      200: {
        description: 'Email change cancelled',
        content: { 'application/json': { schema: userSuccessSchema } }
      },
      400: errorResponses.badRequest,
      401: errorResponses.unauthorized
    }
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/verify-change-email',
    tags: ['Users'],
    summary: 'Verify new email',
    security: bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': { schema: apiVerifyChangeEmailRequestSchema }
        }
      }
    },
    responses: {
      200: {
        description: 'New email verified',
        content: { 'application/json': { schema: userSuccessSchema } }
      },
      400: errorResponses.badRequest,
      401: errorResponses.unauthorized
    }
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/set-user-email',
    tags: ['Users'],
    summary: 'Set user email by admin',
    security: bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': { schema: apiSetUserEmailRequestSchema }
        }
      }
    },
    responses: {
      200: {
        description: 'User email updated',
        content: { 'application/json': { schema: userSuccessSchema } }
      },
      400: errorResponses.badRequest,
      401: errorResponses.unauthorized
    }
  });
};

const registerUserPasswordRoutes = (registry: OpenAPIRegistry) => {
  registry.registerPath({
    method: 'post',
    path: '/auth/change-password',
    tags: ['Users'],
    summary: 'Change user password',
    security: bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': { schema: apiChangePasswordRequestSchema }
        }
      }
    },
    responses: {
      200: {
        description: 'Password changed',
        content: { 'application/json': { schema: userSuccessSchema } }
      },
      400: errorResponses.badRequest,
      401: errorResponses.unauthorized
    }
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/set-user-password',
    tags: ['Users'],
    summary: 'Set user password by admin',
    security: bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': { schema: apiSetUserPasswordByAdminSchema }
        }
      }
    },
    responses: {
      200: {
        description: 'User password updated',
        content: { 'application/json': { schema: userSuccessSchema } }
      },
      400: errorResponses.badRequest,
      401: errorResponses.unauthorized
    }
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/verify-user-password',
    tags: ['Users'],
    summary: 'Verify current user password',
    security: bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': { schema: apiVerifyUserPasswordRequestSchema }
        }
      }
    },
    responses: {
      200: {
        description: 'Password verified',
        content: { 'application/json': { schema: userSuccessSchema } }
      },
      400: errorResponses.badRequest,
      401: errorResponses.unauthorized
    }
  });
};

const registerUserForgotPasswordRoutes = (registry: OpenAPIRegistry) => {
  registry.registerPath({
    method: 'post',
    path: '/auth/forgot-password',
    tags: ['Users'],
    summary: 'Request forgot password email',
    request: {
      body: {
        content: {
          'application/json': { schema: apiForgotPasswordSchema }
        }
      }
    },
    responses: {
      200: {
        description: 'Forgot password email sent',
        content: { 'application/json': { schema: userSuccessSchema } }
      },
      400: errorResponses.badRequest
    }
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/retry-forgot-password',
    tags: ['Users'],
    summary: 'Retry forgot password email',
    request: {
      body: {
        content: {
          'application/json': { schema: apiForgotPasswordSchema }
        }
      }
    },
    responses: {
      200: {
        description: 'Forgot password email resent',
        content: { 'application/json': { schema: userSuccessSchema } }
      },
      400: errorResponses.badRequest
    }
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/verify-forgot-password',
    tags: ['Users'],
    summary: 'Reset password with forgot password token',
    request: {
      body: {
        content: {
          'application/json': { schema: apiVerifyForgotPasswordSchema }
        }
      }
    },
    responses: {
      200: {
        description: 'Password reset',
        content: { 'application/json': { schema: userSuccessSchema } }
      },
      400: errorResponses.badRequest
    }
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/verify-forgot-password-code',
    tags: ['Users'],
    summary: 'Verify forgot password OTP code',
    request: {
      body: {
        content: {
          'application/json': { schema: apiVerifyUserEmailSchema }
        }
      }
    },
    responses: {
      200: {
        description: 'Forgot password code verified',
        content: { 'application/json': { schema: userSuccessSchema } }
      },
      400: errorResponses.badRequest
    }
  });
};

const registerUserQueryRoutes = (registry: OpenAPIRegistry) => {
  registry.registerPath({
    method: 'get',
    path: '/auth/users',
    tags: ['Users'],
    summary: 'Get all users',
    security: bearerSecurity,
    request: {
      query: apiGetUsersQuerySchema
    },
    responses: {
      200: {
        description: 'Users list',
        content: { 'application/json': { schema: usersListSuccessSchema } }
      },
      400: errorResponses.badRequest,
      401: errorResponses.unauthorized
    }
  });

  registry.registerPath({
    method: 'get',
    path: '/auth/users/{entity_id}',
    tags: ['Users'],
    summary: 'Get a user by ID',
    security: bearerSecurity,
    request: {
      params: apiEntityIdParamsSchema
    },
    responses: {
      200: {
        description: 'User found',
        content: { 'application/json': { schema: userSuccessSchema } }
      },
      401: errorResponses.unauthorized,
      404: errorResponses.notFound
    }
  });
};

export const registerUserRoutes = (registry: OpenAPIRegistry) => {
  registerUserPublicRoutes(registry);
  registerUserSessionRoutes(registry);
  registerUserEmailRoutes(registry);
  registerUserPasswordRoutes(registry);
  registerUserForgotPasswordRoutes(registry);
  registerUserQueryRoutes(registry);
};
