import { ArrowLeft, Search, MessageSquare, Send } from 'lucide-react';
import { MobileFrame } from '../shared/MobileFrame';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';
import { useState } from 'react';

export default function DailyFeedback() {
  const [view, setView] = useState<'list' | 'detail'>('list');

  if (view === 'detail') {
    return (
      <MobileFrame color="bg-blue-600">
        <div className="bg-gray-50 min-h-[667px]">
          {/* App Bar */}
          <div className="bg-blue-600 text-white px-6 py-4 flex items-center gap-4">
            <button onClick={() => setView('list')}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-white">Daily Feedback</h2>
              <p className="text-blue-100 text-sm">Dec 8, 2025</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-4">
            {/* Therapist Info */}
            <Card className="mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white">
                  DS
                </div>
                <div>
                  <p className="text-gray-900">Dr. Sarah Smith</p>
                  <p className="text-gray-500 text-sm">Speech Therapist</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>📅 Today</span>
                <span>🕐 3:45 PM</span>
              </div>
            </Card>

            {/* Feedback Content */}
            <Card className="mb-4">
              <h3 className="text-gray-900 mb-3">Session Summary</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-700 mb-1">Activities Completed:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Picture naming - 15 items</li>
                    <li>Sound repetition exercises</li>
                    <li>Interactive story time</li>
                  </ul>
                </div>
                <div>
                  <p className="text-gray-700 mb-1">Progress Notes:</p>
                  <p className="text-gray-600">
                    Emma showed great improvement in pronouncing "th" sounds today. She was engaged throughout the session and completed all activities with minimal prompts. Continue practicing at home with the worksheet provided.
                  </p>
                </div>
                <div>
                  <p className="text-gray-700 mb-1">Behavior:</p>
                  <div className="flex gap-2">
                    <StatusBadge status="Cooperative" variant="success" />
                    <StatusBadge status="Focused" variant="success" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-700 mb-1">Homework:</p>
                  <p className="text-gray-600">
                    Practice "th" sound words 5 minutes daily
                  </p>
                </div>
              </div>
            </Card>

            {/* Attachments */}
            <Card className="mb-4">
              <h3 className="text-gray-900 mb-3">Attachments</h3>
              <div className="flex gap-2">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📄</span>
                </div>
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🖼️</span>
                </div>
              </div>
            </Card>

            {/* Parent Reply */}
            <Card>
              <h3 className="text-gray-900 mb-3">Your Response</h3>
              <textarea
                placeholder="Write a reply to the therapist..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none"
                rows={4}
              />
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg mt-2 flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Send Reply
              </button>
            </Card>
          </div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame color="bg-blue-600">
      <div className="bg-gray-50 min-h-[667px]">
        {/* App Bar */}
        <div className="bg-blue-600 text-white px-6 py-4">
          <h2 className="text-white mb-3">Daily Feedback</h2>
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by date..."
              className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-900 text-sm"
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          <p className="text-gray-500 text-sm mb-4">Last 7 days</p>

          {/* Feedback List */}
          <div className="space-y-3">
            {[
              { date: 'Today', time: '3:45 PM', therapist: 'Dr. Sarah Smith', preview: 'Emma had a great session today! Completed 3 activities...', status: 'New', variant: 'success' as const },
              { date: 'Yesterday', time: '3:30 PM', therapist: 'Dr. Sarah Smith', preview: 'Focused on communication skills. Emma responded well...', status: 'Read', variant: 'neutral' as const },
              { date: 'Dec 6', time: '3:45 PM', therapist: 'Dr. Michael Lee', preview: 'Physical therapy session - worked on balance exercises...', status: 'Read', variant: 'neutral' as const },
              { date: 'Dec 5', time: '3:30 PM', therapist: 'Dr. Sarah Smith', preview: 'Speech therapy progress continues. New words introduced...', status: 'Read', variant: 'neutral' as const },
              { date: 'Dec 4', time: '3:45 PM', therapist: 'Dr. Sarah Smith', preview: 'Emma was very cooperative today. Practiced phonics...', status: 'Read', variant: 'neutral' as const },
              { date: 'Dec 3', time: '3:30 PM', therapist: 'Dr. Michael Lee', preview: 'Great progress in motor skills development...', status: 'Read', variant: 'neutral' as const },
            ].map((feedback, idx) => (
              <Card key={idx} onClick={() => setView('detail')}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-gray-900">{feedback.date}</p>
                      <StatusBadge status={feedback.status} variant={feedback.variant} />
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{feedback.therapist}</p>
                    <p className="text-gray-500 text-sm truncate">{feedback.preview}</p>
                    <p className="text-gray-400 text-xs mt-2">{feedback.time}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
