import React, { useState } from 'react';
import { Plus, Calendar, Upload, X, Eye, FileText, Image, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { MobileFrame } from '../shared/MobileFrame';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';
import { LeaveRequest, LeaveType, LeaveStatus } from './LeaveRequestTypes';

const LeaveRequests = () => {
  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [formData, setFormData] = useState({
    leaveType: 'Sick Leave' as LeaveType,
    otherLeaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [numberOfDays, setNumberOfDays] = useState(0);

  // Mock data for leave requests
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: '1',
      therapistId: 't1',
      therapistName: 'Dr. Sarah Smith',
      leaveType: 'Sick Leave',
      startDate: '2025-12-15',
      endDate: '2025-12-17',
      numberOfDays: 3,
      reason: 'Medical appointment and recovery',
      attachments: ['medical_certificate.jpg'],
      status: 'Approved',
      submittedAt: '2025-12-01T10:30:00Z',
      reviewedAt: '2025-12-02T14:20:00Z',
      adminId: 'admin1',
      rejectionReason: ''
    },
    {
      id: '2',
      therapistId: 't1',
      therapistName: 'Dr. Sarah Smith',
      leaveType: 'Annual Leave',
      startDate: '2025-12-20',
      endDate: '2025-12-25',
      numberOfDays: 6,
      reason: 'Family vacation',
      attachments: [],
      status: 'Pending',
      submittedAt: '2025-12-05T09:15:00Z'
    },
    {
      id: '3',
      therapistId: 't1',
      therapistName: 'Dr. Sarah Smith',
      leaveType: 'Casual Leave',
      startDate: '2025-11-10',
      endDate: '2025-11-10',
      numberOfDays: 1,
      reason: 'Personal matter',
      attachments: ['note.pdf'],
      status: 'Rejected',
      submittedAt: '2025-11-01T11:45:00Z',
      reviewedAt: '2025-11-02T16:30:00Z',
      adminId: 'admin1',
      rejectionReason: 'Insufficient notice period'
    }
  ]);

  // Calculate number of days between dates
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    // Add 1 to include both start and end dates
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Recalculate days when dates change
    if (name === 'startDate' || name === 'endDate') {
      const newStartDate = name === 'startDate' ? value : formData.startDate;
      const newEndDate = name === 'endDate' ? value : formData.endDate;
      setNumberOfDays(calculateDays(newStartDate, newEndDate));
    }
  };

  // Handle file attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...files]);
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Submit leave request
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRequest: LeaveRequest = {
      id: `lr-${Date.now()}`,
      therapistId: 't1',
      therapistName: 'Dr. Sarah Smith',
      leaveType: formData.leaveType === 'Other' ? formData.otherLeaveType as LeaveType : formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      numberOfDays,
      reason: formData.reason,
      attachments: attachments.map(file => file.name),
      status: 'Pending',
      submittedAt: new Date().toISOString()
    };

    setLeaveRequests(prev => [newRequest, ...prev]);
    
    // Reset form
    setFormData({
      leaveType: 'Sick Leave',
      otherLeaveType: '',
      startDate: '',
      endDate: '',
      reason: ''
    });
    setAttachments([]);
    setNumberOfDays(0);
    
    // Show confirmation and return to list
    alert('Leave request submitted successfully. You will be notified when it is reviewed.');
    setView('list');
  };

  // View request details
  const viewRequestDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setView('detail');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format date range
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (startDate.getFullYear() === endDate.getFullYear()) {
      if (startDate.getMonth() === endDate.getMonth()) {
        // Same month
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${endDate.toLocaleDateString('en-US', { day: 'numeric' })}, ${endDate.getFullYear()}`;
      } else {
        // Different months, same year
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${endDate.getFullYear()}`;
      }
    } else {
      // Different years
      return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}–${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  };

  return (
    <MobileFrame color="bg-teal-600">
      <div className="bg-gray-50 min-h-[667px]">
        {/* App Bar */}
        <div className="bg-teal-600 text-white px-6 py-4">
          <h2 className="text-white mb-1">Leave Requests</h2>
          <p className="text-teal-100 text-sm">
            {view === 'list' && 'Manage your leave requests'}
            {view === 'form' && 'Submit new leave request'}
            {view === 'detail' && 'Leave request details'}
          </p>
        </div>

        {/* Content */}
        <div className="px-4 py-4 pb-20">
          {view === 'list' && (
            <>
              <div className="mb-4">
                <button
                  onClick={() => setView('form')}
                  className="w-full bg-teal-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  New Leave Request
                </button>
              </div>

              <div>
                <h3 className="text-gray-900 mb-3">My Leave Requests</h3>
                {leaveRequests.length === 0 ? (
                  <Card className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-gray-900 mb-1">No Leave Requests</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      You haven't submitted any leave requests yet
                    </p>
                    <button
                      onClick={() => setView('form')}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm"
                    >
                      Submit Request
                    </button>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {leaveRequests.map(request => (
                      <Card 
                        onClick={() => viewRequestDetails(request)}
                        className="cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-gray-900 font-medium">
                              {formatDateRange(request.startDate, request.endDate)}
                            </h4>
                            <p className="text-gray-600 text-sm">{request.leaveType}</p>
                          </div>
                          <StatusBadge 
                            status={
                              request.status === 'Pending' ? 'Pending' :
                              request.status === 'Approved' ? 'Active' :
                              'Inactive'
                            } 
                            variant={
                              request.status === 'Pending' ? 'warning' :
                              request.status === 'Approved' ? 'success' :
                              'danger'
                            }
                          />
                        </div>
                        
                        {request.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                            <strong>Rejection reason:</strong> {request.rejectionReason}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {view === 'form' && (
            <Card>
              <h3 className="text-gray-900 mb-4">New Leave Request</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">Leave Type</label>
                    <select
                      name="leaveType"
                      value={formData.leaveType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      required
                    >
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Annual Leave">Annual Leave</option>
                      <option value="Emergency Leave">Emergency Leave</option>
                      <option value="Other">Other</option>
                    </select>
                    
                    {formData.leaveType === 'Other' && (
                      <input
                        type="text"
                        name="otherLeaveType"
                        value={formData.otherLeaveType}
                        onChange={handleInputChange}
                        placeholder="Specify leave type"
                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 text-sm mb-1">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm mb-1">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">
                      Number of Days: {numberOfDays}
                    </label>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-teal-600 rounded-full" 
                        style={{ width: `${Math.min(numberOfDays * 10, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">Reason/Description</label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      placeholder="Provide details about your leave request"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">Attach Proof (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm mb-2">
                        Upload medical certificate, doctor's note, etc.
                      </p>
                      <p className="text-gray-500 text-xs mb-3">
                        JPG, PNG, PDF (max 5MB each, max 5 files)
                      </p>
                      <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm cursor-pointer hover:bg-gray-200"
                      >
                        Choose Files
                      </label>
                    </div>
                    
                    {attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex items-center gap-2">
                              {file.type.startsWith('image/') ? (
                                <Image className="w-4 h-4 text-gray-500" />
                              ) : (
                                <FileText className="w-4 h-4 text-gray-500" />
                              )}
                              <span className="text-gray-700 text-sm truncate max-w-[200px]">
                                {file.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setView('list')}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm"
                    >
                      Submit Request
                    </button>
                  </div>
                </div>
              </form>
            </Card>
          )}

          {view === 'detail' && selectedRequest && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setView('list')}
                  className="p-2 bg-gray-100 rounded-full"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-gray-900">Leave Request Details</h3>
              </div>
              
              <Card className="mb-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-gray-900 font-medium">
                      {formatDateRange(selectedRequest.startDate, selectedRequest.endDate)}
                    </h4>
                    <p className="text-gray-600 text-sm">{selectedRequest.leaveType}</p>
                  </div>
                  <StatusBadge 
                    status={
                      selectedRequest.status === 'Pending' ? 'Pending' :
                      selectedRequest.status === 'Approved' ? 'Active' :
                      'Inactive'
                    } 
                    variant={
                      selectedRequest.status === 'Pending' ? 'warning' :
                      selectedRequest.status === 'Approved' ? 'success' :
                      'danger'
                    }
                  />
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-700 text-sm font-medium mb-1">Reason</p>
                    <p className="text-gray-600 text-sm">{selectedRequest.reason}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-700 text-sm font-medium mb-1">Submitted</p>
                    <p className="text-gray-600 text-sm">
                      {formatDate(selectedRequest.submittedAt)}
                    </p>
                  </div>
                  
                  {selectedRequest.reviewedAt && (
                    <div>
                      <p className="text-gray-700 text-sm font-medium mb-1">Reviewed</p>
                      <p className="text-gray-600 text-sm">
                        {formatDate(selectedRequest.reviewedAt)}
                      </p>
                    </div>
                  )}
                  
                  {selectedRequest.rejectionReason && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-700 text-sm">
                        <strong>Rejection reason:</strong> {selectedRequest.rejectionReason}
                      </p>
                    </div>
                  )}
                  
                  {selectedRequest.attachments.length > 0 && (
                    <div>
                      <p className="text-gray-700 text-sm font-medium mb-2">Attachments</p>
                      <div className="space-y-2">
                        {selectedRequest.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            {attachment.endsWith('.pdf') ? (
                              <FileText className="w-5 h-5 text-red-500" />
                            ) : (
                              <Image className="w-5 h-5 text-blue-500" />
                            )}
                            <span className="text-gray-700 text-sm flex-1 truncate">
                              {attachment}
                            </span>
                            <button className="text-teal-600 hover:text-teal-800">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </MobileFrame>
  );
};

export default LeaveRequests;