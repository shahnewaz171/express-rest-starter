import { Router } from 'express';

// Routers
import { docRouter } from '@/src/modules/routers';

const router: ReturnType<typeof Router> = Router();

router.use('/docs', docRouter);

export default router;
