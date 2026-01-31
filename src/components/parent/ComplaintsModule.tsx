import { AlertCircle, Plus, Paperclip, Send } from 'lucide-react';
import { MobileFrame } from '../shared/MobileFrame';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';
import { useState } from 'react';

export default function ComplaintsModule() {
  const [view, setView] = useState<'list' | 'new' | 'detail'>('list');

  if (view === 'new') {
    return (
      <MobileFrame color="bg-red-600">
        <div className="bg-gray-50 min-h-[667px]">
          {/* App Bar */}
          <div className="bg-red-600 text-white px-6 py-4 flex items-center gap-4">
            <button onClick={() => setView('list')}>
              <span className="text-xl">←</span>
            </button>
            <h2 className="text-white">New Complaint</h2>
          </div>

          {/* Form */}
          <div className="px-4 py-4">
            <Card className="mb-4">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm">Child Name</label>
                <input
                  type="text"
                  value="Emma Johnson"
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm">Category</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Select category...</option>
                  <option>Therapy Quality</option>
                  <option>Therapist Conduct</option>
                  <option>Scheduling Issues</option>
                  <option>Facility/Environment</option>
                  <option>Billing/Payment</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm">Subject</label>
                <input
                  type="text"
                  placeholder="Brief description of the issue"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm">Description</label>
                <textarea
                  placeholder="Please provide detailed information about your concern..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                  rows={6}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm">Attachments (Optional)</label>
                <button className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 flex flex-col items-center gap-2 hover:border-gray-400 transition-colors">
                  <Paperclip className="w-6 h-6 text-gray-400" />
                  <span className="text-gray-600 text-sm">Tap to attach files</span>
                  <span className="text-gray-400 text-xs">Images, PDFs (Max 5MB)</span>
                </button>
              </div>
            </Card>

            <button className="w-full bg-red-600 text-white py-3 rounded-lg flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              Submit Complaint
            </button>

            <p className="text-gray-500 text-center text-xs mt-4">
              Your complaint will be reviewed within 24-48 hours
            </p>
          </div>
        </div>
      </MobileFrame>
    );
  }

  if (view === 'detail') {
    return (
      <MobileFrame color="bg-red-600">
        <div className="bg-gray-50 min-h-[667px]">
          {/* App Bar */}
          <div className="bg-red-600 text-white px-6 py-4 flex items-center gap-4">
            <button onClick={() => setView('list')}>
              <span className="text-xl">←</span>
            </button>
            <div>
              <h2 className="text-white">Complaint Details</h2>
              <p className="text-red-100 text-sm">#C2025-0042</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-4">
            {/* Status */}
            <Card className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-900">Status</h3>
                <StatusBadge status="Under Review" variant="warning" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted:</span>
                  <span className="text-gray-900">Dec 5, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="text-gray-900">Dec 7, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Assigned To:</span>
                  <span className="text-gray-900">Manager - Jane Doe</span>
                </div>
              </div>
            </Card>

            {/* Complaint Info */}
            <Card className="mb-4">
              <h3 className="text-gray-900 mb-3">Complaint Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Category:</p>
                  <p className="text-gray-900">Scheduling Issues</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Subject:</p>
                  <p className="text-gray-900">Frequent session cancellations</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Description:</p>
                  <p className="text-gray-700 leading-relaxed">
                    Our daughter's therapy sessions have been cancelled 3 times in the past 2 weeks with short notice. This is affecting her progress and our family schedule. We would appreciate more consistency.
                  </p>
                </div>
              </div>
            </Card>

            {/* Timeline */}
            <Card>
              <h3 className="text-gray-900 mb-3">Activity Timeline</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xs">📝</span>
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm">Admin Response</p>
                    <p className="text-gray-600 text-xs mb-1">
                      We've reviewed your concern and are working with the scheduling team to prevent future cancellations.
                    </p>
                    <p className="text-gray-400 text-xs">Dec 7, 2025 - 10:30 AM</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xs">👁️</span>
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm">Under Review</p>
                    <p className="text-gray-600 text-xs mb-1">
                      Your complaint has been assigned to the management team.
                    </p>
                    <p className="text-gray-400 text-xs">Dec 6, 2025 - 9:15 AM</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xs">✓</span>
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm">Complaint Submitted</p>
                    <p className="text-gray-600 text-xs mb-1">
                      Your complaint has been received.
                    </p>
                    <p className="text-gray-400 text-xs">Dec 5, 2025 - 4:20 PM</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame color="bg-red-600">
      <div className="bg-gray-50 min-h-[667px]">
        {/* App Bar */}
        <div className="bg-red-600 text-white px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-white">Complaints</h2>
              <p className="text-red-100 text-sm">Report concerns or issues</p>
            </div>
            <button
              onClick={() => setView('new')}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-600"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {['All', 'Pending', 'Under Review', 'Resolved'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${
                  tab === 'All'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Complaints List */}
          <div className="space-y-3">
            {[
              {
                id: '#C2025-0042',
                subject: 'Frequent session cancellations',
                date: 'Dec 5, 2025',
                status: 'Under Review',
                variant: 'warning' as const,
              },
              {
                id: '#C2025-0038',
                subject: 'Request for additional therapy resources',
                date: 'Nov 28, 2025',
                status: 'Resolved',
                variant: 'success' as const,
              },
              {
                id: '#C2025-0031',
                subject: 'Billing inquiry about invoice',
                date: 'Nov 15, 2025',
                status: 'Resolved',
                variant: 'success' as const,
              },
            ].map((complaint, idx) => (
              <Card key={idx} onClick={() => idx === 0 && setView('detail')}>
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-gray-900">{complaint.subject}</p>
                      <StatusBadge status={complaint.status} variant={complaint.variant} />
                    </div>
                    <p className="text-gray-500 text-sm">{complaint.id}</p>
                    <p className="text-gray-400 text-xs mt-2">{complaint.date}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Help Text */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-gray-900 text-sm mb-1">Need Immediate Help?</p>
                <p className="text-gray-600 text-xs mb-2">
                  For urgent concerns, please contact our support team directly.
                </p>
                <button className="text-blue-600 text-sm">Call Support: (555) 123-4567</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
