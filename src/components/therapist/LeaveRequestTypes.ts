// Leave Request Types

export type LeaveType = 
  | 'Sick Leave'
  | 'Casual Leave'
  | 'Annual Leave'
  | 'Emergency Leave'
  | 'Other';

export type LeaveStatus = 
  | 'Pending'
  | 'Approved'
  | 'Rejected';

export interface LeaveRequest {
  id: string;
  therapistId: string;
  therapistName: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  numberOfDays: number;
  reason: string;
  attachments: string[]; // File paths/URLs
  status: LeaveStatus;
  submittedAt: string; // ISO timestamp
  reviewedAt?: string; // ISO timestamp
  adminId?: string; // Who reviewed
  rejectionReason?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf';
  size: number; // in bytes
}