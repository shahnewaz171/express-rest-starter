import { Router } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express.js with PostgreSQL API',
      version: '1.0.0',
      description: 'Enterprise SaaS Boilerplate API with authentication and RBAC.'
    },
    servers: [{ url: 'http://localhost:8000' }],
    components: {
      securitySchemes: {
        tokenAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization'
        }
      }
    }
  },
  apis: ['./src/modules/**/*.router.ts', './src/modules/doc/doc.schema.ts']
});

const docRouter: ReturnType<typeof Router> = Router();

docRouter.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export { docRouter };
