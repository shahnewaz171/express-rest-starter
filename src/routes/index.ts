import { Router } from 'express';

// Routers
import {
  docRouter,
  permissionRouter,
  rolePermissionRouter,
  roleRouter,
  roleUserRouter,
  userRouter
} from '@/src/modules/routers';

// Utils
import { testVerificationTokenRouter } from '@/src/db/seeds/test.seed';

const router: ReturnType<typeof Router> = Router();

router.use('/docs', docRouter);

router.use('/permissions', permissionRouter);

router.use('/role-permissions', rolePermissionRouter);

router.use('/role-users', roleUserRouter);

router.use('/roles', roleRouter);

router.use('/auth', userRouter);

// Test routes: These routes are intended for testing purposes and should be removed or protected in production environments.
router.get('/test/verification-tokens', testVerificationTokenRouter);

export default router;
