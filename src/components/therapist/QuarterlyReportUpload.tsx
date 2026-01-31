import { ArrowLeft, FileText, Upload, Calendar } from 'lucide-react';
import { MobileFrame } from '../shared/MobileFrame';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';

export default function QuarterlyReportUpload() {
  return (
    <MobileFrame color="bg-teal-600">
      <div className="bg-gray-50 min-h-[667px]">
        {/* App Bar */}
        <div className="bg-teal-600 text-white px-6 py-4 flex items-center gap-4">
          <button>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-white">Quarterly Report Upload</h2>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {/* Upcoming Due Dates */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex gap-3">
              <Calendar className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <p className="text-gray-900 text-sm mb-1">Upcoming Deadlines</p>
                <p className="text-gray-600 text-xs">
                  2 reports due by Dec 31, 2025
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

            <label className="block text-gray-700 mb-2 text-sm">Report Period</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4">
              <option>Q4 2025 (Oct - Dec)</option>
              <option>Q3 2025 (Jul - Sep)</option>
              <option>Q2 2025 (Apr - Jun)</option>
              <option>Q1 2025 (Jan - Mar)</option>
            </select>

            <label className="block text-gray-700 mb-2 text-sm">Report Status</label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Card className="text-center p-2 border-2 border-teal-600">
                <p className="text-gray-900 text-sm">In Progress</p>
              </Card>
              <Card className="text-center p-2">
                <p className="text-gray-600 text-sm">Draft</p>
              </Card>
              <Card className="text-center p-2">
                <p className="text-gray-600 text-sm">Final</p>
              </Card>
            </div>

            <label className="block text-gray-700 mb-2 text-sm">Upload Report (PDF)</label>
            <button className="w-full border-2 border-dashed border-gray-300 rounded-lg py-8 flex flex-col items-center gap-3 hover:border-gray-400 transition-colors mb-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-teal-600" />
              </div>
              <div className="text-center">
                <p className="text-gray-700 mb-1">Tap to upload PDF</p>
                <p className="text-gray-500 text-xs">PDF format only (Max 10MB)</p>
              </div>
            </button>
          </Card>

          {/* Report Checklist */}
          <Card className="mb-4">
            <h3 className="text-gray-900 mb-3">Report Checklist</h3>
            <div className="space-y-2">
              {[
                { item: 'Progress summary', checked: true },
                { item: 'IEP goals assessment', checked: true },
                { item: 'Attendance record', checked: true },
                { item: 'Behavioral observations', checked: false },
                { item: 'Recommendations for next quarter', checked: false },
                { item: 'Therapist signature', checked: false },
              ].map((item, idx) => (
                <label key={idx} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <span className="text-gray-700 text-sm">{item.item}</span>
                </label>
              ))}
            </div>
          </Card>

          <button className="w-full bg-teal-600 text-white py-3 rounded-lg flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Report
          </button>

          <p className="text-gray-500 text-center text-xs mt-4">
            Report will be reviewed by admin before being sent to parent
          </p>
        </div>
      </div>
    </MobileFrame>
  );
}
