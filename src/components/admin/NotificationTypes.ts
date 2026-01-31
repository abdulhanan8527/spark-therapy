// Notification Types

export type NotificationPriority = 'Normal' | 'Important';

export type RecipientType = 'All' | 'SpecificGroups';

export type UserRole = 
  | 'therapist' 
  | 'speech-therapist' 
  | 'ot' 
  | 'physician' 
  | 'parent' 
  | 'admin';

export type ClinicLocation = 
  | 'Main Clinic' 
  | 'North Branch' 
  | 'South Branch' 
  | 'East Wing' 
  | 'West Campus';

export interface NotificationRecipient {
  id: string;
  name: string;
  role: UserRole;
  location?: ClinicLocation;
  deviceId?: string; // For push notification targeting
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  senderId: string;
  senderName: string;
  recipientType: RecipientType;
  recipientGroups: UserRole[];
  recipientLocations: ClinicLocation[];
  priority: NotificationPriority;
  attachmentUrl?: string;
  attachmentName?: string;
  scheduledAt?: string; // ISO timestamp
  sentAt?: string; // ISO timestamp
  createdAt: string; // ISO timestamp
  readBy: string[]; // User IDs who have read this notification
  deliveryStatus: Map<string, 'pending' | 'delivered' | 'failed'>; // Per-user delivery status
}

export interface UserNotification {
  id: string;
  broadcastId: string;
  title: string;
  message: string;
  senderName: string;
  priority: NotificationPriority;
  attachmentUrl?: string;
  attachmentName?: string;
  receivedAt: string; // ISO timestamp
  read: boolean;
  timestamp: string; // ISO timestamp
}