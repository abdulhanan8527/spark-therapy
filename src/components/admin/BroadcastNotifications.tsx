import React, { useState } from 'react';
import { Plus, Send, Calendar, Paperclip, Eye, X, Users, Bell } from 'lucide-react';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';
import { 
  NotificationPriority, 
  RecipientType, 
  UserRole, 
  ClinicLocation, 
  BroadcastNotification 
} from './NotificationTypes';

const BroadcastNotifications = () => {
  const [view, setView] = useState<'list' | 'form' | 'preview'>('list');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    recipientType: 'All' as RecipientType,
    recipientGroups: [] as UserRole[],
    recipientLocations: [] as ClinicLocation[],
    priority: 'Normal' as NotificationPriority,
    scheduledAt: '',
    sendNow: true,
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Mock data for notifications
  const [notifications, setNotifications] = useState<BroadcastNotification[]>([
    {
      id: '1',
      title: 'System Maintenance Tonight',
      message: 'The system will be down for maintenance from 10 PM to 2 AM. Please save your work before this time.',
      senderId: 'admin1',
      senderName: 'System Administrator',
      recipientType: 'All',
      recipientGroups: [],
      recipientLocations: [],
      priority: 'Important',
      sentAt: '2025-12-10T14:30:00Z',
      createdAt: '2025-12-10T14:30:00Z',
      readBy: ['user1', 'user2'],
      deliveryStatus: new Map([
        ['user1', 'delivered'],
        ['user2', 'delivered'],
        ['user3', 'delivered']
      ])
    },
    {
      id: '2',
      title: 'Holiday Closure Notice',
      message: 'Our clinics will be closed for the holidays from December 24-26. Happy Holidays!',
      senderId: 'admin1',
      senderName: 'System Administrator',
      recipientType: 'All',
      recipientGroups: [],
      recipientLocations: [],
      priority: 'Normal',
      sentAt: '2025-12-05T09:15:00Z',
      createdAt: '2025-12-05T09:15:00Z',
      readBy: ['user1', 'user2', 'user3'],
      deliveryStatus: new Map([
        ['user1', 'delivered'],
        ['user2', 'delivered'],
        ['user3', 'delivered']
      ])
    },
    {
      id: '3',
      title: 'Training Session Reminder',
      message: 'Mandatory training session for all therapists on December 15th at 3 PM.',
      senderId: 'admin1',
      senderName: 'System Administrator',
      recipientType: 'SpecificGroups',
      recipientGroups: ['therapist', 'speech-therapist', 'ot'],
      recipientLocations: [],
      priority: 'Normal',
      sentAt: '2025-12-01T11:45:00Z',
      createdAt: '2025-12-01T11:45:00Z',
      readBy: ['user1'],
      deliveryStatus: new Map([
        ['user1', 'delivered'],
        ['user2', 'pending']
      ])
    }
  ]);

  // Available user roles and locations
  const userRoles: UserRole[] = [
    'therapist', 
    'speech-therapist', 
    'ot', 
    'physician', 
    'parent', 
    'admin'
  ];

  const clinicLocations: ClinicLocation[] = [
    'Main Clinic',
    'North Branch',
    'South Branch',
    'East Wing',
    'West Campus'
  ];

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle checkbox changes for recipient groups
  const handleGroupChange = (group: UserRole) => {
    setFormData(prev => {
      const groups = prev.recipientGroups.includes(group)
        ? prev.recipientGroups.filter(g => g !== group)
        : [...prev.recipientGroups, group];
      
      return {
        ...prev,
        recipientGroups: groups
      };
    });
  };

  // Handle checkbox changes for recipient locations
  const handleLocationChange = (location: ClinicLocation) => {
    setFormData(prev => {
      const locations = prev.recipientLocations.includes(location)
        ? prev.recipientLocations.filter(l => l !== location)
        : [...prev.recipientLocations, location];
      
      return {
        ...prev,
        recipientLocations: locations
      };
    });
  };

  // Handle file attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  // Remove attachment
  const removeAttachment = () => {
    setAttachment(null);
  };

  // Toggle send now vs schedule
  const toggleSendSchedule = () => {
    setFormData(prev => ({
      ...prev,
      sendNow: !prev.sendNow
    }));
  };

  // Submit notification
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim() || !formData.message.trim()) {
      alert('Title and message are required');
      return;
    }
    
    if (formData.recipientType === 'SpecificGroups' && 
        formData.recipientGroups.length === 0 && 
        formData.recipientLocations.length === 0) {
      alert('Please select at least one recipient group or location');
      return;
    }
    
    // Show preview before sending
    setShowPreview(true);
  };

  // Confirm and send notification
  const confirmAndSend = () => {
    const newNotification: BroadcastNotification = {
      id: `notif-${Date.now()}`,
      title: formData.title,
      message: formData.message,
      senderId: 'admin1',
      senderName: 'System Administrator',
      recipientType: formData.recipientType,
      recipientGroups: formData.recipientGroups,
      recipientLocations: formData.recipientLocations,
      priority: formData.priority,
      attachmentUrl: attachment ? URL.createObjectURL(attachment) : undefined,
      attachmentName: attachment ? attachment.name : undefined,
      scheduledAt: formData.sendNow ? undefined : formData.scheduledAt,
      sentAt: formData.sendNow ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      readBy: [],
      deliveryStatus: new Map()
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Reset form
    setFormData({
      title: '',
      message: '',
      recipientType: 'All',
      recipientGroups: [],
      recipientLocations: [],
      priority: 'Normal',
      scheduledAt: '',
      sendNow: true,
    });
    setAttachment(null);
    setShowPreview(false);
    
    // Return to list view
    setView('list');
    
    alert('Notification broadcasted successfully!');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Estimate recipient count
  const estimateRecipients = () => {
    if (formData.recipientType === 'All') {
      return 'All users (~150)';
    }
    
    const groups = formData.recipientGroups.length;
    const locations = formData.recipientLocations.length;
    
    if (groups > 0 && locations > 0) {
      return `~${groups * 15 + locations * 8} recipients`;
    } else if (groups > 0) {
      return `~${groups * 15} recipients`;
    } else if (locations > 0) {
      return `~${locations * 8} recipients`;
    }
    
    return '0 recipients';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Broadcast Notifications</h1>
            <p className="text-gray-600">Send announcements to users across the platform</p>
          </div>
          <button
            onClick={() => setView('form')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"
          >
            <Plus className="w-5 h-5" />
            New Notification
          </button>
        </div>
      </div>

      {view === 'list' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="text-center p-4 bg-blue-50 border-blue-200">
              <p className="text-2xl text-blue-600 mb-1">{notifications.length}</p>
              <p className="text-gray-600 text-sm">Total Broadcasts</p>
            </Card>
            <Card className="text-center p-4 bg-yellow-50 border-yellow-200">
              <p className="text-2xl text-yellow-600 mb-1">
                {notifications.filter(n => n.priority === 'Important').length}
              </p>
              <p className="text-gray-600 text-sm">Important</p>
            </Card>
            <Card className="text-center p-4 bg-green-50 border-green-200">
              <p className="text-2xl text-green-600 mb-1">
                {notifications.filter(n => n.sentAt).length}
              </p>
              <p className="text-gray-600 text-sm">Sent</p>
            </Card>
          </div>

          {/* Notifications List */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Broadcasts</h2>
            
            {notifications.length === 0 ? (
              <Card className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-900 mb-1">No notifications sent yet</h3>
                <p className="text-gray-500 mb-4">
                  Create your first broadcast notification to reach users
                </p>
                <button
                  onClick={() => setView('form')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                >
                  Create Notification
                </button>
              </Card>
            ) : (
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div key={notification.id}>
                    <Card>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-gray-900 font-medium">{notification.title}</h3>
                            <StatusBadge 
                              status={notification.priority} 
                              variant={notification.priority === 'Important' ? 'danger' : 'info'} 
                            />
                          </div>
                          <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span>From: {notification.senderName}</span>
                            <span>Sent: {formatDate(notification.sentAt || notification.createdAt)}</span>
                            <span>
                              Recipients: {notification.recipientType === 'All' ? 'All Users' : 
                                `${notification.recipientGroups.join(', ') || 'Selected Locations'}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {notification.attachmentUrl && (
                            <Paperclip className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-xs text-gray-500">
                            {notification.readBy.length} reads
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {view === 'form' && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Create New Notification</h3>
            <button
              onClick={() => setView('list')}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter notification title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Enter your message"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-2">Recipient Selection</label>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="all-users"
                      name="recipientType"
                      checked={formData.recipientType === 'All'}
                      onChange={() => setFormData(prev => ({ ...prev, recipientType: 'All' }))}
                      className="mr-2"
                    />
                    <label htmlFor="all-users" className="text-gray-700 text-sm">All Users</label>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        id="specific-groups"
                        name="recipientType"
                        checked={formData.recipientType === 'SpecificGroups'}
                        onChange={() => setFormData(prev => ({ ...prev, recipientType: 'SpecificGroups' }))}
                        className="mr-2"
                      />
                      <label htmlFor="specific-groups" className="text-gray-700 text-sm">Specific Groups</label>
                    </div>
                    
                    {formData.recipientType === 'SpecificGroups' && (
                      <div className="ml-6 space-y-3">
                        <div>
                          <label className="block text-gray-700 text-sm mb-2">User Groups</label>
                          <div className="grid grid-cols-2 gap-2">
                            {userRoles.map(role => (
                              <div key={role} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`group-${role}`}
                                  checked={formData.recipientGroups.includes(role)}
                                  onChange={() => handleGroupChange(role)}
                                  className="mr-2"
                                />
                                <label htmlFor={`group-${role}`} className="text-gray-700 text-sm capitalize">
                                  {role.replace('-', ' ')}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 text-sm mb-2">Clinic Locations</label>
                          <div className="grid grid-cols-2 gap-2">
                            {clinicLocations.map(location => (
                              <div key={location} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`location-${location}`}
                                  checked={formData.recipientLocations.includes(location)}
                                  onChange={() => handleLocationChange(location)}
                                  className="mr-2"
                                />
                                <label htmlFor={`location-${location}`} className="text-gray-700 text-sm">
                                  {location}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-2">Priority Level</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="Normal">Normal</option>
                  <option value="Important">Important</option>
                </select>
                {formData.priority === 'Important' && (
                  <p className="text-yellow-600 text-sm mt-1">
                    Important notifications will trigger sound and vibration even when the app is in background
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-2">Attach Image/File (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {attachment ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700 text-sm">{attachment.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeAttachment}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm mb-2">
                        Upload an image or PDF for visual updates
                      </p>
                      <p className="text-gray-500 text-xs mb-3">
                        JPG, PNG, PDF (max 5MB)
                      </p>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm cursor-pointer hover:bg-gray-200"
                      >
                        Choose File
                      </label>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-2">Schedule Send</label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="send-now"
                      name="schedule"
                      checked={formData.sendNow}
                      onChange={toggleSendSchedule}
                      className="mr-2"
                    />
                    <label htmlFor="send-now" className="text-gray-700 text-sm">Send Now</label>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        id="schedule-later"
                        name="schedule"
                        checked={!formData.sendNow}
                        onChange={toggleSendSchedule}
                        className="mr-2"
                      />
                      <label htmlFor="schedule-later" className="text-gray-700 text-sm">Schedule for Later</label>
                    </div>
                    
                    {!formData.sendNow && (
                      <div className="ml-6">
                        <input
                          type="datetime-local"
                          name="scheduledAt"
                          value={formData.scheduledAt}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Preview & Send
                </button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Notification</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="text-gray-900 font-medium mb-2">{formData.title}</h4>
                <p className="text-gray-700 text-sm mb-3">{formData.message}</p>
                <div className="text-xs text-gray-500">
                  <p>To: {formData.recipientType === 'All' ? 'All Users' : 'Selected Groups'}</p>
                  <p>Estimated recipients: {estimateRecipients()}</p>
                  <p>Priority: {formData.priority}</p>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm">
                Are you sure you want to send this notification to {estimateRecipients()}?
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmAndSend}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Notification
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BroadcastNotifications;