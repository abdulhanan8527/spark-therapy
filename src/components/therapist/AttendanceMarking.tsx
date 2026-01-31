import { ArrowLeft, Check, X, Calendar } from 'lucide-react';
import { MobileFrame } from '../shared/MobileFrame';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';

export default function AttendanceMarking() {
  return (
    <MobileFrame color="bg-teal-600">
      <div className="bg-gray-50 min-h-[667px]">
        {/* App Bar */}
        <div className="bg-teal-600 text-white px-6 py-4 flex items-center gap-4">
          <button>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-white">Mark Attendance</h2>
            <p className="text-teal-100 text-sm">Monday, Dec 8, 2025</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {/* Date Selector */}
          <Card className="mb-4">
            <label className="block text-gray-700 mb-2 text-sm">Select Date</label>
            <input
              type="date"
              defaultValue="2025-12-08"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Card className="text-center p-3 bg-green-50 border-green-200">
              <p className="text-2xl text-green-600 mb-1">5</p>
              <p className="text-gray-600 text-xs">Present</p>
            </Card>
            <Card className="text-center p-3 bg-red-50 border-red-200">
              <p className="text-2xl text-red-600 mb-1">1</p>
              <p className="text-gray-600 text-xs">Absent</p>
            </Card>
            <Card className="text-center p-3 bg-gray-50 border-gray-200">
              <p className="text-2xl text-gray-600 mb-1">2</p>
              <p className="text-gray-600 text-xs">Pending</p>
            </Card>
          </div>

          {/* Today's Sessions */}
          <div>
            <h3 className="text-gray-900 mb-3">Today's Sessions (8)</h3>
            <div className="space-y-3">
              {[
                { name: 'Emma Johnson', time: '3:00 PM', status: 'marked', present: true },
                { name: 'Liam Chen', time: '4:00 PM', status: 'marked', present: true },
                { name: 'Olivia Martinez', time: '2:00 PM', status: 'marked', present: true },
                { name: 'Noah Williams', time: '3:30 PM', status: 'marked', present: false },
                { name: 'Sophia Davis', time: '2:30 PM', status: 'marked', present: true },
                { name: 'Ethan Brown', time: '4:30 PM', status: 'marked', present: true },
                { name: 'Ava Wilson', time: '1:30 PM', status: 'pending', present: null },
                { name: 'Mason Garcia', time: '5:00 PM', status: 'pending', present: null },
              ].map((session, idx) => (
                <Card key={idx}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 shrink-0">
                      {session.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 mb-1">{session.name}</p>
                      <p className="text-gray-500 text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {session.time}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {session.status === 'pending' ? (
                        <>
                          <button className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors">
                            <Check className="w-5 h-5" />
                          </button>
                          <button className="w-10 h-10 bg-red-600 text-white rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors">
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      ) : session.present ? (
                        <StatusBadge status="Present" variant="success" />
                      ) : (
                        <StatusBadge status="Absent" variant="danger" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <button className="w-full bg-teal-600 text-white py-3 rounded-lg">
              Save All Changes
            </button>
            <p className="text-gray-500 text-center text-xs mt-3">
              Attendance is auto-synced with admin dashboard
            </p>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
