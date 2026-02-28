import { Router } from 'express';
import { UserController } from './user.controller';
import { authGuard } from '../../middlewares/auth.middleware';

const router = Router();
const userController = new UserController();

router.use(authGuard);

router.get('/me', userController.getMe);
router.get('/transactions', userController.getMyTransactions);

export default router;
