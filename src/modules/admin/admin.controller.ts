import { Response } from 'express';
import { AdminService } from './admin.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

const adminService = new AdminService();

export class AdminController {
    async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const users = await adminService.getUsers(page, limit);
            res.status(200).json(users);
        } catch (error: any) {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const stats = await adminService.getStats();
            res.status(200).json(stats);
        } catch (error: any) {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    async adjustPoints(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { amount, description } = req.body;

            if (!amount || typeof amount !== 'number') {
                res.status(400).json({ message: 'Validation error: amount must be a number' });
                return;
            }

            await adminService.adjustPoints(id as string, amount, description || 'Ajuste manual de puntos');
            res.status(200).json({ message: 'Points adjusted successfully' });
        } catch (error: any) {
            if (error.message === 'User wallet not found') {
                res.status(404).json({ message: error.message });
                return;
            }
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
}
