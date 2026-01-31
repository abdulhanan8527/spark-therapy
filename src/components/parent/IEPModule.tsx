import { ArrowLeft, Target, CheckCircle, Circle, TrendingUp } from 'lucide-react';
import { MobileFrame } from '../shared/MobileFrame';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';

export default function IEPModule() {
  return (
    <MobileFrame color="bg-green-600">
      <div className="bg-gray-50 min-h-[667px]">
        {/* App Bar */}
        <div className="bg-green-600 text-white px-6 py-4">
          <h2 className="text-white mb-1">IEP & Therapy Goals</h2>
          <p className="text-green-100 text-sm">Individual Education Plan</p>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {/* Progress Overview */}
          <Card className="mb-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Overall Progress</h3>
              <StatusBadge status="On Track" variant="success" />
            </div>
            
            {/* Progress Bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Goals Mastered</span>
                  <span className="text-green-600">8 of 12</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-green-600 rounded-full" style={{ width: '67%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">In Progress</span>
                  <span className="text-yellow-600">4 goals</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: '33%' }} />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-green-200">
              <div className="text-center">
                <p className="text-2xl text-green-600">67%</p>
                <p className="text-gray-600 text-xs">Complete</p>
              </div>
              <div className="text-center">
                <p className="text-2xl text-gray-900">92%</p>
                <p className="text-gray-600 text-xs">Attendance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl text-blue-600">+15%</p>
                <p className="text-gray-600 text-xs">This Quarter</p>
              </div>
            </div>
          </Card>

          {/* Goals by Category */}
          <div className="mb-4">
            <h3 className="text-gray-900 mb-3">Speech & Communication</h3>
            <div className="space-y-3">
              {[
                { goal: 'Articulate "th" sounds correctly', progress: 100, status: 'mastered' },
                { goal: 'Use 3-word sentences consistently', progress: 100, status: 'mastered' },
                { goal: 'Identify and name 50 common objects', progress: 85, status: 'progress' },
                { goal: 'Respond to "wh" questions', progress: 70, status: 'progress' },
              ].map((item, idx) => (
                <Card key={idx}>
                  <div className="flex gap-3">
                    <div className="shrink-0 mt-1">
                      {item.status === 'mastered' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 mb-2">{item.goal}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.status === 'mastered' ? 'bg-green-600' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{item.progress}%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Social Skills */}
          <div className="mb-4">
            <h3 className="text-gray-900 mb-3">Social Skills</h3>
            <div className="space-y-3">
              {[
                { goal: 'Make eye contact during conversation', progress: 100, status: 'mastered' },
                { goal: 'Take turns in group activities', progress: 80, status: 'progress' },
                { goal: 'Share toys with peers', progress: 75, status: 'progress' },
              ].map((item, idx) => (
                <Card key={idx}>
                  <div className="flex gap-3">
                    <div className="shrink-0 mt-1">
                      {item.status === 'mastered' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 mb-2">{item.goal}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.status === 'mastered' ? 'bg-green-600' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{item.progress}%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Motor Skills */}
          <div className="mb-4">
            <h3 className="text-gray-900 mb-3">Motor Skills</h3>
            <div className="space-y-3">
              {[
                { goal: 'Balance on one foot for 5 seconds', progress: 100, status: 'mastered' },
                { goal: 'Catch a ball from 5 feet away', progress: 90, status: 'progress' },
                { goal: 'Jump with both feet together', progress: 100, status: 'mastered' },
              ].map((item, idx) => (
                <Card key={idx}>
                  <div className="flex gap-3">
                    <div className="shrink-0 mt-1">
                      {item.status === 'mastered' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 mb-2">{item.goal}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.status === 'mastered' ? 'bg-green-600' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{item.progress}%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Next Review */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-gray-900 text-sm mb-1">Next IEP Review</p>
                <p className="text-gray-600 text-xs">
                  Scheduled for March 15, 2026 with Dr. Smith and therapy team
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
