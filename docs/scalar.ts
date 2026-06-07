import { apiReference } from '@scalar/express-api-reference';
import { Router } from 'express';

import { generateOpenAPIDocument } from '@/docs/openapi';

const docRouter: ReturnType<typeof Router> = Router();

docRouter.get('/openapi.json', (_req, res) => {
  res.json(generateOpenAPIDocument());
});

docRouter.use(
  '/',
  apiReference({
    spec: {
      content: generateOpenAPIDocument()
    }
  })
);

export { docRouter };
