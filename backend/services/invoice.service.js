const Invoice = require('../models/Invoice');
const User = require('../models/User');
const Child = require('../models/Child');

/**
 * Create a new invoice
 * @param {Object} invoiceData - Invoice data
 * @returns {Promise<Object>} Created invoice
 */
const createInvoice = async (invoiceData) => {
  try {
    console.log('=== INVOICE SERVICE: CREATE INVOICE ===');
    console.log('Input invoice data:', invoiceData);
    
    // Get child to extract parentId
    if (!invoiceData.childId) {
      throw new Error('childId is required');
    }
    
    const child = await Child.findById(invoiceData.childId);
    if (!child) {
      throw new Error('Child not found');
    }
    
    console.log('Found child:', child._id, 'with parent:', child.parentId);
    
    // Generate invoice number if not provided
    if (!invoiceData.invoiceNumber) {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      invoiceData.invoiceNumber = `INV-${timestamp}-${random}`;
    }
    
    // Set parentId from child
    invoiceData.parentId = child.parentId;
    
    console.log('Creating invoice with data:', {
      ...invoiceData,
      invoiceNumber: invoiceData.invoiceNumber,
      parentId: invoiceData.parentId
    });
    
    const invoice = new Invoice(invoiceData);
    await invoice.save();
    
    console.log('Invoice created successfully:', invoice._id);
    return invoice;
  } catch (error) {
    console.error('Create invoice error:', error);
    throw new Error(`Failed to create invoice: ${error.message}`);
  }
};

/**
 * Get all invoices with optional filters
 * @param {Object} filters - Filter criteria
 * @param {Object} options - Pagination and sorting options
 * @returns {Promise<Array>} Array of invoices
 */
const getAllInvoices = async (filters = {}, options = {}) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = options;
    const skip = (page - 1) * limit;
    
    const invoices = await Invoice.find(filters)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('parentId', 'name email')
      .populate('childId', 'firstName lastName');
    
    const total = await Invoice.countDocuments(filters);
    
    return {
      success: true,
      data: invoices,
      message: 'Invoices retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: []
    };
  }
};

/**
 * Get invoice by ID
 * @param {string} id - Invoice ID
 * @returns {Promise<Object>} Invoice document
 */
const getInvoiceById = async (id) => {
  try {
    const invoice = await Invoice.findById(id)
      .populate('parentId', 'name email')
      .populate('childId', 'firstName lastName');
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    return invoice;
  } catch (error) {
    throw new Error(`Failed to fetch invoice: ${error.message}`);
  }
};

/**
 * Update invoice by ID
 * @param {string} id - Invoice ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated invoice
 */
const updateInvoice = async (id, updateData) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    return invoice;
  } catch (error) {
    throw new Error(`Failed to update invoice: ${error.message}`);
  }
};

/**
 * Delete invoice by ID
 * @param {string} id - Invoice ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteInvoice = async (id) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(id);
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    return { message: 'Invoice deleted successfully' };
  } catch (error) {
    throw new Error(`Failed to delete invoice: ${error.message}`);
  }
};

/**
 * Get invoices by parent ID
 * @param {string} parentId - Parent ID
 * @returns {Promise<Array>} Array of invoices
 */
const getInvoicesByParentId = async (parentId) => {
  try {
    const invoices = await Invoice.find({ parentId })
      .populate('childId', 'firstName lastName');
    return invoices;
  } catch (error) {
    throw new Error(`Failed to fetch parent invoices: ${error.message}`);
  }
};

/**
 * Get invoices by child ID
 * @param {string} childId - Child ID
 * @returns {Promise<Array>} Array of invoices
 */
const getInvoicesByChildId = async (childId) => {
  try {
    const invoices = await Invoice.find({ childId })
      .populate('parentId', 'name email');
    return invoices;
  } catch (error) {
    throw new Error(`Failed to fetch child invoices: ${error.message}`);
  }
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getInvoicesByParentId,
  getInvoicesByChildId
};