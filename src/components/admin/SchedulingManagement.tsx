import React, { useState } from 'react';
import { Calendar, AlertCircle, Plus, Search, Edit, Trash2, Clock, User } from 'lucide-react';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';

interface ScheduleEntry {
  id: string;
  therapist: string;
  client: string;
  date: string;
  startTime: string;
  endTime: string;
  recurring: boolean;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface Therapist {
  id: string;
  name: string;
  specialization: string;
  availableSlots: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
}

export default function SchedulingManagement() {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([
    {
      id: '1',
      therapist: 'Dr. Sarah Smith',
      client: 'Emma Johnson',
      date: '2025-12-15',
      startTime: '09:30',
      endTime: '10:15',
      recurring: true,
      status: 'confirmed'
    },
    {
      id: '2',
      therapist: 'Dr. Sarah Smith',
      client: 'Liam Chen',
      date: '2025-12-15',
      startTime: '10:30',
      endTime: '11:15',
      recurring: true,
      status: 'confirmed'
    },
    {
      id: '3',
      therapist: 'Dr. Michael Lee',
      client: 'Olivia Martinez',
      date: '2025-12-16',
      startTime: '14:00',
      endTime: '14:45',
      recurring: false,
      status: 'pending'
    }
  ]);

  const [therapists] = useState<Therapist[]>([
    {
      id: '1',
      name: 'Dr. Sarah Smith',
      specialization: 'Speech Therapy',
      availableSlots: [
        { date: '2025-12-15', startTime: '09:00', endTime: '12:00' },
        { date: '2025-12-16', startTime: '14:00', endTime: '17:00' },
        { date: '2025-12-18', startTime: '10:00', endTime: '13:00' }
      ]
    },
    {
      id: '2',
      name: 'Dr. Michael Lee',
      specialization: 'Physical Therapy',
      availableSlots: [
        { date: '2025-12-14', startTime: '13:00', endTime: '16:00' },
        { date: '2025-12-17', startTime: '09:00', endTime: '12:00' },
        { date: '2025-12-19', startTime: '15:00', endTime: '18:00' }
      ]
    }
  ]);

  const [newSchedule, setNewSchedule] = useState({
    therapist: '',
    client: '',
    date: '',
    startTime: '',
    endTime: '',
    recurring: false
  });

  const [selectedDate, setSelectedDate] = useState<string>('2025-12-15');
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setNewSchedule(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for conflicts
    const hasConflict = schedules.some(schedule => 
      schedule.therapist === newSchedule.therapist &&
      schedule.date === newSchedule.date &&
      ((schedule.startTime <= newSchedule.startTime && schedule.endTime > newSchedule.startTime) ||
       (schedule.startTime < newSchedule.endTime && schedule.endTime >= newSchedule.endTime) ||
       (schedule.startTime >= newSchedule.startTime && schedule.endTime <= newSchedule.endTime))
    );

    if (hasConflict) {
      alert('Schedule conflict detected! Please choose a different time.');
      return;
    }

    const newEntry: ScheduleEntry = {
      id: Date.now().toString(),
      therapist: newSchedule.therapist,
      client: newSchedule.client,
      date: newSchedule.date,
      startTime: newSchedule.startTime,
      endTime: newSchedule.endTime,
      recurring: newSchedule.recurring,
      status: 'confirmed'
    };

    setSchedules([...schedules, newEntry]);
    
    // Reset form
    setNewSchedule({
      therapist: '',
      client: '',
      date: '',
      startTime: '',
      endTime: '',
      recurring: false
    });
  };

  const deleteSchedule = (id: string) => {
    setSchedules(schedules.filter(schedule => schedule.id !== id));
  };

  const filteredSchedules = schedules.filter(schedule =>
    schedule.therapist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate calendar days for December 2025
  const generateCalendarDays = () => {
    const days: (number | null)[] = [];
    const startDate = new Date(2025, 11, 1); // December 1, 2025
    const endDate = new Date(2025, 11, 31); // December 31, 2025
    
    // Add empty cells for days before December 1
    const startDay = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add days of December
    for (let d = 1; d <= 31; d++) {
      days.push(d);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Get schedules for a specific date
  const getSchedulesForDate = (date: string) => {
    return schedules.filter(schedule => schedule.date === date);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Scheduling Management</h1>
        <p className="text-gray-600">Create and manage therapy session schedules</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule Creation Panel */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <h2 className="text-gray-900 mb-4">Create New Schedule</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm mb-2">Therapist</label>
                  <select 
                    name="therapist"
                    value={newSchedule.therapist}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select Therapist</option>
                    <option>Dr. Sarah Smith</option>
                    <option>Dr. Michael Lee</option>
                    <option>Dr. Emily Chen</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm mb-2">Client</label>
                  <select 
                    name="client"
                    value={newSchedule.client}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select Client</option>
                    <option>Emma Johnson</option>
                    <option>Liam Chen</option>
                    <option>Olivia Martinez</option>
                    <option>Noah Williams</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm mb-2">Date</label>
                  <input 
                    type="date" 
                    name="date"
                    value={newSchedule.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm mb-2">Start Time</label>
                  <input 
                    type="time" 
                    name="startTime"
                    value={newSchedule.startTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm mb-2">End Time</label>
                  <input 
                    type="time" 
                    name="endTime"
                    value={newSchedule.endTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <input 
                  type="checkbox" 
                  id="recurring" 
                  name="recurring"
                  checked={newSchedule.recurring}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="recurring" className="text-gray-700 text-sm">
                  Recurring Schedule (Monthly)
                </label>
              </div>
              
              <button 
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Schedule
              </button>
            </form>
          </Card>
          
          {/* Conflict Detection Info */}
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-gray-900 text-sm font-medium mb-1">Conflict Detection</h3>
                <p className="text-yellow-700 text-sm">
                  The system automatically checks for scheduling conflicts. If a therapist already has a session 
                  at the selected time, you'll be notified before saving.
                </p>
              </div>
            </div>
          </Card>
          
          {/* Schedule Calendar View */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-900">December 2025</h2>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-gray-500 text-sm py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }
                
                const dateString = `2025-12-${day.toString().padStart(2, '0')}`;
                const daySchedules = getSchedulesForDate(dateString);
                const isSelected = selectedDate === dateString;
                
                return (
                  <div 
                    key={day} 
                    onClick={() => setSelectedDate(dateString)}
                    className={`aspect-square border rounded-lg p-1 cursor-pointer ${
                      isSelected 
                        ? 'bg-purple-100 border-purple-300' 
                        : daySchedules.length > 0 
                          ? 'bg-purple-50 border-purple-200' 
                          : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="text-right text-xs text-gray-500 mb-1">{day}</div>
                    <div className="space-y-1">
                      {daySchedules.slice(0, 2).map(schedule => (
                        <div 
                          key={schedule.id} 
                          className="text-xs bg-purple-100 text-purple-800 rounded px-1 truncate"
                        >
                          {schedule.startTime} - {schedule.client.split(' ')[0]}
                        </div>
                      ))}
                      {daySchedules.length > 2 && (
                        <div className="text-xs text-gray-500">+{daySchedules.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
        
        {/* Right Panel - Availability and Schedule List */}
        <div>
          {/* Therapist Availability */}
          <Card className="mb-6">
            <h2 className="text-gray-900 mb-4">Therapist Availability</h2>
            
            <div className="space-y-4">
              {therapists.map(therapist => (
                <div key={therapist.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-xs">
                        {therapist.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-900 text-sm">{therapist.name}</p>
                      <p className="text-gray-500 text-xs">{therapist.specialization}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-gray-600 mb-1">Available Slots:</p>
                    <ul className="text-gray-900 space-y-1">
                      {therapist.availableSlots.map((slot, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          {new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: 
                          {' '}{slot.startTime} - {slot.endTime}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          {/* Schedule List */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-900">Scheduled Sessions</h2>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredSchedules.map(schedule => (
                <div key={schedule.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-gray-900 text-sm font-medium">{schedule.client}</p>
                      <p className="text-gray-600 text-xs">{schedule.therapist}</p>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1 text-gray-500 hover:text-blue-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1 text-gray-500 hover:text-red-600"
                        onClick={() => deleteSchedule(schedule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      {schedule.startTime} - {schedule.endTime}
                    </div>
                    <StatusBadge 
                      status={schedule.recurring ? 'Recurring' : 'One-time'} 
                      variant={schedule.recurring ? 'success' : 'neutral'} 
                    />
                  </div>
                </div>
              ))}
              
              {filteredSchedules.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p>No scheduled sessions found</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}