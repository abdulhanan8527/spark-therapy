import { useState } from 'react';
import { ArrowLeft, MessageSquare, Video, FileText, Calendar, Target, Phone, Mail, BookOpen } from 'lucide-react';
import { MobileFrame } from '../shared/MobileFrame';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';
import ProgramBuilder from './ProgramBuilder';
import { TherapistSpecialty } from './ProgramBuilderTypes';

export default function ChildDetailView() {
  const [currentView, setCurrentView] = useState<'profile' | 'programs'>('profile');

  // For demo purposes, we'll simulate different therapist specialties
  const therapistSpecialty: TherapistSpecialty = 'aba'; // This would come from user context in a real app

  if (currentView === 'programs') {
    return <ProgramBuilder therapistSpecialty={therapistSpecialty} childName="Emma Johnson" />;
  }

  return (
    <MobileFrame color="bg-teal-600">
      <div className="bg-gray-50 min-h-[667px]">
        {/* App Bar */}
        <div className="bg-teal-600 text-white px-6 py-4 flex items-center gap-4">
          <button onClick={() => setCurrentView('profile')}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-white">Child Profile</h2>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {/* Child Info Card */}
          <Card className="mb-4 bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center text-white text-2xl">
                👧
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 mb-1">Emma Johnson</h3>
                <p className="text-gray-600 text-sm mb-2">Age 6 • Female</p>
                <StatusBadge status="Active Patient" variant="success" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Diagnosis:</p>
                <p className="text-gray-900">Autism Spectrum</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Start Date:</p>
                <p className="text-gray-900">Jan 15, 2025</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Session Time:</p>
                <p className="text-gray-900">3:00 PM</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Frequency:</p>
                <p className="text-gray-900">3x per week</p>
              </div>
            </div>
          </Card>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setCurrentView('profile')}
              className="flex-1 py-2 bg-teal-600 text-white rounded-lg text-sm"
            >
              Profile
            </button>
            <button
              onClick={() => setCurrentView('programs')}
              className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"
            >
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                Programs
              </div>
            </button>
          </div>

          {/* Parent Contact */}
          <Card className="mb-4">
            <h3 className="text-gray-900 mb-3">Parent/Guardian</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span>👩</span>
                </div>
                <div>
                  <p className="text-gray-900">Sarah Johnson</p>
                  <p className="text-gray-500 text-sm">Mother</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm">
                  <Phone className="w-4 h-4" />
                  Call
                </button>
                <button className="flex-1 bg-teal-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm">
                  <Mail className="w-4 h-4" />
                  Email
                </button>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Card className="text-center p-3">
              <p className="text-2xl text-green-600 mb-1">92%</p>
              <p className="text-gray-600 text-xs">Attendance</p>
            </Card>
            <Card className="text-center p-3">
              <p className="text-2xl text-blue-600 mb-1">8/12</p>
              <p className="text-gray-600 text-xs">Goals Met</p>
            </Card>
            <Card className="text-center p-3">
              <p className="text-2xl text-purple-600 mb-1">23</p>
              <p className="text-gray-600 text-xs">Sessions</p>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-4">
            <h3 className="text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Card className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">Mark Attendance</p>
                  <p className="text-gray-500 text-xs">Today's session</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm">
                    Present
                  </button>
                  <button className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm">
                    Absent
                  </button>
                </div>
              </Card>

              <Card className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">Add Daily Feedback</p>
                  <p className="text-gray-500 text-xs">Session notes</p>
                </div>
                <button className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm">
                  Add
                </button>
              </Card>

              <Card className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">Upload Weekly Video</p>
                  <p className="text-gray-500 text-xs">Progress recording</p>
                </div>
                <button className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-sm">
                  Upload
                </button>
              </Card>

              <Card className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">Quarterly Report</p>
                  <p className="text-gray-500 text-xs">Due: Dec 31, 2025</p>
                </div>
                <StatusBadge status="Due Soon" variant="warning" />
              </Card>
            </div>
          </div>

          {/* IEP Goals Summary */}
          <Card className="mb-4">
            <h3 className="text-gray-900 mb-3">Current IEP Goals</h3>
            <div className="space-y-3">
              {[
                { goal: 'Articulate "th" sounds correctly', progress: 100, status: 'Mastered' },
                { goal: 'Identify and name 50 common objects', progress: 85, status: 'In Progress' },
                { goal: 'Take turns in group activities', progress: 80, status: 'In Progress' },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-700 text-sm">{item.goal}</p>
                    <span className="text-xs text-gray-600">{item.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.progress === 100 ? 'bg-green-600' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <h3 className="text-gray-900 mb-3">Recent Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Last Feedback:</span>
                <span className="text-gray-900">Yesterday, 3:45 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Video:</span>
                <span className="text-gray-900">Dec 1, 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Report:</span>
                <span className="text-gray-900">Oct 5, 2025 (Q3)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MobileFrame>
  );
}