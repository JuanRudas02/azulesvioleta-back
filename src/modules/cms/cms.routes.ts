import { Router } from 'express';
import { CmsController } from './cms.controller';
import { authGuard } from '../../middlewares/auth.middleware';
import { roleGuard } from '../../middlewares/role.middleware';

const router = Router();
const cmsController = new CmsController();

// Public route
router.get('/home', cmsController.getHome);

// Protected route
router.put('/home', authGuard, roleGuard(['ADMIN']), cmsController.updateHome);

export default router;
