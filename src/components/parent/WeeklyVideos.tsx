import { ArrowLeft, Video, Download, Clock, Play } from 'lucide-react';
import { MobileFrame } from '../shared/MobileFrame';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';
import { useState } from 'react';

export default function WeeklyVideos() {
  const [view, setView] = useState<'list' | 'player'>('list');

  if (view === 'player') {
    return (
      <MobileFrame color="bg-purple-600">
        <div className="bg-gray-50 min-h-[667px]">
          {/* App Bar */}
          <div className="bg-purple-600 text-white px-6 py-4 flex items-center gap-4">
            <button onClick={() => setView('list')}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-white">Weekly Video</h2>
              <p className="text-purple-100 text-sm">Week of Dec 1-7</p>
            </div>
          </div>

          {/* Video Player */}
          <div className="px-4 py-4">
            <div className="w-full aspect-video bg-gray-900 rounded-xl mb-4 flex items-center justify-center relative">
              <Play className="w-16 h-16 text-white opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 rounded-lg p-2 flex items-center gap-2">
                <div className="w-1 h-1 bg-white rounded-full" />
                <div className="flex-1 h-1 bg-gray-600 rounded-full">
                  <div className="w-1/3 h-full bg-white rounded-full" />
                </div>
                <span className="text-white text-xs">2:45 / 8:30</span>
              </div>
            </div>

            {/* Video Info */}
            <Card className="mb-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-gray-900 mb-1">Emma's Progress Video</h3>
                  <p className="text-gray-500 text-sm">Week of Dec 1-7, 2025</p>
                </div>
                <StatusBadge status="⏰ 5 days left" variant="warning" />
              </div>
              <p className="text-gray-600 text-sm mb-4">
                This week's video shows Emma's progress in speech therapy activities and social interaction exercises.
              </p>
              <div className="flex gap-2">
                <button className="flex-1 bg-purple-600 text-white py-2 rounded-lg flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </Card>

            {/* Therapist Note */}
            <Card>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white">
                  DS
                </div>
                <div>
                  <p className="text-gray-900">Dr. Sarah Smith</p>
                  <p className="text-gray-500 text-sm">Speech Therapist</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Great week for Emma! Notice how she's now making eye contact more consistently during activities. We'll continue building on this progress.
              </p>
            </Card>
          </div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame color="bg-purple-600">
      <div className="bg-gray-50 min-h-[667px]">
        {/* App Bar */}
        <div className="bg-purple-600 text-white px-6 py-4">
          <h2 className="text-white mb-1">Weekly Videos</h2>
          <p className="text-purple-100 text-sm">Session recordings from therapy</p>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {/* Info Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex gap-3">
            <Clock className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-900 text-sm mb-1">Auto-delete Notice</p>
              <p className="text-gray-600 text-xs">
                Videos are automatically deleted 7 days after upload for privacy and storage purposes.
              </p>
            </div>
          </div>

          {/* Video List */}
          <div className="space-y-4">
            {[
              { week: 'Week of Dec 1-7', date: 'Uploaded Dec 8', duration: '8:30', daysLeft: 5, variant: 'warning' as const },
              { week: 'Week of Nov 24-30', date: 'Uploaded Dec 1', duration: '7:45', daysLeft: 'Expires today', variant: 'danger' as const },
              { week: 'Week of Nov 17-23', date: 'Uploaded Nov 24', duration: '9:15', daysLeft: 'Expired', variant: 'neutral' as const },
            ].map((video, idx) => (
              <Card key={idx} onClick={() => idx === 0 && setView('player')}>
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="w-28 h-20 bg-gradient-to-br from-purple-200 to-purple-300 rounded-lg shrink-0 flex items-center justify-center relative">
                    <Play className="w-8 h-8 text-white" />
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                      {video.duration}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 mb-1">{video.week}</p>
                    <p className="text-gray-500 text-sm mb-2">{video.date}</p>
                    <StatusBadge 
                      status={typeof video.daysLeft === 'number' ? `${video.daysLeft} days left` : video.daysLeft} 
                      variant={video.variant} 
                    />
                  </div>

                  {/* Download */}
                  {typeof video.daysLeft === 'number' && (
                    <button className="self-center">
                      <Download className="w-5 h-5 text-gray-400" />
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State Message */}
          <div className="mt-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Video className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-gray-500 text-sm">
              New videos are uploaded weekly by your therapist
            </p>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
