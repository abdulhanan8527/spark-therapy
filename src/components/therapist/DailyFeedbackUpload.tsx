import { ArrowLeft, Paperclip, Send } from 'lucide-react';
import { MobileFrame } from '../shared/MobileFrame';
import { Card } from '../shared/Card';

export default function DailyFeedbackUpload() {
  return (
    <MobileFrame color="bg-teal-600">
      <div className="bg-gray-50 min-h-[667px]">
        {/* App Bar */}
        <div className="bg-teal-600 text-white px-6 py-4 flex items-center gap-4">
          <button>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-white">Daily Feedback</h2>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          <Card className="mb-4">
            <label className="block text-gray-700 mb-2 text-sm">Select Child</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4">
              <option>Emma Johnson - 3:00 PM</option>
              <option>Liam Chen - 4:00 PM</option>
              <option>Olivia Martinez - 2:00 PM</option>
              <option>Noah Williams - 3:30 PM</option>
            </select>

            <label className="block text-gray-700 mb-2 text-sm">Session Date & Time</label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <input
                type="date"
                defaultValue="2025-12-08"
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="time"
                defaultValue="15:00"
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <label className="block text-gray-700 mb-2 text-sm">Activities Completed</label>
            <textarea
              placeholder="List activities completed during the session..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none mb-4"
              rows={3}
            />

            <label className="block text-gray-700 mb-2 text-sm">Progress Notes</label>
            <textarea
              placeholder="Describe the child's performance, engagement, and progress..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none mb-4"
              rows={4}
            />

            <label className="block text-gray-700 mb-2 text-sm">Behavior Assessment</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Cooperative', 'Focused', 'Engaged', 'Distracted', 'Tired', 'Excited'].map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1.5 border border-gray-300 rounded-full text-sm hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            <label className="block text-gray-700 mb-2 text-sm">Homework/Practice Instructions</label>
            <textarea
              placeholder="Provide homework or practice activities for parents..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none mb-4"
              rows={3}
            />

            <label className="block text-gray-700 mb-2 text-sm">Attachments (Optional)</label>
            <button className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 flex flex-col items-center gap-2 hover:border-gray-400 transition-colors mb-4">
              <Paperclip className="w-6 h-6 text-gray-400" />
              <span className="text-gray-600 text-sm">Attach worksheets or photos</span>
            </button>
          </Card>

          <button className="w-full bg-teal-600 text-white py-3 rounded-lg flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            Send Feedback to Parent
          </button>

          <p className="text-gray-500 text-center text-xs mt-4">
            Auto-saved as draft • Parents will receive instant notification
          </p>
        </div>
      </div>
    </MobileFrame>
  );
}
