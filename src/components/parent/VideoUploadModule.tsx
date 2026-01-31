import { Upload, Video, CheckCircle, Clock, X } from 'lucide-react';
import { MobileFrame } from '../shared/MobileFrame';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';
import { useState } from 'react';

export default function VideoUploadModule() {
  const [view, setView] = useState<'list' | 'upload'>('list');

  if (view === 'upload') {
    return (
      <MobileFrame color="bg-indigo-600">
        <div className="bg-gray-50 min-h-[667px]">
          {/* App Bar */}
          <div className="bg-indigo-600 text-white px-6 py-4 flex items-center gap-4">
            <button onClick={() => setView('list')}>
              <span className="text-xl">←</span>
            </button>
            <h2 className="text-white">Upload Home Video</h2>
          </div>

          {/* Content */}
          <div className="px-4 py-4">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex gap-3">
                <Video className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-gray-900 text-sm mb-1">Share Home Progress</p>
                  <p className="text-gray-600 text-xs">
                    Upload videos of your child practicing therapy activities at home. This helps therapists track progress.
                  </p>
                </div>
              </div>
            </div>

            <Card className="mb-4">
              <label className="block text-gray-700 mb-3 text-sm">Child Name</label>
              <input
                type="text"
                value="Emma Johnson"
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 mb-4"
              />

              <label className="block text-gray-700 mb-3 text-sm">Video Title</label>
              <input
                type="text"
                placeholder="e.g., Practicing phonics at home"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              />

              <label className="block text-gray-700 mb-3 text-sm">Upload Video</label>
              <button className="w-full border-2 border-dashed border-gray-300 rounded-lg py-10 flex flex-col items-center gap-3 hover:border-gray-400 transition-colors mb-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="text-center">
                  <p className="text-gray-700 mb-1">Tap to select video</p>
                  <p className="text-gray-500 text-xs">MP4, MOV, AVI (Max 100MB)</p>
                </div>
              </button>

              <label className="block text-gray-700 mb-3 text-sm">Notes for Therapist (Optional)</label>
              <textarea
                placeholder="Add any context or observations about this video..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                rows={4}
              />
            </Card>

            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Upload Video
            </button>

            <p className="text-gray-500 text-center text-xs mt-4">
              Videos are securely stored and only visible to your child's therapists
            </p>
          </div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame color="bg-indigo-600">
      <div className="bg-gray-50 min-h-[667px]">
        {/* App Bar */}
        <div className="bg-indigo-600 text-white px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-white">Home Video Uploads</h2>
              <p className="text-indigo-100 text-sm">Share progress with therapists</p>
            </div>
            <button
              onClick={() => setView('upload')}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600"
            >
              <Upload className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {/* Info Banner */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
            <div className="flex gap-3">
              <Video className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <p className="text-gray-900 text-sm mb-1">Why Upload Videos?</p>
                <p className="text-gray-600 text-xs">
                  Sharing videos of home practice helps therapists understand your child's progress outside of sessions and adjust therapy plans accordingly.
                </p>
              </div>
            </div>
          </div>

          {/* Uploaded Videos List */}
          <div className="mb-4">
            <h3 className="text-gray-900 mb-3">Your Uploads</h3>
            <div className="space-y-3">
              {[
                {
                  title: 'Practicing "th" sounds',
                  date: 'Dec 7, 2025',
                  duration: '2:15',
                  status: 'Reviewed',
                  variant: 'success' as const,
                  feedback: 'Great progress! Continue daily practice.',
                },
                {
                  title: 'Reading practice session',
                  date: 'Dec 5, 2025',
                  duration: '5:30',
                  status: 'Reviewed',
                  variant: 'success' as const,
                  feedback: 'Excellent engagement and focus.',
                },
                {
                  title: 'Morning exercises',
                  date: 'Dec 3, 2025',
                  duration: '3:45',
                  status: 'Under Review',
                  variant: 'warning' as const,
                },
              ].map((video, idx) => (
                <Card key={idx}>
                  <div className="flex gap-3 mb-3">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-200 to-indigo-300 rounded-lg shrink-0 flex items-center justify-center relative">
                      <Video className="w-6 h-6 text-white" />
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                        {video.duration}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 mb-1">{video.title}</p>
                      <p className="text-gray-500 text-sm mb-2">{video.date}</p>
                      <StatusBadge status={video.status} variant={video.variant} />
                    </div>
                  </div>

                  {/* Therapist Feedback */}
                  {video.feedback && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-gray-900 text-xs mb-1">Therapist Feedback</p>
                        <p className="text-gray-600 text-xs">{video.feedback}</p>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <Card>
            <h3 className="text-gray-900 mb-3">Upload Guidelines</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="text-indigo-600">•</span>
                <span>Keep videos between 2-10 minutes for best results</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-600">•</span>
                <span>Focus on specific therapy activities or goals</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-600">•</span>
                <span>Add notes to provide context for therapists</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-600">•</span>
                <span>Videos are reviewed within 24-48 hours</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </MobileFrame>
  );
}
