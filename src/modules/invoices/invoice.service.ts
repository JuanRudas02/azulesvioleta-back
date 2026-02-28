import { prisma } from '../../prisma/prisma.service';
import { supabase } from '../../config/supabase';
import { Prisma } from '@prisma/client';

export class InvoiceService {
    async submitInvoice(userId: string, file: Express.Multer.File, amountSpent: number) {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${userId}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
            .from('invoices')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
            });

        if (error) {
            throw new Error(`Failed to upload image: ${error.message}`);
        }

        const { data: publicUrlData } = supabase.storage
            .from('invoices')
            .getPublicUrl(filePath);

        return await prisma.invoice.create({
            data: {
                userId,
                imageUrl: publicUrlData.publicUrl,
                amountSpent,
                status: 'PENDING',
            },
        });
    }

    async getPendingInvoices(page: number, limit: number) {
        const skip = (page - 1) * limit;
        const [total, invoices] = await Promise.all([
            prisma.invoice.count({ where: { status: 'PENDING' } }),
            prisma.invoice.findMany({
                where: { status: 'PENDING' },
                skip,
                take: limit,
                include: {
                    user: { select: { name: true, email: true } },
                },
                orderBy: { createdAt: 'asc' },
            }),
        ]);

        return { total, page, limit, invoices };
    }

    async approveInvoice(invoiceId: string, adminId: string) {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { user: { include: { wallet: true } } },
        });

        if (!invoice) throw new Error('Invoice not found');
        if (invoice.status !== 'PENDING') throw new Error('Only PENDING invoices can be approved');
        if (!invoice.user.wallet) throw new Error('User wallet not found');

        // Rule for points: 1 point per 1000 COP for example, or dynamic based on SystemConfig.
        // Fetching SystemConfig dynamically:
        let pointsPerPurchaseConfig = await prisma.systemConfig.findUnique({
            where: { key: 'POINTS_PER_PURCHASE_DIVISOR' },
        });

        // Default divisor is 1000 (e.g. 50000 COP / 1000 = 50 Points) if not configured in DB.
        const divisor = pointsPerPurchaseConfig ? parseInt(pointsPerPurchaseConfig.value) : 1000;

        // Using Prisma.Decimal properly to avoid issues and doing arithmetic in JS
        const amountVal = Number(invoice.amountSpent);
        const pointsAwarded = Math.floor(amountVal / divisor);

        return await prisma.$transaction([
            prisma.invoice.update({
                where: { id: invoiceId },
                data: {
                    status: 'APPROVED',
                    reviewedBy: adminId,
                    pointsAwarded,
                },
            }),
            prisma.transaction.create({
                data: {
                    walletId: invoice.user.wallet.id,
                    amount: pointsAwarded,
                    type: 'INVOICE_APPROVED',
                    description: `Puntos otorgados por compra de ${amountVal}`,
                },
            }),
            prisma.wallet.update({
                where: { id: invoice.user.wallet.id },
                data: {
                    balance: { increment: pointsAwarded },
                    lifetimePoints: { increment: pointsAwarded },
                },
            }),
        ]);
    }

    async rejectInvoice(invoiceId: string, adminId: string, rejectionReason: string) {
        const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });

        if (!invoice) throw new Error('Invoice not found');
        if (invoice.status !== 'PENDING') throw new Error('Only PENDING invoices can be rejected');

        return await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                status: 'REJECTED',
                reviewedBy: adminId,
                rejectionReason,
            },
        });
    }
}
