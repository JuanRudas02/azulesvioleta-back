import { Response } from 'express';
import { UserService } from './user.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

const userService = new UserService();

export class UserController {
    async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const profile = await userService.getUserProfile(userId);
            if (!profile) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.status(200).json(profile);
        } catch (error: any) {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    async getMyTransactions(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const transactions = await userService.getUserTransactions(userId);
            res.status(200).json(transactions);
        } catch (error: any) {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
}
