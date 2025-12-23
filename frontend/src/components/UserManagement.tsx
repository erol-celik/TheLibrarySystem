import { useState, useEffect } from 'react';
import { User, Ban, CheckCircle, Search, Shield, AlertTriangle, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { UserService } from '../services/UserService';
import { UserAccount } from '../types';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string[]; // Set<RoleType> returns array of strings
  joinDate: string;
  isBanned: boolean;
  penaltyCount: number;
}

export function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await UserService.getAllUsersAdmin();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleToggleBan = async (user: AdminUser) => {
    const newStatus = user.isBanned ? 'active' : 'blocked';
    try {
      await UserService.updateUserStatusAdmin(String(user.id), newStatus);
      toast.success(`User ${newStatus === 'blocked' ? 'banned' : 'unbanned'} successfully`);
      setUsers(users.map(u => u.id === user.id ? { ...u, isBanned: !u.isBanned } : u));
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleUpdatePenalty = async (user: AdminUser, delta: number) => {
    const newCount = Math.max(0, user.penaltyCount + delta);
    if (newCount === user.penaltyCount) return;

    try {
      await UserService.updateUserPenaltyAdmin(String(user.id), newCount);
      toast.success('Penalty count updated');
      setUsers(users.map(u => u.id === user.id ? { ...u, penaltyCount: newCount } : u));
    } catch (error) {
      toast.error('Failed to update penalty');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' ? !user.isBanned : user.isBanned);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => !u.isBanned).length,
    blocked: users.filter(u => u.isBanned).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-gray-900 dark:text-white font-bold text-lg">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-gray-900 dark:text-white font-bold text-lg">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Ban className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Blocked</p>
              <p className="text-gray-900 dark:text-white font-bold text-lg">{stats.blocked}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={() => setFilterStatus('all')} className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>All</button>
            <button onClick={() => setFilterStatus('active')} className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>Active</button>
            <button onClick={() => setFilterStatus('blocked')} className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'blocked' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>Blocked</button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">ID</th>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">User</th>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Email</th>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Role</th>
                <th className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">Penalty</th>
                <th className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-500">{user.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-sm">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleUpdatePenalty(user, -1)} className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"><Minus className="w-3 h-3" /></button>
                      <span className={`font-mono font-medium ${user.penaltyCount > 0 ? 'text-red-500' : 'text-gray-500'}`}>{user.penaltyCount}</span>
                      <button onClick={() => handleUpdatePenalty(user, 1)} className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"><Plus className="w-3 h-3" /></button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${!user.isBanned
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                    >
                      {!user.isBanned ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleBan(user)}
                        className={`p-1.5 rounded-lg transition-colors ${!user.isBanned
                          ? 'text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/30'
                          : 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30'
                          }`}
                        title={!user.isBanned ? "Ban User" : "Unban User"}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!isLoading && filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">No users found matching your criteria.</div>
          )}
        </div>
      </div>
    </div>
  );
}