import { prisma } from '../../prisma/prisma.service';

export class AdminService {
    async getUsers(page: number, limit: number) {
        const skip = (page - 1) * limit;
        const [total, users] = await Promise.all([
            prisma.user.count(),
            prisma.user.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    wallet: {
                        select: {
                            balance: true,
                            lifetimePoints: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        return { total, page, limit, users };
    }

    async getStats() {
        const [pendingInvoices, totalPointsIssuedAggregation] = await Promise.all([
            prisma.invoice.count({ where: { status: 'PENDING' } }),
            prisma.transaction.aggregate({
                _sum: { amount: true },
                where: { amount: { gt: 0 } },
            }),
        ]);

        const totalPointsIssued = totalPointsIssuedAggregation._sum.amount || 0;

        return {
            pendingInvoices,
            totalPointsIssued,
        };
    }

    async adjustPoints(userId: string, amount: number, description: string) {
        const wallet = await prisma.wallet.findUnique({ where: { userId } });

        if (!wallet) {
            throw new Error('User wallet not found');
        }

        return await prisma.$transaction([
            prisma.transaction.create({
                data: {
                    walletId: wallet.id,
                    amount,
                    type: 'MANUAL_ADJUSTMENT',
                    description,
                },
            }),
            prisma.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: { increment: amount },
                    lifetimePoints: amount > 0 ? { increment: amount } : undefined,
                },
            }),
        ]);
    }
}
