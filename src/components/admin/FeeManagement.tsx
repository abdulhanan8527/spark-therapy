import { Plus, Search, Download, CheckCircleIcon, X } from '../../components/SimpleIcons';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';

export default function FeeManagement() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Fee Management</h1>
          <p className="text-gray-600">Manage invoices, payments, and receipts</p>
        </div>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create New Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
          <p className="text-3xl text-gray-900 mb-2">$21,300</p>
          <p className="text-green-600 text-sm">+8% from last month</p>
        </Card>
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-gray-600 text-sm mb-1">Overdue</p>
          <p className="text-3xl text-red-600 mb-2">$5,400</p>
          <p className="text-gray-600 text-sm">12 invoices</p>
        </Card>
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-gray-600 text-sm mb-1">Unpaid</p>
          <p className="text-3xl text-yellow-600 mb-2">$2,400</p>
          <p className="text-gray-600 text-sm">8 invoices</p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-gray-600 text-sm mb-1">Paid This Month</p>
          <p className="text-3xl text-green-600 mb-2">$13,500</p>
          <p className="text-gray-600 text-sm">45 invoices</p>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Invoices List */}
        <div className="col-span-2">
          <Card className="mb-6">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <select className="px-4 py-2 border border-gray-300 rounded-lg">
                <option>All Status</option>
                <option>Paid</option>
                <option>Unpaid</option>
                <option>Overdue</option>
              </select>
            </div>
          </Card>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Invoice</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Parent</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Due Date</th>
                    <th className="text-left py-3 px-4 text-gray-600 text-sm">Status</th>
                    <th className="text-right py-3 px-4 text-gray-600 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { invoice: 'INV-2025-1208', parent: 'Sarah Johnson', amount: '$450', due: 'Dec 7, 2025', status: 'Overdue', variant: 'danger' as const },
                    { invoice: 'INV-2025-1207', parent: 'Michael Chen', amount: '$300', due: 'Dec 15, 2025', status: 'Unpaid', variant: 'warning' as const },
                    { invoice: 'INV-2025-1206', parent: 'Emily Davis', amount: '$390', due: 'Dec 10, 2025', status: 'Paid', variant: 'success' as const },
                    { invoice: 'INV-2025-1205', parent: 'David Williams', amount: '$420', due: 'Dec 5, 2025', status: 'Paid', variant: 'success' as const },
                    { invoice: 'INV-2025-1204', parent: 'Maria Martinez', amount: '$360', due: 'Dec 20, 2025', status: 'Unpaid', variant: 'warning' as const },
                  ].map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <p className="text-gray-900">{item.invoice}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-900">{item.parent}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-900">{item.amount}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-600 text-sm">{item.due}</p>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={item.status} variant={item.variant} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Receipt Approval */}
        <div>
          <Card className="mb-6">
            <h3 className="text-gray-900 mb-4">Pending Receipt Approvals</h3>
            <div className="space-y-3">
              {[
                { invoice: 'INV-2025-1208', parent: 'Sarah Johnson', amount: '$450', uploaded: '2 hours ago' },
                { invoice: 'INV-2025-1207', parent: 'Michael Chen', amount: '$300', uploaded: '5 hours ago' },
                { invoice: 'INV-2025-1204', parent: 'Maria Martinez', amount: '$360', uploaded: '1 day ago' },
              ].map((receipt, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3">
                  <p className="text-gray-900 text-sm mb-1">{receipt.invoice}</p>
                  <p className="text-gray-600 text-sm mb-2">{receipt.parent}</p>
                  <p className="text-gray-900 mb-2">{receipt.amount}</p>
                  <p className="text-gray-400 text-xs mb-3">{receipt.uploaded}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-green-600 text-white py-1.5 rounded-lg flex items-center justify-center gap-1 text-sm">
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button className="flex-1 bg-red-600 text-white py-1.5 rounded-lg flex items-center justify-center gap-1 text-sm">
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">This Month:</span>
                <span className="text-gray-900">45 paid</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Collection Rate:</span>
                <span className="text-green-600">84%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Invoice:</span>
                <span className="text-gray-900">$300</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Outstanding:</span>
                <span className="text-red-600">$7,800</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
