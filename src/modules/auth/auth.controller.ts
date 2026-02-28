import { Request, Response } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

export class AuthController {
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, name, whatsapp } = req.body;
            const user = await authService.register({ email, password, name, whatsapp });
            res.status(201).json({ message: 'User registered successfully', user });
        } catch (error: any) {
            if (error.message === 'Email already in use') {
                res.status(409).json({ message: error.message });
                return;
            }
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            if (!result) {
                res.status(401).json({ message: 'Invalid email or password' });
                return;
            }
            res.status(200).json({ message: 'Login successful', ...result });
        } catch (error: any) {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
}
