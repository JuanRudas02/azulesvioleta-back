import { prisma } from '../../prisma/prisma.service';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { Role } from '@prisma/client';

export class AuthService {
    async register(data: any) {
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            throw new Error('Email already in use');
        }

        const passwordHash = await bcrypt.hash(data.password, 10);
        const welcomeBonus = 500; // As per the prompt default 

        const user = await prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                name: data.name,
                whatsapp: data.whatsapp,
                wallet: {
                    create: {
                        balance: welcomeBonus,
                        lifetimePoints: welcomeBonus,
                        transactions: {
                            create: {
                                amount: welcomeBonus,
                                type: 'WELCOME_BONUS',
                                description: 'Bono de bienvenida por registro',
                            },
                        },
                    },
                },
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                wallet: true,
            },
        });

        return user;
    }

    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return null;

        const token = jwt.sign(
            { id: user.id, role: user.role },
            env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }
}
