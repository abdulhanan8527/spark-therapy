import React, { useState } from 'react';
import { Check, X, Eye, FileText, Image, Search, Filter } from 'lucide-react';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';
import { LeaveRequest, LeaveStatus } from '../therapist/LeaveRequestTypes';

const LeaveRequestsManagement = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

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
      therapistId: 't2',
      therapistName: 'Dr. Michael Johnson',
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
      therapistId: 't3',
      therapistName: 'Dr. Emily Davis',
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
    },
    {
      id: '4',
      therapistId: 't1',
      therapistName: 'Dr. Sarah Smith',
      leaveType: 'Emergency Leave',
      startDate: '2025-12-10',
      endDate: '2025-12-10',
      numberOfDays: 1,
      reason: 'Unexpected family emergency',
      attachments: ['emergency_note.jpg'],
      status: 'Pending',
      submittedAt: '2025-12-09T14:20:00Z'
    }
  ]);

  // Filter leave requests based on status and search term
  const filteredRequests = leaveRequests.filter(request => {
    const matchesFilter = filter === 'all' || request.status.toLowerCase() === filter;
    const matchesSearch = searchTerm === '' || 
      request.therapistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Sort by submission date (newest first)
  const sortedRequests = [...filteredRequests].sort((a, b) => 
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  // Handle approval
  const handleApprove = (requestId: string) => {
    setLeaveRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { 
            ...request, 
            status: 'Approved',
            reviewedAt: new Date().toISOString(),
            adminId: 'admin1'
          } 
        : request
    ));
  };

  // Handle rejection
  const handleReject = (requestId: string) => {
    if (!rejectionReason.trim()) {
      alert('Rejection reason is required');
      return;
    }
    
    setLeaveRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { 
            ...request, 
            status: 'Rejected',
            reviewedAt: new Date().toISOString(),
            adminId: 'admin1',
            rejectionReason
          } 
        : request
    ));
    
    setRejectionReason('');
    setSelectedRequest(null);
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Leave Requests Management</h1>
        <p className="text-gray-600">Review and manage therapist leave requests</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by therapist name or leave type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm ${
                filter === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                filter === 'pending' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                filter === 'approved' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                filter === 'rejected' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Rejected
            </button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center p-4 bg-yellow-50 border-yellow-200">
          <p className="text-2xl text-yellow-600 mb-1">{leaveRequests.filter(r => r.status === 'Pending').length}</p>
          <p className="text-gray-600 text-sm">Pending</p>
        </Card>
        <Card className="text-center p-4 bg-green-50 border-green-200">
          <p className="text-2xl text-green-600 mb-1">{leaveRequests.filter(r => r.status === 'Approved').length}</p>
          <p className="text-gray-600 text-sm">Approved</p>
        </Card>
        <Card className="text-center p-4 bg-red-50 border-red-200">
          <p className="text-2xl text-red-600 mb-1">{leaveRequests.filter(r => r.status === 'Rejected').length}</p>
          <p className="text-gray-600 text-sm">Rejected</p>
        </Card>
        <Card className="text-center p-4 bg-blue-50 border-blue-200">
          <p className="text-2xl text-blue-600 mb-1">{leaveRequests.length}</p>
          <p className="text-gray-600 text-sm">Total Requests</p>
        </Card>
      </div>

      {/* Leave Requests List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {filter === 'all' ? 'All Leave Requests' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Requests`}
          <span className="text-gray-500 text-sm ml-2">({sortedRequests.length})</span>
        </h2>
        
        {sortedRequests.length === 0 ? (
          <Card className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-1">No leave requests found</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? `No requests match "${searchTerm}"` 
                : filter === 'all' 
                  ? 'There are no leave requests at the moment' 
                  : `There are no ${filter} leave requests at the moment`}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedRequests.map(request => (
              <div key={request.id}>
                <Card>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {request.therapistName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="text-gray-900 font-medium">{request.therapistName}</h3>
                            <p className="text-gray-500 text-sm">ID: {request.therapistId}</p>
                          </div>
                        </div>
                      
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-4">
                            <div>
                              <p className="text-gray-900 font-medium">
                                {formatDateRange(request.startDate, request.endDate)}
                              </p>
                              <p className="text-gray-600 text-sm">{request.leaveType}</p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-gray-900 font-medium">{request.numberOfDays}</p>
                              <p className="text-gray-500 text-sm">Days</p>
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
                        </div>
                      </div>
                    
                      <p className="text-gray-700 text-sm mb-3 line-clamp-2">{request.reason}</p>
                      
                      {request.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {request.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
                              {attachment.endsWith('.pdf') ? (
                                <FileText className="w-4 h-4 text-red-500" />
                              ) : (
                                <Image className="w-4 h-4 text-blue-500" />
                              )}
                              <span className="text-gray-700">{attachment}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-gray-500 text-xs">
                        Submitted: {formatDate(request.submittedAt)}
                        {request.reviewedAt && ` • Reviewed: ${formatDate(request.reviewedAt)}`}
                      </p>
                    </div>
                    
                    {request.status === 'Pending' && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 text-sm hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 text-sm hover:bg-red-700"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Leave Request</h3>
            <p className="text-gray-700 text-sm mb-2">
              Request from <strong>{selectedRequest.therapistName}</strong> for{' '}
              <strong>{selectedRequest.leaveType}</strong> ({selectedRequest.numberOfDays} days)
            </p>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm mb-2">Rejection Reason *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedRequest.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
              >
                Reject Request
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LeaveRequestsManagement;