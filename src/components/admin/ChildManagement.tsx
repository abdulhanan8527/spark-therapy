import { Plus, Search, Edit, User, Target } from '../../components/SimpleIcons';
import { Card } from '../shared/Card';
import { StatusBadge } from '../shared/StatusBadge';

export default function ChildManagement() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Child Management</h1>
          <p className="text-gray-600">Manage child profiles and therapy assignments</p>
        </div>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Child
        </button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search children by name, parent name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>All Therapists</option>
            <option>Dr. Sarah Smith</option>
            <option>Dr. Michael Lee</option>
            <option>Dr. Emily Chen</option>
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
          <p className="text-3xl text-blue-600 mb-1">52</p>
          <p className="text-gray-600 text-sm">Total Children</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-3xl text-green-600 mb-1">48</p>
          <p className="text-gray-600 text-sm">Active</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-3xl text-yellow-600 mb-1">89%</p>
          <p className="text-gray-600 text-sm">Avg Attendance</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-3xl text-purple-600 mb-1">68%</p>
          <p className="text-gray-600 text-sm">Goals Achieved</p>
        </Card>
      </div>

      {/* Children Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Child</th>
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Parent/Guardian</th>
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Assigned Therapists</th>
                <th className="text-left py-3 px-4 text-gray-600 text-sm">Attendance</th>
                <th className="text-left py-3 px-4 text-gray-600 text-sm">IEP Progress</th>
                <th className="text-right py-3 px-4 text-gray-600 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Emma Johnson', age: 6, parent: 'Sarah Johnson', therapists: ['Dr. Smith', 'Dr. Lee'], attendance: 92, progress: 67 },
                { name: 'Liam Chen', age: 5, parent: 'Michael Chen', therapists: ['Dr. Smith'], attendance: 88, progress: 75 },
                { name: 'Olivia Martinez', age: 7, parent: 'Maria Martinez', therapists: ['Dr. Chen'], attendance: 95, progress: 82 },
                { name: 'Noah Williams', age: 6, parent: 'David Williams', therapists: ['Dr. Smith', 'Dr. Wilson'], attendance: 90, progress: 70 },
                { name: 'Sophia Davis', age: 5, parent: 'Emily Davis', therapists: ['Dr. Brown'], attendance: 85, progress: 65 },
              ].map((child, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600">{child.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <p className="text-gray-900">{child.name}</p>
                        <p className="text-gray-500 text-sm">Age {child.age}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-900">{child.parent}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {child.therapists.map((t, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className={`text-sm mb-1 ${child.attendance >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {child.attendance}%
                      </p>
                      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${child.attendance >= 90 ? 'bg-green-600' : 'bg-yellow-500'}`}
                          style={{ width: `${child.attendance}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm mb-1 text-gray-900">{child.progress}%</p>
                      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${child.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg">
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Target className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Edit className="w-4 h-4" />
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
