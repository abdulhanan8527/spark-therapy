import { DollarSign, Download, Eye, Upload, CheckCircle } from 'lucide-react';
import { MobileFrame } from '../shared/MobileFrame';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';
import { useState } from 'react';

export default function FeesModule() {
  const [view, setView] = useState<'list' | 'detail' | 'upload'>('list');

  if (view === 'upload') {
    return (
      <MobileFrame color="bg-yellow-600">
        <div className="bg-gray-50 min-h-[667px]">
          {/* App Bar */}
          <div className="bg-yellow-600 text-white px-6 py-4 flex items-center gap-4">
            <button onClick={() => setView('detail')}>
              <span className="text-xl">←</span>
            </button>
            <h2 className="text-white">Upload Receipt</h2>
          </div>

          {/* Content */}
          <div className="px-4 py-4">
            <Card className="mb-4">
              <div className="mb-4">
                <p className="text-gray-700 mb-1">Invoice Number</p>
                <p className="text-gray-900">INV-2025-1208</p>
              </div>
              <div className="mb-4">
                <p className="text-gray-700 mb-1">Amount</p>
                <p className="text-gray-900">$450.00</p>
              </div>
            </Card>

            <Card className="mb-4">
              <label className="block text-gray-700 mb-3 text-sm">Payment Method</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4">
                <option>Select payment method...</option>
                <option>Bank Transfer</option>
                <option>Credit Card</option>
                <option>Debit Card</option>
                <option>Check</option>
                <option>Cash</option>
              </select>

              <label className="block text-gray-700 mb-3 text-sm">Transaction Reference (Optional)</label>
              <input
                type="text"
                placeholder="Enter reference number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              />

              <label className="block text-gray-700 mb-3 text-sm">Upload Receipt/Proof</label>
              <button className="w-full border-2 border-dashed border-gray-300 rounded-lg py-8 flex flex-col items-center gap-2 hover:border-gray-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-gray-600 text-sm">Tap to upload</span>
                <span className="text-gray-400 text-xs">Image or PDF (Max 5MB)</span>
              </button>
            </Card>

            <button className="w-full bg-yellow-600 text-white py-3 rounded-lg flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Submit Payment Proof
            </button>

            <p className="text-gray-500 text-center text-xs mt-4">
              Your receipt will be verified within 1-2 business days
            </p>
          </div>
        </div>
      </MobileFrame>
    );
  }

  if (view === 'detail') {
    return (
      <MobileFrame color="bg-yellow-600">
        <div className="bg-gray-50 min-h-[667px]">
          {/* App Bar */}
          <div className="bg-yellow-600 text-white px-6 py-4 flex items-center gap-4">
            <button onClick={() => setView('list')}>
              <span className="text-xl">←</span>
            </button>
            <div>
              <h2 className="text-white">Invoice Details</h2>
              <p className="text-yellow-100 text-sm">INV-2025-1208</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-4">
            {/* Status */}
            <Card className="mb-4 bg-red-50 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700 text-sm mb-1">Payment Status</p>
                  <p className="text-red-600">Unpaid - Overdue</p>
                </div>
                <StatusBadge status="Overdue" variant="danger" />
              </div>
            </Card>

            {/* Invoice Info */}
            <Card className="mb-4">
              <h3 className="text-gray-900 mb-3">Invoice Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice Date:</span>
                  <span className="text-gray-900">Dec 1, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="text-red-600">Dec 7, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Billing Period:</span>
                  <span className="text-gray-900">November 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient:</span>
                  <span className="text-gray-900">Emma Johnson</span>
                </div>
              </div>
            </Card>

            {/* Services */}
            <Card className="mb-4">
              <h3 className="text-gray-900 mb-3">Services</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-gray-900">Speech Therapy Sessions</p>
                    <p className="text-gray-500 text-xs">12 sessions × $30</p>
                  </div>
                  <p className="text-gray-900">$360.00</p>
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-gray-900">Physical Therapy Sessions</p>
                    <p className="text-gray-500 text-xs">3 sessions × $30</p>
                  </div>
                  <p className="text-gray-900">$90.00</p>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-gray-900">Total Amount</span>
                  <span className="text-gray-900">$450.00</span>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => setView('upload')}
                className="w-full bg-yellow-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Payment Receipt
              </button>
              <button className="w-full bg-white text-gray-700 py-3 rounded-lg flex items-center justify-center gap-2 border border-gray-300">
                <Download className="w-4 h-4" />
                Download Invoice PDF
              </button>
            </div>
          </div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame color="bg-yellow-600">
      <div className="bg-gray-50 min-h-[667px]">
        {/* App Bar */}
        <div className="bg-yellow-600 text-white px-6 py-4">
          <h2 className="text-white mb-1">Fees & Payments</h2>
          <p className="text-yellow-100 text-sm">Manage invoices and receipts</p>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Card className="text-center p-3">
              <p className="text-lg text-red-600 mb-1">$450</p>
              <p className="text-gray-600 text-xs">Overdue</p>
            </Card>
            <Card className="text-center p-3">
              <p className="text-lg text-yellow-600 mb-1">$300</p>
              <p className="text-gray-600 text-xs">Pending</p>
            </Card>
            <Card className="text-center p-3">
              <p className="text-lg text-green-600 mb-1">$2.1k</p>
              <p className="text-gray-600 text-xs">Paid</p>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {['All', 'Unpaid', 'Paid', 'Overdue'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${
                  tab === 'All'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Invoices List */}
          <div className="space-y-3">
            {[
              {
                invoice: 'INV-2025-1208',
                period: 'November 2025',
                amount: '$450.00',
                date: 'Due: Dec 7, 2025',
                status: 'Overdue',
                variant: 'danger' as const,
              },
              {
                invoice: 'INV-2025-1109',
                period: 'October 2025',
                amount: '$300.00',
                date: 'Due: Dec 15, 2025',
                status: 'Unpaid',
                variant: 'warning' as const,
              },
              {
                invoice: 'INV-2025-1012',
                period: 'September 2025',
                amount: '$390.00',
                date: 'Paid: Oct 18, 2025',
                status: 'Paid',
                variant: 'success' as const,
              },
              {
                invoice: 'INV-2025-0915',
                period: 'August 2025',
                amount: '$420.00',
                date: 'Paid: Sep 20, 2025',
                status: 'Paid',
                variant: 'success' as const,
              },
            ].map((invoice, idx) => (
              <Card key={idx} onClick={() => idx === 0 && setView('detail')}>
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    invoice.variant === 'danger' ? 'bg-red-100' :
                    invoice.variant === 'warning' ? 'bg-yellow-100' :
                    'bg-green-100'
                  }`}>
                    <DollarSign className={`w-5 h-5 ${
                      invoice.variant === 'danger' ? 'text-red-600' :
                      invoice.variant === 'warning' ? 'text-yellow-600' :
                      'text-green-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-gray-900">{invoice.invoice}</p>
                      <StatusBadge status={invoice.status} variant={invoice.variant} />
                    </div>
                    <p className="text-gray-600 text-sm mb-1">{invoice.period}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900">{invoice.amount}</p>
                      <p className="text-gray-400 text-xs">{invoice.date}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Help Text */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <DollarSign className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-gray-900 text-sm mb-1">Payment Methods</p>
                <p className="text-gray-600 text-xs">
                  We accept bank transfer, credit/debit cards, checks, and cash. Upload your receipt after payment for verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
