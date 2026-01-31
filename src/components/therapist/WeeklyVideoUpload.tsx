import { ArrowLeft, Video, Upload, AlertCircle } from 'lucide-react';
import { MobileFrame } from '../shared/MobileFrame';
import { Card } from '../shared/Card';

export default function WeeklyVideoUpload() {
  return (
    <MobileFrame color="bg-teal-600">
      <div className="bg-gray-50 min-h-[667px]">
        {/* App Bar */}
        <div className="bg-teal-600 text-white px-6 py-4 flex items-center gap-4">
          <button>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-white">Weekly Video Upload</h2>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {/* Warning Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
              <div>
                <p className="text-gray-900 text-sm mb-1">Auto-Delete Notice</p>
                <p className="text-gray-600 text-xs">
                  Videos automatically delete from parent view after 7 days for privacy and storage management.
                </p>
              </div>
            </div>
          </div>

          <Card className="mb-4">
            <label className="block text-gray-700 mb-2 text-sm">Select Child</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4">
              <option>Emma Johnson</option>
              <option>Liam Chen</option>
              <option>Olivia Martinez</option>
              <option>Noah Williams</option>
            </select>

            <label className="block text-gray-700 mb-2 text-sm">Week Period</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4">
              <option>Week of Dec 1-7, 2025</option>
              <option>Week of Dec 8-14, 2025</option>
              <option>Week of Nov 24-30, 2025</option>
            </select>

            <label className="block text-gray-700 mb-2 text-sm">Video Title</label>
            <input
              type="text"
              placeholder="e.g., Week 10 Progress - Speech Therapy"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />

            <label className="block text-gray-700 mb-2 text-sm">Upload Video</label>
            <button className="w-full border-2 border-dashed border-gray-300 rounded-lg py-10 flex flex-col items-center gap-3 hover:border-gray-400 transition-colors mb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Video className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-center">
                <p className="text-gray-700 mb-1">Tap to select video</p>
                <p className="text-gray-500 text-xs">MP4, MOV (Recommended: 5-10 mins)</p>
              </div>
            </button>

            {/* Preview area placeholder */}
            <div className="bg-gray-100 rounded-lg p-4 mb-4 hidden">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-purple-200 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 text-sm">video_emma_week10.mp4</p>
                  <p className="text-gray-500 text-xs">8:45 • 45.2 MB</p>
                </div>
              </div>
            </div>

            <label className="block text-gray-700 mb-2 text-sm">Notes for Parent</label>
            <textarea
              placeholder="Add context about what's shown in the video and key progress highlights..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
              rows={4}
            />
          </Card>

          <button className="w-full bg-teal-600 text-white py-3 rounded-lg flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Video
          </button>

          <p className="text-gray-500 text-center text-xs mt-4">
            Video will be available to parent immediately after upload
          </p>
        </div>
      </div>
    </MobileFrame>
  );
}
