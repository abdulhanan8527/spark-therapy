import React, { useState } from 'react';
import { Plus, Send, FileText, Calendar, Eye, Edit, Trash2, Download, AlertCircle, CheckCircle, Clock, X, CreditCard } from '../../components/SimpleIcons';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';
import { Invoice, InvoiceItem, InvoiceStatus, Client } from './InvoiceTypes';
import PaymentReview from './PaymentReview';

const InvoiceManagement = () => {
  const [view, setView] = useState<'list' | 'form' | 'preview' | 'review' | 'payment-review'>('list');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    taxRate: 15, // Default tax rate
    notes: '',
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 'item1', description: 'Speech Therapy Session', quantity: 1, unitPrice: 500, subtotal: 500 }
  ]);

  // Mock data for clients
  const [clients] = useState<Client[]>([
    {
      id: 'client1',
      name: 'Emma Johnson',
      email: 'emma.johnson@example.com',
      phone: '+27 12 345 6789',
      address: '123 Main St, Cape Town',
      parentId: 'parent1',
      parentName: 'Sarah Johnson',
      parentEmail: 'sarah.johnson@example.com',
      parentPhone: '+27 98 765 4321'
    },
    {
      id: 'client2',
      name: 'Liam Chen',
      email: 'liam.chen@example.com',
      phone: '+27 11 222 3333',
      address: '456 Oak Ave, Johannesburg',
      parentId: 'parent2',
      parentName: 'Michael Chen',
      parentEmail: 'michael.chen@example.com',
      parentPhone: '+27 44 555 6666'
    }
  ]);

  // Mock data for invoices
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'inv1',
      clientId: 'client1',
      clientName: 'Emma Johnson',
      invoiceDate: '2025-12-01',
      dueDate: '2025-12-31',
      items: [
        { id: 'item1', description: 'Speech Therapy Session', quantity: 5, unitPrice: 500, subtotal: 2500 },
        { id: 'item2', description: 'Assessment Report', quantity: 1, unitPrice: 800, subtotal: 800 }
      ],
      discountType: 'percentage',
      discountValue: 10,
      taxRate: 15,
      subtotal: 3300,
      discountAmount: 330,
      taxAmount: 445.5,
      totalAmount: 3415.5,
      notes: 'Monthly therapy sessions for December',
      status: 'paid',
      pdfUrl: '/invoice-inv1.pdf',
      createdAt: '2025-12-01T10:30:00Z',
      updatedAt: '2025-12-05T14:20:00Z'
    },
    {
      id: 'inv2',
      clientId: 'client1',
      clientName: 'Emma Johnson',
      invoiceDate: '2025-12-10',
      dueDate: '2026-01-10',
      items: [
        { id: 'item1', description: 'Occupational Therapy Session', quantity: 4, unitPrice: 600, subtotal: 2400 }
      ],
      discountType: 'fixed',
      discountValue: 200,
      taxRate: 15,
      subtotal: 2400,
      discountAmount: 200,
      taxAmount: 330,
      totalAmount: 2530,
      notes: 'January therapy sessions',
      status: 'sent',
      pdfUrl: '/invoice-inv2.pdf',
      createdAt: '2025-12-10T09:15:00Z',
      updatedAt: '2025-12-10T09:15:00Z'
    },
    {
      id: 'inv3',
      clientId: 'client2',
      clientName: 'Liam Chen',
      invoiceDate: '2025-12-05',
      dueDate: '2025-12-20',
      items: [
        { id: 'item1', description: 'Initial Assessment', quantity: 1, unitPrice: 1200, subtotal: 1200 }
      ],
      discountType: 'percentage',
      discountValue: 0,
      taxRate: 15,
      subtotal: 1200,
      discountAmount: 0,
      taxAmount: 180,
      totalAmount: 1380,
      notes: 'Comprehensive developmental assessment',
      status: 'overdue',
      pdfUrl: '/invoice-inv3.pdf',
      createdAt: '2025-12-05T11:45:00Z',
      updatedAt: '2025-12-05T11:45:00Z'
    }
  ]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle client selection
  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setFormData(prev => ({
        ...prev,
        clientId: client.id,
        clientName: client.name
      }));
    }
  };

  // Add new item row
  const addItemRow = () => {
    const newItem: InvoiceItem = {
      id: `item${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      subtotal: 0
    };
    setItems(prev => [...prev, newItem]);
  };

  // Update item
  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate subtotal if quantity or unitPrice changes
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.subtotal = updatedItem.quantity * updatedItem.unitPrice;
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Remove item
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = formData.discountType === 'percentage' 
      ? subtotal * (formData.discountValue / 100)
      : formData.discountValue;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (formData.taxRate / 100);
    const totalAmount = taxableAmount + taxAmount;
    
    return { subtotal, discountAmount, taxAmount, totalAmount };
  };

  // Submit invoice
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.clientId) {
      alert('Please select a client');
      return;
    }
    
    if (items.some(item => !item.description.trim())) {
      alert('Please fill in all item descriptions');
      return;
    }
    
    const totals = calculateTotals();
    
    // Show preview before saving
    setView('preview');
  };

  // Save invoice
  const saveInvoice = () => {
    const totals = calculateTotals();
    
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      clientId: formData.clientId,
      clientName: formData.clientName,
      invoiceDate: formData.invoiceDate,
      dueDate: formData.dueDate,
      items: [...items],
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      taxRate: formData.taxRate,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount,
      notes: formData.notes,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setInvoices(prev => [newInvoice, ...prev]);
    
    // Reset form
    setFormData({
      clientId: '',
      clientName: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      discountType: 'percentage',
      discountValue: 0,
      taxRate: 15,
      notes: '',
    });
    setItems([
      { id: 'item1', description: 'Speech Therapy Session', quantity: 1, unitPrice: 500, subtotal: 500 }
    ]);
    setSelectedClient(null);
    
    // Return to list view
    setView('list');
    
    alert('Invoice created successfully!');
  };

  // Send invoice
  const sendInvoice = (invoiceId: string) => {
    setInvoices(prev => 
      prev.map(invoice => 
        invoice.id === invoiceId 
          ? { ...invoice, status: 'sent', updatedAt: new Date().toISOString() } 
          : invoice
      )
    );
    
    alert('Invoice sent to client successfully!');
  };

  // Delete invoice
  const deleteInvoice = (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK');
  };

  // Get status variant for badge
  const getStatusVariant = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid': return 'success';
      case 'sent': return 'info';
      case 'overdue': return 'danger';
      case 'draft': return 'neutral';
      case 'pending-review': return 'warning';
      case 'rejected': return 'danger';
      default: return 'neutral';
    }
  };

  // Get status label
  const getStatusLabel = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'sent': return 'Sent';
      case 'overdue': return 'Overdue';
      case 'draft': return 'Draft';
      case 'pending-review': return 'Pending Review';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Management</h1>
            <p className="text-gray-600">Create and manage invoices for clients</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('payment-review')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <CreditCard className="w-5 h-5" />
              Payment Review
            </button>
            <button
              onClick={() => setView('form')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
              Create New Invoice
            </button>
          </div>
        </div>
      </div>

      {view === 'list' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="text-center p-4 bg-blue-50 border-blue-200">
              <p className="text-2xl text-blue-600 mb-1">{invoices.length}</p>
              <p className="text-gray-600 text-sm">Total Invoices</p>
            </Card>
            <Card className="text-center p-4 bg-green-50 border-green-200">
              <p className="text-2xl text-green-600 mb-1">
                {invoices.filter(i => i.status === 'paid').length}
              </p>
              <p className="text-gray-600 text-sm">Paid</p>
            </Card>
            <Card className="text-center p-4 bg-yellow-50 border-yellow-200">
              <p className="text-2xl text-yellow-600 mb-1">
                {invoices.filter(i => i.status === 'sent').length}
              </p>
              <p className="text-gray-600 text-sm">Sent</p>
            </Card>
            <Card className="text-center p-4 bg-red-50 border-red-200">
              <p className="text-2xl text-red-600 mb-1">
                {invoices.filter(i => i.status === 'overdue').length}
              </p>
              <p className="text-gray-600 text-sm">Overdue</p>
            </Card>
          </div>

          {/* Invoices List */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">All Invoices</h2>
            
            {invoices.length === 0 ? (
              <Card className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-900 mb-1">No invoices created yet</h3>
                <p className="text-gray-500 mb-4">
                  Create your first invoice to get started
                </p>
                <button
                  onClick={() => setView('form')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                >
                  Create Invoice
                </button>
              </Card>
            ) : (
              <div className="space-y-4">
                {invoices.map(invoice => (
                  <div key={invoice.id}>
                    <Card>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-gray-900 font-medium">INV-{invoice.id.substring(4)}</h3>
                            <StatusBadge 
                              status={getStatusLabel(invoice.status)} 
                              variant={getStatusVariant(invoice.status)} 
                            />
                          </div>
                          <p className="text-gray-700 text-sm mb-1">
                            Client: {invoice.clientName}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span>Date: {formatDate(invoice.invoiceDate)}</span>
                            <span>Due: {formatDate(invoice.dueDate)}</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(invoice.totalAmount)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setView('preview');
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {invoice.status === 'draft' && (
                            <button 
                              onClick={() => sendInvoice(invoice.id)}
                              className="p-2 text-gray-500 hover:text-green-600"
                              title="Send Invoice"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteInvoice(invoice.id)}
                            className="p-2 text-gray-500 hover:text-red-600"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {view === 'payment-review' && (
        <PaymentReview />
      )}

      {view === 'form' && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Create New Invoice</h3>
            <button
              onClick={() => setView('list')}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm mb-2">Client *</label>
                <select
                  name="clientId"
                  value={formData.clientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.parentName})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm mb-2">Invoice Date</label>
                  <input
                    type="date"
                    name="invoiceDate"
                    value={formData.invoiceDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm mb-2">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-gray-700 text-sm">Services/Items</label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-3 text-xs text-gray-500 font-normal">Description</th>
                        <th className="text-left py-2 px-3 text-xs text-gray-500 font-normal w-24">Qty</th>
                        <th className="text-left py-2 px-3 text-xs text-gray-500 font-normal w-24">Price</th>
                        <th className="text-left py-2 px-3 text-xs text-gray-500 font-normal w-24">Total</th>
                        <th className="text-left py-2 px-3 text-xs text-gray-500 font-normal w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={item.id} className="border-t border-gray-100">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Service description"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="py-2 px-3 text-sm">
                            {formatCurrency(item.subtotal)}
                          </td>
                          <td className="py-2 px-3">
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm mb-2">Discount</label>
                  <div className="flex gap-2">
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm mb-2">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">
                      {formatCurrency(calculateTotals().subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-gray-900">
                      {formatCurrency(calculateTotals().discountAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax ({formData.taxRate}%):</span>
                    <span className="text-gray-900">
                      {formatCurrency(calculateTotals().taxAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                    <span className="text-gray-900 font-medium">Total:</span>
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(calculateTotals().totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes or terms"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Preview & Save
                </button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {view === 'preview' && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Invoice Preview</h3>
              <button
                onClick={() => {
                  setView(selectedInvoice ? 'list' : 'form');
                  setSelectedInvoice(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">INVOICE</h2>
                  <p className="text-gray-600">INV-{selectedInvoice.id.substring(4)}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 font-medium">SPARK Therapy Services</p>
                  <p className="text-gray-600 text-sm">123 Therapy Lane</p>
                  <p className="text-gray-600 text-sm">Cape Town, South Africa</p>
                  <p className="text-gray-600 text-sm">info@sparktherapy.co.za</p>
                </div>
              </div>
              
              {/* Client & Invoice Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-gray-700 font-medium mb-2">Bill To:</p>
                  <p className="text-gray-900">{selectedInvoice.clientName}</p>
                  <p className="text-gray-600 text-sm">Parent: {clients.find(c => c.id === selectedInvoice.clientId)?.parentName}</p>
                  <p className="text-gray-600 text-sm">{clients.find(c => c.id === selectedInvoice.clientId)?.email}</p>
                </div>
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-700 text-sm">Invoice Date:</p>
                      <p className="text-gray-900">{formatDate(selectedInvoice.invoiceDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-700 text-sm">Due Date:</p>
                      <p className="text-gray-900">{formatDate(selectedInvoice.dueDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Items Table */}
              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-gray-700 font-medium">Description</th>
                      <th className="text-right py-3 text-gray-700 font-medium w-24">Qty</th>
                      <th className="text-right py-3 text-gray-700 font-medium w-32">Unit Price</th>
                      <th className="text-right py-3 text-gray-700 font-medium w-32">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map(item => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-3 text-gray-900">{item.description}</td>
                        <td className="py-3 text-gray-900 text-right">{item.quantity}</td>
                        <td className="py-3 text-gray-900 text-right">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="py-3 text-gray-900 text-right">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Totals */}
              <div className="ml-auto w-full md:w-64">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">
                      {formatCurrency(selectedInvoice.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-gray-900">
                      {formatCurrency(selectedInvoice.discountAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax ({selectedInvoice.taxRate}%):</span>
                    <span className="text-gray-900">
                      {formatCurrency(selectedInvoice.taxAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                    <span className="text-gray-900 font-medium">Total:</span>
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(selectedInvoice.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedInvoice.notes && (
                <div className="mt-8 pt-4 border-t border-gray-200">
                  <p className="text-gray-700 font-medium mb-2">Notes:</p>
                  <p className="text-gray-600">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setView(selectedInvoice ? 'list' : 'form');
                  setSelectedInvoice(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"
              >
                Back
              </button>
              {!selectedInvoice.pdfUrl ? (
                <button
                  onClick={saveInvoice}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Save Invoice
                </button>
              ) : (
                <button
                  onClick={() => sendInvoice(selectedInvoice.id)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Invoice
                </button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;