import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { MobileFrame } from '../shared/MobileFrame';
import { Card } from '../shared/Card';

export default function AttendanceModule() {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // December 2025 calendar data
  const calendarDays = [
    { date: null }, { date: 1, status: 'present' }, { date: 2, status: 'present' }, 
    { date: 3, status: 'present' }, { date: 4, status: 'present' }, { date: 5, status: 'present' }, 
    { date: 6, status: null },
    { date: 7, status: null }, { date: 8, status: 'present' }, { date: 9, status: 'absent' }, 
    { date: 10, status: 'present' }, { date: 11, status: 'present' }, { date: 12, status: 'present' },
    { date: 13, status: null },
    { date: 14, status: null }, { date: 15, status: 'present' }, { date: 16, status: 'present' },
    { date: 17, status: 'present' }, { date: 18, status: 'present' }, { date: 19, status: 'present' },
    { date: 20, status: null },
    { date: 21, status: null }, { date: 22, status: 'present' }, { date: 23, status: 'present' },
    { date: 24, status: null }, { date: 25, status: null }, { date: 26, status: 'present' },
    { date: 27, status: null },
    { date: 28, status: null }, { date: 29, status: 'present' }, { date: 30, status: 'present' },
    { date: 31, status: null },
  ];

  return (
    <MobileFrame color="bg-orange-600">
      <div className="bg-gray-50 min-h-[667px]">
        {/* App Bar */}
        <div className="bg-orange-600 text-white px-6 py-4">
          <h2 className="text-white mb-1">Attendance</h2>
          <p className="text-orange-100 text-sm">Track therapy sessions</p>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Card className="text-center p-3">
              <p className="text-2xl text-green-600 mb-1">23</p>
              <p className="text-gray-600 text-xs">Present</p>
            </Card>
            <Card className="text-center p-3">
              <p className="text-2xl text-red-600 mb-1">2</p>
              <p className="text-gray-600 text-xs">Absent</p>
            </Card>
            <Card className="text-center p-3">
              <p className="text-2xl text-green-600 mb-1">92%</p>
              <p className="text-gray-600 text-xs">Rate</p>
            </Card>
          </div>

          {/* Calendar */}
          <Card>
            {/* Month Header */}
            <div className="flex items-center justify-between mb-4">
              <button className="p-1">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h3 className="text-gray-900">December 2025</h3>
              <button className="p-1">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-gray-500 text-xs py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                if (!day.date) {
                  return <div key={idx} className="aspect-square" />;
                }

                let bgColor = 'bg-gray-100';
                let textColor = 'text-gray-400';
                
                if (day.status === 'present') {
                  bgColor = 'bg-green-100 border border-green-300';
                  textColor = 'text-green-700';
                } else if (day.status === 'absent') {
                  bgColor = 'bg-red-100 border border-red-300';
                  textColor = 'text-red-700';
                } else if (day.status === null && day.date) {
                  bgColor = 'bg-gray-50';
                  textColor = 'text-gray-400';
                }

                return (
                  <div
                    key={idx}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm ${bgColor} ${textColor}`}
                  >
                    {day.date}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
                <span className="text-xs text-gray-600">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />
                <span className="text-xs text-gray-600">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-50 rounded" />
                <span className="text-xs text-gray-600">No Session</span>
              </div>
            </div>
          </Card>

          {/* Recent Attendance */}
          <div className="mt-4">
            <h3 className="text-gray-900 mb-3">Recent Sessions</h3>
            <div className="space-y-2">
              {[
                { date: 'Dec 8, 2025', day: 'Monday', status: 'Present', time: '3:00 PM - 4:00 PM', therapist: 'Dr. Sarah Smith' },
                { date: 'Dec 9, 2025', day: 'Tuesday', status: 'Absent', time: '3:00 PM - 4:00 PM', therapist: 'Dr. Sarah Smith', reason: 'Sick leave' },
                { date: 'Dec 5, 2025', day: 'Friday', status: 'Present', time: '3:00 PM - 4:00 PM', therapist: 'Dr. Michael Lee' },
                { date: 'Dec 4, 2025', day: 'Thursday', status: 'Present', time: '3:00 PM - 4:00 PM', therapist: 'Dr. Sarah Smith' },
              ].map((session, idx) => (
                <Card key={idx}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      session.status === 'Present' 
                        ? 'bg-green-100' 
                        : 'bg-red-100'
                    }`}>
                      {session.status === 'Present' ? (
                        <span className="text-xl">✓</span>
                      ) : (
                        <span className="text-xl">✗</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-gray-900">{session.date}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          session.status === 'Present'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{session.therapist}</p>
                      <p className="text-gray-500 text-xs mt-1">{session.time}</p>
                      {session.reason && (
                        <p className="text-red-600 text-xs mt-1">Reason: {session.reason}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
