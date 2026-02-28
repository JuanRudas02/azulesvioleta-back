import { Response } from 'express';
import { InvoiceService } from './invoice.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

const invoiceService = new InvoiceService();

export class InvoiceController {
    async submitInvoice(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const { amountSpent } = req.body;
            const file = req.file;

            if (!file || !amountSpent) {
                res.status(400).json({ message: 'Validation error: image file and amountSpent are required' });
                return;
            }

            const invoice = await invoiceService.submitInvoice(userId, file, amountSpent);
            res.status(201).json({ message: 'Invoice submitted successfully', invoice });
        } catch (error: any) {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    async getPendingInvoices(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const invoices = await invoiceService.getPendingInvoices(page, limit);
            res.status(200).json(invoices);
        } catch (error: any) {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    async approveInvoice(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const adminId = req.user!.id;

            await invoiceService.approveInvoice(id as string, adminId);
            res.status(200).json({ message: 'Invoice approved successfully' });
        } catch (error: any) {
            if (error.message.includes('not found') || error.message.includes('Only PENDING')) {
                res.status(400).json({ message: error.message });
                return;
            }
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    async rejectInvoice(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const adminId = req.user!.id;
            const { rejectionReason } = req.body;

            if (!rejectionReason) {
                res.status(400).json({ message: 'Validation error: rejectionReason is required' });
                return;
            }

            await invoiceService.rejectInvoice(id as string, adminId, rejectionReason);
            res.status(200).json({ message: 'Invoice rejected successfully' });
        } catch (error: any) {
            if (error.message.includes('not found') || error.message.includes('Only PENDING')) {
                res.status(400).json({ message: error.message });
                return;
            }
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
}
