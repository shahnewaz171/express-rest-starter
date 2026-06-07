import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';

import env from '@/src/utils/env';

import { registerAllRoutes } from '@/docs/routes';

import { registry } from '@/docs/registry';

type OpenAPIDocument = ReturnType<OpenApiGeneratorV31['generateDocument']>;

registerAllRoutes(registry);

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'JWT access token via Authorization: Bearer <token>'
});

const getServerUrl = () => env.API_BASE_URL || `http://localhost:${env.PORT}`;

export const generateOpenAPIDocument = (): OpenAPIDocument => {
  const generator = new OpenApiGeneratorV31(registry.definitions);

  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'Express.js with PostgreSQL API',
      version: '1.0.0',
      description: 'Enterprise SaaS Boilerplate API with authentication and RBAC.'
    },
    servers: [{ url: getServerUrl() }],
    security: [{ bearerAuth: [] }]
  });
};
