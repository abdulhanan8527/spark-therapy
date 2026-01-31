import { Plus, Search, Edit, Trash2, UserPlus, Star } from 'lucide-react';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';

export default function TherapistManagement() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Therapist Management</h1>
          <p className="text-gray-600">Manage therapist profiles and assignments</p>
        </div>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Therapist
        </button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search therapists by name, specialization..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>All Specializations</option>
            <option>Speech Therapy</option>
            <option>Physical Therapy</option>
            <option>Occupational Therapy</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="text-center p-4">
          <p className="text-3xl text-purple-600 mb-1">15</p>
          <p className="text-gray-600 text-sm">Total Therapists</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-3xl text-green-600 mb-1">14</p>
          <p className="text-gray-600 text-sm">Active</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-3xl text-yellow-600 mb-1">3</p>
          <p className="text-gray-600 text-sm">High Workload</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-3xl text-blue-600 mb-1">4.7</p>
          <p className="text-gray-600 text-sm">Avg Rating</p>
        </Card>
      </div>

      {/* Therapist Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Therapist</th>
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Specialization</th>
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Assigned Children</th>
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Performance</th>
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Status</th>
                <th className="text-right py-3 px-4 text-gray-600 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Dr. Sarah Smith', spec: 'Speech Therapy', children: 8, rating: 4.9, status: 'Active' },
                { name: 'Dr. Michael Lee', spec: 'Physical Therapy', children: 6, rating: 4.8, status: 'Active' },
                { name: 'Dr. Emily Chen', spec: 'Occupational Therapy', children: 10, rating: 4.7, status: 'Active' },
                { name: 'Dr. James Wilson', spec: 'Speech Therapy', children: 7, rating: 4.6, status: 'Active' },
                { name: 'Dr. Lisa Brown', spec: 'Physical Therapy', children: 5, rating: 4.9, status: 'Active' },
              ].map((therapist, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600">{therapist.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <p className="text-gray-900">{therapist.name}</p>
                        <p className="text-gray-500 text-sm">CCC-SLP</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-900">{therapist.spec}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900">{therapist.children} children</p>
                      {therapist.children >= 10 && (
                        <StatusBadge status="High Load" variant="warning" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-gray-900">{therapist.rating}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={therapist.status} variant="success" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
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
