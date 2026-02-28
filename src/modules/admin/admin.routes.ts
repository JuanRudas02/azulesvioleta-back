import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authGuard } from '../../middlewares/auth.middleware';
import { roleGuard } from '../../middlewares/role.middleware';

const router = Router();
const adminController = new AdminController();

router.use(authGuard);
router.use(roleGuard(['ADMIN']));

router.get('/users', adminController.getUsers);
router.get('/stats', adminController.getStats);
router.put('/users/:id/points', adminController.adjustPoints);

export default router;
