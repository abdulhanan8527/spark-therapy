import { Bell, MessageSquare, Video, FileText, Calendar, AlertTriangle, CheckCircle, User } from 'lucide-react';
import { MobileFrame } from '../shared/MobileFrame';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';

interface TherapistDashboardProps {
  onNavigate: (screen: string) => void;
}

export default function TherapistDashboard({ onNavigate }: TherapistDashboardProps) {
  return (
    <MobileFrame color="bg-teal-600">
      <div className="bg-gray-50 min-h-[667px]">
        {/* App Bar */}
        <div className="bg-teal-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <p className="text-teal-100 text-sm">Therapist Portal</p>
            <h2 className="text-white">Dr. Sarah Smith</h2>
          </div>
          <button 
            onClick={() => {
              // In a real app, this would open the notifications center
              // For now, we'll just navigate to the notifications screen
              onNavigate('notifications');
            }}
            className="relative"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
              5
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-4 pb-20">
          {/* Task Summary */}
          <div className="mb-4">
            <h3 className="text-gray-900 mb-3">Today's Tasks</h3>
            <div className="grid grid-cols-3 gap-2">
              <Card className="text-center p-3 bg-yellow-50 border-yellow-200">
                <p className="text-2xl text-yellow-600 mb-1">3</p>
                <p className="text-gray-600 text-xs">Missing Feedback</p>
              </Card>
              <Card className="text-center p-3 bg-purple-50 border-purple-200">
                <p className="text-2xl text-purple-600 mb-1">1</p>
                <p className="text-gray-600 text-xs">Video Due</p>
              </Card>
              <Card className="text-center p-3 bg-red-50 border-red-200">
                <p className="text-2xl text-red-600 mb-1">2</p>
                <p className="text-gray-600 text-xs">Reports Due</p>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-4">
            <h3 className="text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card onClick={() => onNavigate('feedback')} className="p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl mb-3 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-gray-900 mb-1">Add Feedback</p>
                <p className="text-gray-500 text-xs">Daily session notes</p>
              </Card>
              <Card onClick={() => onNavigate('video')} className="p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl mb-3 flex items-center justify-center">
                  <Video className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-gray-900 mb-1">Upload Video</p>
                <p className="text-gray-500 text-xs">Weekly recordings</p>
              </Card>
              <Card onClick={() => onNavigate('attendance')} className="p-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl mb-3 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-gray-900 mb-1">Mark Attendance</p>
                <p className="text-gray-500 text-xs">Today's sessions</p>
              </Card>
              <Card onClick={() => onNavigate('report')} className="p-4">
                <div className="w-12 h-12 bg-teal-100 rounded-xl mb-3 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-teal-600" />
                </div>
                <p className="text-gray-900 mb-1">Upload Report</p>
                <p className="text-gray-500 text-xs">Quarterly updates</p>
              </Card>
              <Card onClick={() => onNavigate('leave-requests')} className="p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl mb-3 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-gray-900 mb-1">Leave Requests</p>
                <p className="text-gray-500 text-xs">Request time off</p>
              </Card>
            </div>
          </div>

          {/* Assigned Children */}
          <div className="mb-4">
            <h3 className="text-gray-900 mb-3">My Assigned Children (8)</h3>
            <div className="space-y-3">
              {[
                { name: 'Emma Johnson', age: 6, sessions: '3:00 PM', attendance: '92%', feedback: 'missing', hasAlert: true },
                { name: 'Liam Chen', age: 5, sessions: '4:00 PM', attendance: '88%', feedback: 'done', hasAlert: false },
                { name: 'Olivia Martinez', age: 7, sessions: '2:00 PM', attendance: '95%', feedback: 'done', hasAlert: false },
                { name: 'Noah Williams', age: 6, sessions: '3:30 PM', attendance: '90%', feedback: 'missing', hasAlert: true },
              ].map((child, idx) => (
                <div key={idx}>
                  <Card onClick={() => onNavigate('child')}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white shrink-0">
                        {child.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900">{child.name}</p>
                          {child.hasAlert && (
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                        <p className="text-gray-500 text-sm">Age {child.age} • Today {child.sessions}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">
                            Attendance: <span className="text-green-600">{child.attendance}</span>
                          </span>
                          {child.feedback === 'missing' ? (
                            <StatusBadge status="Feedback Due" variant="warning" />
                          ) : (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Updated
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tasks Alert */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
              <div>
                <p className="text-gray-900 text-sm mb-1">Pending Tasks</p>
                <p className="text-gray-600 text-xs mb-3">
                  You have 3 daily feedbacks and 1 weekly video pending upload
                </p>
                <button className="text-yellow-700 text-sm underline">View All Tasks</button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex justify-around max-w-[375px] mx-auto">
            <button className="flex flex-col items-center gap-1 text-teal-600">
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-6 h-6 bg-teal-600 rounded-full" />
              </div>
              <span className="text-xs">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400">
              <User className="w-6 h-6" />
              <span className="text-xs">Children</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400">
              <Calendar className="w-6 h-6" />
              <span className="text-xs">Schedule</span>
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
