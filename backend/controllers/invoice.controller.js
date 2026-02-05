const invoiceService = require('../services/invoice.service');
const PDFGenerator = require('../utils/pdfGenerator');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Create a new invoice
 * @route POST /api/invoices
 * @access Admin
 */
const createInvoice = async (req, res) => {
  try {
    // Only admins can create invoices
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const invoice = await invoiceService.createInvoice(req.body);
    successResponse(res, invoice, 'Invoice created successfully', 201);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Get all invoices
 * @route GET /api/invoices
 * @access Admin
 */
const getAllInvoices = async (req, res) => {
  try {
    // Only admins can view all invoices
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { page, limit, sortBy, sortOrder, ...filters } = req.query;
    const options = { page, limit, sortBy, sortOrder };
    
    const result = await invoiceService.getAllInvoices(filters, options);
    successResponse(res, result, 'Invoices retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Get invoice by ID
 * @route GET /api/invoices/:id
 * @access Admin, Parent
 */
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Parents can only view their own invoices
    if (req.user.role === 'parent') {
      const invoice = await invoiceService.getInvoiceById(id);
      // After populate, parentId is an object with _id property
      const parentIdString = invoice.parentId._id ? invoice.parentId._id.toString() : invoice.parentId.toString();
      if (parentIdString !== req.user._id.toString()) {
        return errorResponse(res, 'Access denied. Invoice does not belong to you.', 403);
      }
      return successResponse(res, invoice, 'Invoice retrieved successfully');
    }
    
    // Admins can view any invoice
    if (req.user.role === 'admin') {
      const invoice = await invoiceService.getInvoiceById(id);
      return successResponse(res, invoice, 'Invoice retrieved successfully');
    }
    
    return errorResponse(res, 'Access denied.', 403);
  } catch (error) {
    errorResponse(res, error.message, 404);
  }
};

/**
 * Update invoice by ID
 * @route PUT /api/invoices/:id
 * @access Admin
 */
const updateInvoice = async (req, res) => {
  try {
    // Only admins can update invoices
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { id } = req.params;
    const invoice = await invoiceService.updateInvoice(id, req.body);
    successResponse(res, invoice, 'Invoice updated successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Delete invoice by ID
 * @route DELETE /api/invoices/:id
 * @access Admin
 */
const deleteInvoice = async (req, res) => {
  try {
    // Only admins can delete invoices
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { id } = req.params;
    const result = await invoiceService.deleteInvoice(id);
    successResponse(res, result, 'Invoice deleted successfully');
  } catch (error) {
    errorResponse(res, error.message, 404);
  }
};

/**
 * Get invoices by parent ID
 * @route GET /api/invoices/parent/:parentId
 * @access Admin, Parent
 */
const getInvoicesByParentId = async (req, res) => {
  try {
    const { parentId } = req.params;
    
    // Parents can only view their own invoices
    if (req.user.role === 'parent' && parentId !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied. You can only view your own invoices.', 403);
    }
    
    // Admins can view any parent's invoices
    const invoices = await invoiceService.getInvoicesByParentId(parentId);
    successResponse(res, invoices || [], 'Parent invoices retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Get invoices by child ID
 * @route GET /api/invoices/child/:childId
 * @access Admin
 */
const getInvoicesByChildId = async (req, res) => {
  try {
    // Only admins can view invoices by child ID
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { childId } = req.params;
    const invoices = await invoiceService.getInvoicesByChildId(childId);
    successResponse(res, invoices || [], 'Child invoices retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

const getInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch the invoice with related data
    const invoice = await invoiceService.getInvoiceById(id);
    
    // Check access permissions
    if (req.user.role === 'parent') {
      // After populate, parentId is an object with _id property
      const parentIdString = invoice.parentId._id ? invoice.parentId._id.toString() : invoice.parentId.toString();
      if (parentIdString !== req.user._id.toString()) {
        return errorResponse(res, 'Access denied. Invoice does not belong to you.', 403);
      }
    }
    
    // Generate PDF
    const pdfBuffer = await PDFGenerator.generateInvoicePDF(invoice);
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice_${invoice.invoiceNumber}.pdf"`);
    
    // Send PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    errorResponse(res, 'Error generating PDF: ' + error.message, 500);
  }
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getInvoicesByParentId,
  getInvoicesByChildId,
  getInvoicePDF
};