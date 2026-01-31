const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getInvoicesByParentId,
  getInvoicesByChildId,
  getInvoicePDF
} = require('../controllers/invoice.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { createValidator } = require('../middleware/validation.middleware');
const { invoiceSchemas } = require('../helpers/validation');

// Admin routes
router.post('/', protect, authorize('admin'), createValidator(invoiceSchemas.create), createInvoice);
router.get('/', protect, authorize('admin'), getAllInvoices);
router.put('/:id', protect, authorize('admin'), createValidator(invoiceSchemas.update), updateInvoice);
router.delete('/:id', protect, authorize('admin'), deleteInvoice);
router.get('/child/:childId', protect, authorize('admin'), getInvoicesByChildId);

// Admin and Parent routes
router.get('/:id', protect, authorize('admin', 'parent'), getInvoiceById);
router.get('/parent/:parentId', protect, authorize('admin', 'parent'), getInvoicesByParentId);

// PDF Generation route
router.get('/:id/pdf', protect, authorize('admin', 'parent'), getInvoicePDF);

module.exports = router;