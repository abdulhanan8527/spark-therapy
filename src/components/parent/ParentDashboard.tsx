import { Bell, MessageSquare, Video, FileText, Target, Calendar, AlertCircle, DollarSign, Upload } from 'lucide-react';
import { MobileFrame } from '../shared/MobileFrame';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';

interface ParentDashboardProps {
  onNavigate: (screen: string) => void;
}

export default function ParentDashboard({ onNavigate }: ParentDashboardProps) {
  return (
    <MobileFrame color="bg-blue-600">
      <div className="bg-gray-50 min-h-[667px]">
        {/* App Bar */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <p className="text-blue-100 text-sm">Welcome back,</p>
            <h2 className="text-white">Sarah Johnson</h2>
          </div>
          <button className="relative">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
              3
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-4 pb-20">
          {/* Child Profile Card */}
          <Card className="mb-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl">
                👧
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 mb-1">Emma Johnson</h3>
                <p className="text-gray-600 text-sm mb-2">Age 6 • Autism Spectrum</p>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Attendance:</span>
                    <span className="text-green-600 ml-1">92%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Therapist:</span>
                    <span className="text-gray-900 ml-1">Dr. Smith</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl text-gray-900 mb-1">23/25</p>
              <p className="text-gray-500 text-sm">Days Present</p>
            </Card>
            <Card className="text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl text-gray-900 mb-1">8/12</p>
              <p className="text-gray-500 text-sm">Goals Achieved</p>
            </Card>
          </div>

          {/* Latest Updates */}
          <div className="mb-4">
            <h3 className="text-gray-900 mb-3">Latest Updates</h3>

            {/* Daily Feedback */}
            <Card className="mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-900">Daily Feedback</p>
                    <StatusBadge status="New" variant="success" />
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Emma had a great session today! Completed 3 activities...
                  </p>
                  <p className="text-gray-400 text-xs">Today, 3:45 PM</p>
                </div>
              </div>
            </Card>

            {/* Weekly Video */}
            <Card className="mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-900">Weekly Video</p>
                    <StatusBadge status="⏰ 5 days left" variant="warning" />
                  </div>
                  <div className="w-full h-20 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                    <Video className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400 text-xs">Week of Dec 1-7</p>
                </div>
              </div>
            </Card>

            {/* Quarterly Report */}
            <Card>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 mb-1">Q4 Progress Report</p>
                  <p className="text-gray-600 text-sm mb-2">Ready for review</p>
                  <p className="text-gray-400 text-xs">Uploaded Dec 5, 2025</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions Grid */}
          <div className="mb-4">
            <h3 className="text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: MessageSquare, label: 'Daily Feedback', color: 'bg-blue-100 text-blue-600', screen: 'feedback' },
                { icon: Video, label: 'Weekly Videos', color: 'bg-purple-100 text-purple-600', screen: 'videos' },
                { icon: FileText, label: 'Reports', color: 'bg-teal-100 text-teal-600', screen: 'reports' },
                { icon: Target, label: 'IEP Goals', color: 'bg-green-100 text-green-600', screen: 'iep' },
                { icon: Calendar, label: 'Attendance', color: 'bg-orange-100 text-orange-600', screen: 'attendance' },
                { icon: AlertCircle, label: 'Complaints', color: 'bg-red-100 text-red-600', screen: 'complaints' },
                { icon: DollarSign, label: 'Fees', color: 'bg-yellow-100 text-yellow-600', screen: 'fees' },
                { icon: Upload, label: 'Upload Video', color: 'bg-indigo-100 text-indigo-600', screen: 'upload' },
              ].map((item, idx) => (
                <Card
                  key={idx}
                  onClick={() => onNavigate(item.screen)}
                  className="text-center p-3"
                >
                  <div className={`w-12 h-12 ${item.color} rounded-xl mx-auto mb-2 flex items-center justify-center`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <p className="text-gray-700 text-xs leading-tight">{item.label}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex justify-around max-w-[375px] mx-auto">
            <button className="flex flex-col items-center gap-1 text-blue-600">
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-600 rounded-full" />
              </div>
              <span className="text-xs">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400">
              <Calendar className="w-6 h-6" />
              <span className="text-xs">Schedule</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400">
              <MessageSquare className="w-6 h-6" />
              <span className="text-xs">Messages</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400">
              <Bell className="w-6 h-6" />
              <span className="text-xs">Alerts</span>
            </button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
