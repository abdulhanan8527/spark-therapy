import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, FileText } from 'lucide-react';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';
import { Invoice, InvoiceStatus, Payment } from './InvoiceTypes';

const PaymentReview = () => {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [approvalReason, setApprovalReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Mock data for payments pending review
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 'pay1',
      invoiceId: 'inv4',
      method: 'manual',
      amount: 2100,
      status: 'pending',
      receiptUrl: '/receipt-pay1.jpg',
      paymentDate: '2025-12-12',
      reviewNotes: ''
    },
    {
      id: 'pay2',
      invoiceId: 'inv5',
      method: 'bank-transfer',
      amount: 1850,
      status: 'pending',
      receiptUrl: '/receipt-pay2.png',
      paymentDate: '2025-12-11',
      reviewNotes: 'Transfer reference: TRX123456'
    }
  ]);

  // Mock data for invoices
  const invoices: Invoice[] = [
    {
      id: 'inv4',
      clientId: 'client3',
      clientName: 'Sophia Williams',
      invoiceDate: '2025-12-08',
      dueDate: '2026-01-08',
      items: [
        { id: 'item1', description: 'Speech Therapy Session', quantity: 4, unitPrice: 500, subtotal: 2000 },
        { id: 'item2', description: 'Consultation Fee', quantity: 1, unitPrice: 100, subtotal: 100 }
      ],
      discountType: 'percentage',
      discountValue: 0,
      taxRate: 15,
      subtotal: 2100,
      discountAmount: 0,
      taxAmount: 315,
      totalAmount: 2415,
      notes: 'December therapy sessions',
      status: 'pending-review',
      pdfUrl: '/invoice-inv4.pdf',
      createdAt: '2025-12-08T09:30:00Z',
      updatedAt: '2025-12-12T11:15:00Z'
    },
    {
      id: 'inv5',
      clientId: 'client4',
      clientName: 'James Smith',
      invoiceDate: '2025-12-05',
      dueDate: '2026-01-05',
      items: [
        { id: 'item1', description: 'Occupational Therapy Session', quantity: 3, unitPrice: 600, subtotal: 1800 },
        { id: 'item2', description: 'Assessment Report', quantity: 1, unitPrice: 50, subtotal: 50 }
      ],
      discountType: 'fixed',
      discountValue: 0,
      taxRate: 15,
      subtotal: 1850,
      discountAmount: 0,
      taxAmount: 277.5,
      totalAmount: 2127.5,
      notes: 'OT sessions for December',
      status: 'pending-review',
      pdfUrl: '/invoice-inv5.pdf',
      createdAt: '2025-12-05T14:20:00Z',
      updatedAt: '2025-12-11T16:45:00Z'
    }
  ];

  // Get invoice by ID
  const getInvoiceById = (id: string) => {
    return invoices.find(invoice => invoice.id === id);
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

  // Approve payment
  const approvePayment = (paymentId: string) => {
    setPayments(prev => 
      prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, status: 'completed' } 
          : payment
      )
    );
    
    // Update invoice status to paid
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      const invoice = getInvoiceById(payment.invoiceId);
      if (invoice) {
        invoice.status = 'paid';
      }
    }
    
    setSelectedPayment(null);
    setApprovalReason('');
    alert('Payment approved successfully!');
  };

  // Reject payment
  const rejectPayment = (paymentId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    setPayments(prev => 
      prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, status: 'failed', reviewNotes: rejectionReason } 
          : payment
      )
    );
    
    // Update invoice status to rejected
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      const invoice = getInvoiceById(payment.invoiceId);
      if (invoice) {
        invoice.status = 'rejected';
      }
    }
    
    setSelectedPayment(null);
    setRejectionReason('');
    alert('Payment rejected successfully!');
  };

  // View payment details
  const viewPaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Review</h1>
        <p className="text-gray-600">Review and approve manual payment receipts</p>
      </div>

      {payments.length === 0 ? (
        <Card className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-gray-900 mb-1">No payments pending review</h3>
          <p className="text-gray-500">
            All manual payments have been reviewed
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {payments.map(payment => {
            const invoice = getInvoiceById(payment.invoiceId);
            return (
              <div key={payment.id}>
                <Card>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-gray-900 font-medium">
                          Payment #{payment.id.substring(3)}
                        </h3>
                        <StatusBadge status="Pending Review" variant="warning" />
                      </div>
                      
                      {invoice && (
                        <div className="mb-3">
                          <p className="text-gray-700 text-sm">
                            Invoice: <span className="font-medium">INV-{invoice.id.substring(3)}</span>
                          </p>
                          <p className="text-gray-700 text-sm">
                            Client: <span className="font-medium">{invoice.clientName}</span>
                          </p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span>
                          Amount: <span className="font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </span>
                        </span>
                        <span>
                          Date: <span className="font-medium text-gray-900">
                            {formatDate(payment.paymentDate || '')}
                          </span>
                        </span>
                        {payment.reviewNotes && (
                          <span>
                            Notes: <span className="font-medium text-gray-900">
                              {payment.reviewNotes}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => viewPaymentDetails(payment)}
                        className="p-2 text-gray-500 hover:text-blue-600"
                        title="View Receipt"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Payment Review - #{selectedPayment.id.substring(3)}
              </h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-gray-900 font-medium mb-3">Receipt Preview</h4>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-center min-h-[200px]">
                  {selectedPayment.receiptUrl ? (
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Bank Transfer Receipt</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Click to view/download
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No receipt uploaded</p>
                  )}
                </div>
              </div>
              
              {(() => {
                const invoice = getInvoiceById(selectedPayment.invoiceId);
                return invoice ? (
                  <div>
                    <h4 className="text-gray-900 font-medium mb-3">Invoice Details</h4>
                    <Card>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="text-gray-900 font-medium">
                            INV-{invoice.id.substring(3)}
                          </h5>
                          <p className="text-gray-600 text-sm">
                            Client: {invoice.clientName}
                          </p>
                        </div>
                        <StatusBadge 
                          status={
                            invoice.status === 'pending-review' 
                              ? 'Pending Review' 
                              : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)
                          } 
                          variant={
                            invoice.status === 'pending-review' 
                              ? 'warning' 
                              : invoice.status === 'paid' 
                                ? 'success' 
                                : 'danger'
                          } 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Invoice Date:</span>
                          <span className="text-gray-900">
                            {formatDate(invoice.invoiceDate)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Due Date:</span>
                          <span className="text-gray-900">
                            {formatDate(invoice.dueDate)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Amount:</span>
                          <span className="text-gray-900 font-medium">
                            {formatCurrency(invoice.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>
                ) : null;
              })()}
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedPayment(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"
                >
                  Cancel
                </button>
                
                <button
                  onClick={() => {
                    document.getElementById('reject-modal')?.classList.remove('hidden');
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                
                <button
                  onClick={() => approvePayment(selectedPayment.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {selectedPayment && (
        <div id="reject-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 hidden">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Reject Payment</h3>
              <button
                onClick={() => {
                  document.getElementById('reject-modal')?.classList.add('hidden');
                  setRejectionReason('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this payment"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    document.getElementById('reject-modal')?.classList.add('hidden');
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    rejectPayment(selectedPayment.id);
                    document.getElementById('reject-modal')?.classList.add('hidden');
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PaymentReview;