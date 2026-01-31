import React, { useState } from 'react';
import { CreditCard, Upload, Eye, CheckCircle, Clock, AlertCircle, X, FileText } from 'lucide-react';
import { MobileFrame } from '../shared/MobileFrame';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';
import { Invoice, InvoiceStatus, PaymentMethod } from '../admin/InvoiceTypes';

const InvoicesPayments = () => {
  const [view, setView] = useState<'list' | 'detail' | 'payment' | 'upload'>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptNotes, setReceiptNotes] = useState('');

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
      clientId: 'client1',
      clientName: 'Emma Johnson',
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

  // View invoice details
  const viewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setView('detail');
  };

  // Initiate payment
  const initiatePayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setView('payment');
  };

  // Handle file upload for manual transfer
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  // Remove uploaded file
  const removeFile = () => {
    setReceiptFile(null);
  };

  // Submit manual payment
  const submitManualPayment = () => {
    if (!selectedInvoice) return;
    
    // Update invoice status to pending review
    setInvoices(prev => 
      prev.map(inv => 
        inv.id === selectedInvoice.id 
          ? { ...inv, status: 'pending-review', updatedAt: new Date().toISOString() } 
          : inv
      )
    );
    
    // Reset form
    setReceiptFile(null);
    setReceiptNotes('');
    setSelectedInvoice(null);
    setView('list');
    
    alert('Receipt uploaded successfully! Your payment is pending review.');
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
    return date.toLocaleDateString('en-ZA');
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

  // Process online payment
  const processOnlinePayment = () => {
    if (!selectedInvoice) return;
    
    // Simulate payment processing
    setTimeout(() => {
      // Update invoice status to paid
      setInvoices(prev => 
        prev.map(inv => 
          inv.id === selectedInvoice.id 
            ? { ...inv, status: 'paid', updatedAt: new Date().toISOString() } 
            : inv
        )
      );
      
      setSelectedInvoice(null);
      setView('list');
      
      alert('Payment processed successfully! A receipt has been sent to your email.');
    }, 2000);
  };

  return (
    <MobileFrame color="bg-blue-600">
      <div className="bg-gray-50 min-h-[667px]">
        {/* App Bar */}
        <div className="bg-blue-600 text-white px-6 py-4">
          <h2 className="text-white mb-1">Invoices & Payments</h2>
          <p className="text-blue-100 text-sm">Manage your invoices and payments</p>
        </div>

        {/* Content */}
        <div className="px-4 py-4 pb-20">
          {view === 'list' && (
            <>
              <div>
                <h3 className="text-gray-900 mb-3">Your Invoices</h3>
                {invoices.length === 0 ? (
                  <Card className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-gray-900 mb-1">No Invoices</h3>
                    <p className="text-gray-500 text-sm">
                      You don't have any invoices at the moment
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {invoices.map(invoice => (
                      <div key={invoice.id}>
                        <Card 
                          onClick={() => viewInvoiceDetails(invoice)}
                          className="cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="text-gray-900 font-medium">
                                INV-{invoice.id.substring(4)}
                              </h4>
                              <p className="text-gray-600 text-sm">
                                Due: {formatDate(invoice.dueDate)}
                              </p>
                            </div>
                            <StatusBadge 
                              status={getStatusLabel(invoice.status)} 
                              variant={getStatusVariant(invoice.status)} 
                            />
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-900 font-medium">
                              {formatCurrency(invoice.totalAmount)}
                            </span>
                            {invoice.status === 'sent' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  initiatePayment(invoice);
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
                              >
                                Pay Now
                              </button>
                            )}
                          </div>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {view === 'detail' && selectedInvoice && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setView('list')}
                  className="p-2 bg-gray-100 rounded-full"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-gray-900">Invoice Details</h3>
              </div>
              
              <Card className="mb-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-gray-900 font-medium">
                      INV-{selectedInvoice.id.substring(4)}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Issued: {formatDate(selectedInvoice.invoiceDate)}
                    </p>
                  </div>
                  <StatusBadge 
                    status={getStatusLabel(selectedInvoice.status)} 
                    variant={getStatusVariant(selectedInvoice.status)} 
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 text-sm font-medium mb-2">Items</p>
                    <div className="space-y-2">
                      {selectedInvoice.items.map(item => (
                        <div key={item.id} className="flex justify-between">
                          <div>
                            <p className="text-gray-900 text-sm">{item.description}</p>
                            <p className="text-gray-500 text-xs">
                              {item.quantity} × {formatCurrency(item.unitPrice)}
                            </p>
                          </div>
                          <span className="text-gray-900 text-sm">
                            {formatCurrency(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-900">
                          {formatCurrency(selectedInvoice.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount:</span>
                        <span className="text-gray-900">
                          {formatCurrency(selectedInvoice.discountAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax ({selectedInvoice.taxRate}%):</span>
                        <span className="text-gray-900">
                          {formatCurrency(selectedInvoice.taxAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
                        <span>Total:</span>
                        <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedInvoice.notes && (
                    <div>
                      <p className="text-gray-700 text-sm font-medium mb-1">Notes</p>
                      <p className="text-gray-600 text-sm">{selectedInvoice.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      View PDF
                    </button>
                    {selectedInvoice.status === 'sent' && (
                      <button
                        onClick={() => initiatePayment(selectedInvoice)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {view === 'payment' && selectedInvoice && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setView('detail')}
                  className="p-2 bg-gray-100 rounded-full"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-gray-900">Payment Options</h3>
              </div>
              
              <Card className="mb-4">
                <h4 className="text-gray-900 font-medium mb-4">
                  Pay {formatCurrency(selectedInvoice.totalAmount)}
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <button
                      onClick={processOnlinePayment}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 mb-3"
                    >
                      <CreditCard className="w-5 h-5" />
                      Pay with Card
                    </button>
                    <p className="text-gray-600 text-xs text-center">
                      Secure payment powered by Payfast
                    </p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-gray-50 px-2 text-gray-500">OR</span>
                    </div>
                  </div>
                  
                  <div>
                    <button
                      onClick={() => setView('upload')}
                      className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      Upload Bank Transfer Receipt
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {view === 'upload' && selectedInvoice && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setView('payment')}
                  className="p-2 bg-gray-100 rounded-full"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-gray-900">Upload Receipt</h3>
              </div>
              
              <Card>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">
                      Upload Bank Transfer Receipt
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {receiptFile ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700 text-sm">{receiptFile.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 text-sm mb-2">
                            Upload proof of bank transfer
                          </p>
                          <p className="text-gray-500 text-xs mb-3">
                            JPG, PNG, PDF (max 5MB)
                          </p>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            id="receipt-upload"
                          />
                          <label
                            htmlFor="receipt-upload"
                            className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm cursor-pointer hover:bg-gray-200"
                          >
                            Choose File
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={receiptNotes}
                      onChange={(e) => setReceiptNotes(e.target.value)}
                      placeholder="Additional information about your payment"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setView('payment')}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"
                    >
                      Back
                    </button>
                    <button
                      onClick={submitManualPayment}
                      disabled={!receiptFile}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 ${
                        receiptFile 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Submit Receipt
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </MobileFrame>
  );
};

export default InvoicesPayments;