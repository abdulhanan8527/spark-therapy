import { Search, Send, MessageSquare, Clock, CheckCircle, AlertTriangle } from '../../components/SimpleIcons';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';
import { useState, useEffect } from 'react';
import { complaintAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Complaint {
  _id: string;
  id?: string;
  subject?: string;
  title: string;
  description: string;
  parentId: string;
  parentName?: string;
  parent?: string;
  childId: string;
  childName?: string;
  child?: string;
  status: string;
  priority: string;
  submittedDate: string;
  date?: string;
  assignedTo?: string;
  variant?: 'success' | 'warning' | 'neutral';
}

export default function ComplaintsHandling() {
  const { user } = useAuth();
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintAPI.getAllComplaints();
      if (response.success) {
        const formattedComplaints = response.data.complaints || response.data || [];
        setComplaints(formattedComplaints.map((comp: any) => ({
          ...comp,
          id: comp._id,
          subject: comp.title,
          parent: comp.parentName || 'Unknown',
          child: comp.childName || 'Unknown',
          date: new Date(comp.submittedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          variant: comp.status === 'resolved' ? 'success' : comp.status === 'in-progress' ? 'warning' : 'neutral'
        } as Complaint)));
      } else {
        setError(response.message || 'Failed to fetch complaints');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  if (selectedComplaint !== null) {
    const complaint = selectedComplaint;
    return (
      <div className="p-8">
        <button 
          onClick={() => setSelectedComplaint(null)}
          className="text-purple-600 mb-6 flex items-center gap-2"
        >
          ← Back to All Complaints
        </button>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-gray-900 mb-1">{complaint.title}</h2>
                  <p className="text-gray-500 text-sm">{complaint.id}</p>
                </div>
                <StatusBadge status={complaint.status} variant={complaint.status === 'resolved' ? 'success' : complaint.status === 'in-progress' ? 'warning' : 'neutral'} />
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Description:</p>
                  <p className="text-gray-900">
                    {complaint.description}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-gray-900 mb-4">Activity Timeline</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm mb-1">Admin Response Added</p>
                      <p className="text-gray-600 text-sm mb-2">
                        We've reviewed your concern and are working with the scheduling team...
                      </p>
                      <p className="text-gray-400 text-xs">Dec 7, 2025 - 10:30 AM</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xs">👁️</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm mb-1">Assigned to Manager</p>
                      <p className="text-gray-600 text-sm mb-2">Jane Doe</p>
                      <p className="text-gray-400 text-xs">Dec 6, 2025 - 9:15 AM</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xs">✓</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm mb-1">Complaint Received</p>
                      <p className="text-gray-400 text-xs">Dec 5, 2025 - 4:20 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-gray-900 mb-4">Add Response</h3>
              <textarea
                placeholder="Type your response to the parent..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none mb-4"
                rows={4}
              />
              <div className="flex gap-2">
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Response
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg">
                  Mark as Resolved
                </button>
              </div>
            </Card>
          </div>

          <div>
            <Card className="mb-6">
              <h3 className="text-gray-900 mb-4">Complaint Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Submitted By:</p>
                  <p className="text-gray-900">{complaint.parentName || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Child:</p>
                  <p className="text-gray-900">{complaint.childName || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Date Submitted:</p>
                  <p className="text-gray-900">{complaint.date}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Assigned To:</p>
                  <p className="text-gray-900">Jane Doe (Manager)</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Priority:</p>
                  <StatusBadge status="Medium" variant="warning" />
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-left hover:bg-gray-50">
                  Escalate to Senior Management
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-left hover:bg-gray-50">
                  Assign to Another Admin
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-left hover:bg-gray-50">
                  Schedule Follow-up Call
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Complaints Management</h1>
        <p className="text-gray-600">Review and respond to parent complaints</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search complaints..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>All Status</option>
            <option>Pending</option>
            <option>Under Review</option>
            <option>Resolved</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>All Priority</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="text-center p-4">
          <p className="text-3xl text-red-600 mb-1">3</p>
          <p className="text-gray-600 text-sm">Active</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-3xl text-yellow-600 mb-1">5</p>
          <p className="text-gray-600 text-sm">Under Review</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-3xl text-green-600 mb-1">42</p>
          <p className="text-gray-600 text-sm">Resolved This Month</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-3xl text-blue-600 mb-1">18h</p>
          <p className="text-gray-600 text-sm">Avg Response Time</p>
        </Card>
      </div>

      {/* Complaints Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600 text-sm">ID</th>
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Subject</th>
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Parent</th>
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Date</th>
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Status</th>
                <th className="text-right py-3 px-4 text-gray-600 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedComplaint(complaint)}>
                  <td className="py-4 px-4">
                    <p className="text-gray-900 text-sm">{complaint.id}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-900">{complaint.subject}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-900">{complaint.parentName || 'Unknown'}</p>
                    <p className="text-gray-500 text-sm">{complaint.childName || 'Unknown'}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-600 text-sm">{new Date(complaint.submittedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={complaint.status} variant={complaint.status === 'resolved' ? 'success' : complaint.status === 'in-progress' ? 'warning' : 'neutral'} />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm">
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
