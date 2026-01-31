import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';

export default function NotificationsCenter() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications Center</h1>
        <p className="text-gray-600">Manage and review all system notifications</p>
      </div>
      
      <div className="flex gap-4 mb-6">
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">
          All Notifications
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          Unread
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          Archived
        </button>
      </div>
      
      <div className="space-y-4">
        <Card>
          <div className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-900 font-medium">Missing Daily Feedback</h3>
                  <span className="text-gray-500 text-sm">2 hours ago</span>
                </div>
                <p className="text-gray-600 mb-3">
                  3 therapists have not submitted daily feedback for today's sessions:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                  <li>John Doe - Session with Emma Johnson (3:00 PM)</li>
                  <li>Alice Smith - Session with Liam Chen (4:00 PM)</li>
                  <li>Robert Brown - Session with Olivia Martinez (2:00 PM)</li>
                </ul>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
                    Send Reminder
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-900 font-medium">Weekly Video Due</h3>
                  <span className="text-gray-500 text-sm">5 hours ago</span>
                </div>
                <p className="text-gray-600 mb-3">
                  2 therapists have not uploaded required weekly videos:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                  <li>John Doe - Emma Johnson (Week of Nov 24-30)</li>
                  <li>Alice Smith - Liam Chen (Week of Nov 24-30)</li>
                </ul>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
                    Send Reminder
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-900 font-medium">New Complaint Received</h3>
                  <span className="text-gray-500 text-sm">1 day ago</span>
                </div>
                <p className="text-gray-600 mb-3">
                  A new complaint has been submitted by a parent:
                </p>
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="text-gray-900 text-sm mb-1">Frequent session cancellations</p>
                  <p className="text-gray-600 text-xs">Submitted by: Sarah Johnson (Parent of Emma Johnson)</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
                    Assign to Team Lead
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">
                    View Complaint
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}