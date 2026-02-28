import { Router } from 'express';
import { InvoiceController } from './invoice.controller';
import { authGuard } from '../../middlewares/auth.middleware';
import { roleGuard } from '../../middlewares/role.middleware';

import { upload } from '../../middlewares/upload.middleware';

const router = Router();
const invoiceController = new InvoiceController();

router.use(authGuard);

// User routes
router.post('/', roleGuard(['CUSTOMER', 'ADMIN']), upload.single('invoice'), invoiceController.submitInvoice);

// Admin routes
router.get('/pending', roleGuard(['ADMIN']), invoiceController.getPendingInvoices);
router.post('/:id/approve', roleGuard(['ADMIN']), invoiceController.approveInvoice);
router.post('/:id/reject', roleGuard(['ADMIN']), invoiceController.rejectInvoice);

export default router;
