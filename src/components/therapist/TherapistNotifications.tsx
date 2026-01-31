import { ArrowLeft, Bell, AlertCircle, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { MobileFrame } from '../shared/MobileFrame';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';

export default function TherapistNotifications() {
  return (
    <MobileFrame color="bg-teal-600">
      <div className="bg-gray-50 min-h-[667px]">
        {/* App Bar */}
        <div className="bg-teal-600 text-white px-6 py-4 flex items-center gap-4">
          <button>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-white">Notifications</h2>
          <button className="ml-auto text-sm">Mark All Read</button>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {['All', 'Reminders', 'Tasks', 'Messages'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${
                  tab === 'All'
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {/* Reminders */}
            <p className="text-gray-500 text-sm mt-4 mb-2">Today</p>
            
            <Card>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-900">Daily Feedback Missing</p>
                    <StatusBadge status="Urgent" variant="danger" />
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    3 daily feedbacks not yet submitted for today's sessions
                  </p>
                  <p className="text-gray-400 text-xs">2 hours ago</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-900">Weekly Video Due</p>
                    <StatusBadge status="Due Soon" variant="warning" />
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Emma Johnson's weekly video is due by end of day
                  </p>
                  <p className="text-gray-400 text-xs">4 hours ago</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 mb-1">Parent Response Received</p>
                  <p className="text-gray-600 text-sm mb-2">
                    Sarah Johnson replied to your feedback for Emma
                  </p>
                  <p className="text-gray-400 text-xs">5 hours ago</p>
                </div>
              </div>
            </Card>

            <p className="text-gray-500 text-sm mt-4 mb-2">Yesterday</p>

            <Card>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 mb-1">Feedback Sent Successfully</p>
                  <p className="text-gray-600 text-sm mb-2">
                    Daily feedback for Liam Chen has been sent to parent
                  </p>
                  <p className="text-gray-400 text-xs">Yesterday, 4:30 PM</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 mb-1">Schedule Update</p>
                  <p className="text-gray-600 text-sm mb-2">
                    Noah Williams' session rescheduled to 4:00 PM tomorrow
                  </p>
                  <p className="text-gray-400 text-xs">Yesterday, 2:15 PM</p>
                </div>
              </div>
            </Card>

            <p className="text-gray-500 text-sm mt-4 mb-2">This Week</p>

            <Card>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 mb-1">Quarterly Report Reminder</p>
                  <p className="text-gray-600 text-sm mb-2">
                    2 quarterly reports due by Dec 31, 2025
                  </p>
                  <p className="text-gray-400 text-xs">Dec 6, 2025</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 mb-1">IEP Goal Achieved</p>
                  <p className="text-gray-600 text-sm mb-2">
                    Emma Johnson mastered "th" sound articulation goal
                  </p>
                  <p className="text-gray-400 text-xs">Dec 5, 2025</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
