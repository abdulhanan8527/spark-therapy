import { ArrowLeft, FileText, Download, Eye } from 'lucide-react';
import { MobileFrame } from '../shared/MobileFrame';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';
import { useState } from 'react';

export default function QuarterlyReports() {
  const [view, setView] = useState<'list' | 'viewer'>('list');

  if (view === 'viewer') {
    return (
      <MobileFrame color="bg-teal-600">
        <div className="bg-gray-50 min-h-[667px]">
          {/* App Bar */}
          <div className="bg-teal-600 text-white px-6 py-4 flex items-center gap-4">
            <button onClick={() => setView('list')}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-white">Q4 Progress Report</h2>
            </div>
            <button className="ml-auto">
              <Download className="w-6 h-6" />
            </button>
          </div>

          {/* PDF Viewer */}
          <div className="px-4 py-4">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-teal-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl text-white">⚡</span>
                </div>
                <h3 className="text-gray-900 mb-1">SPARK Therapy Services</h3>
                <p className="text-gray-500 text-sm">Quarterly Progress Report</p>
              </div>

              <div className="space-y-4 text-sm">
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-gray-500 mb-1">Student Name:</p>
                  <p className="text-gray-900">Emma Johnson</p>
                </div>
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-gray-500 mb-1">Report Period:</p>
                  <p className="text-gray-900">Q4 2025 (Oct - Dec)</p>
                </div>
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-gray-500 mb-1">Therapist:</p>
                  <p className="text-gray-900">Dr. Sarah Smith, CCC-SLP</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
              <h4 className="text-gray-900 mb-3">Summary of Progress</h4>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Emma has demonstrated significant improvement in speech articulation and communication skills during this quarter. She has mastered 8 out of 12 IEP goals and shows consistent progress in social interaction.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Speech Goals:</span>
                  <span className="text-green-600">85% Complete</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Social Skills:</span>
                  <span className="text-green-600">75% Complete</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Attendance:</span>
                  <span className="text-green-600">92%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-gray-900 mb-3">Recommendations</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Continue daily practice of phonetic exercises</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Increase social interaction activities</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Schedule follow-up assessment in Q1 2026</span>
                </li>
              </ul>
            </div>

            <p className="text-gray-400 text-center text-xs mt-6">
              Page 1 of 3 • Scroll to view more
            </p>
          </div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame color="bg-teal-600">
      <div className="bg-gray-50 min-h-[667px]">
        {/* App Bar */}
        <div className="bg-teal-600 text-white px-6 py-4">
          <h2 className="text-white mb-1">Quarterly Reports</h2>
          <p className="text-teal-100 text-sm">Progress reports and assessments</p>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          <p className="text-gray-500 text-sm mb-4">Academic Year 2025-2026</p>

          {/* Reports List */}
          <div className="space-y-3">
            {[
              { quarter: 'Q4 Progress Report', period: 'Oct - Dec 2025', date: 'Uploaded Dec 5', status: 'New', variant: 'success' as const, pages: 3 },
              { quarter: 'Q3 Progress Report', period: 'Jul - Sep 2025', date: 'Uploaded Sep 28', status: 'Viewed', variant: 'neutral' as const, pages: 3 },
              { quarter: 'Q2 Progress Report', period: 'Apr - Jun 2025', date: 'Uploaded Jun 30', status: 'Viewed', variant: 'neutral' as const, pages: 3 },
              { quarter: 'Q1 Progress Report', period: 'Jan - Mar 2025', date: 'Uploaded Mar 28', status: 'Viewed', variant: 'neutral' as const, pages: 4 },
            ].map((report, idx) => (
              <Card key={idx} onClick={() => idx === 0 && setView('viewer')}>
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className="w-12 h-16 bg-teal-100 rounded-lg shrink-0 flex flex-col items-center justify-center">
                    <FileText className="w-6 h-6 text-teal-600 mb-1" />
                    <span className="text-xs text-teal-600">PDF</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-gray-900 mb-1">{report.quarter}</p>
                        <p className="text-gray-500 text-sm">{report.period}</p>
                      </div>
                      <StatusBadge status={report.status} variant={report.variant} />
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>{report.date}</span>
                      <span>•</span>
                      <span>{report.pages} pages</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button className="p-2 bg-gray-100 rounded-lg">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 bg-gray-100 rounded-lg">
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <FileText className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-gray-900 text-sm mb-1">About Quarterly Reports</p>
                <p className="text-gray-600 text-xs">
                  Progress reports are generated every quarter and include detailed assessments of your child's development, goal achievements, and recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
