import { prisma } from '../../prisma/prisma.service';

export class UserService {
    async getUserProfile(userId: string) {
        return await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                whatsapp: true,
                status: true,
                createdAt: true,
                wallet: true,
            },
        });
    }

    async getUserTransactions(userId: string) {
        const wallet = await prisma.wallet.findUnique({
            where: { userId },
            select: { id: true },
        });

        if (!wallet) return [];

        return await prisma.transaction.findMany({
            where: { walletId: wallet.id },
            orderBy: { createdAt: 'desc' },
        });
    }
}
