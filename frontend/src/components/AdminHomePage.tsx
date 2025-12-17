import { Users, BookOpen, TrendingUp, Shield, MessageSquare, AlertTriangle, DollarSign, CheckCircle, XCircle, Clock, Award, Activity, UserCheck, UserX, Package, Gift } from 'lucide-react';
import { useRef } from 'react';

interface AdminHomePageProps {
  totalUsers?: number;
  totalBooks?: number;
  totalRevenue?: number;
  pendingFeedbacks?: number;
  bannedUsers?: number;
  onNavigateToUserManagement?: () => void;
  onNavigateToFeedbacks?: () => void;
  onNavigateToBooks?: () => void;
  revenueHistory?: Array<{ username: string; bookTitle: string; amount: number; date: string }>;
  borrowedBooks?: number;
  pendingRequests?: number;
  recentActivities?: Array<{ id: string; action: string; user: string; time: string; type: string; book?: string }>;
  newRegistrationsToday?: number;
  adminCount?: number;
  librarianCount?: number;
  userCount?: number;
}

export function AdminHomePage({
  totalUsers = 0,
  totalBooks = 0,
  totalRevenue = 0,
  pendingFeedbacks = 0,
  bannedUsers = 0,
  onNavigateToUserManagement,
  onNavigateToFeedbacks,
  onNavigateToBooks,
  revenueHistory = [],
  borrowedBooks = 0,
  pendingRequests = 0,
  recentActivities = [],
  newRegistrationsToday = 0,
  adminCount = 0,
  librarianCount = 0,
  userCount = 0,
}: AdminHomePageProps) {
  const revenueHistoryRef = useRef<HTMLDivElement>(null);

  const scrollToRevenueHistory = () => {
    revenueHistoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const systemStats = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'from-blue-500 to-blue-600', onClick: onNavigateToUserManagement },
    { label: 'Total Books', value: totalBooks, icon: BookOpen, color: 'from-purple-500 to-purple-600', onClick: onNavigateToBooks },
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'from-green-500 to-green-600', onClick: scrollToRevenueHistory },
  ];

  const alerts = [
    { type: 'warning', message: `${pendingFeedbacks} pending feedbacks require your attention`, action: 'Review Feedbacks', onClick: onNavigateToFeedbacks },
    { type: 'info', message: `${bannedUsers} users are currently banned from the system`, action: 'View Users', onClick: onNavigateToUserManagement },
    { type: 'success', message: 'System performance is optimal', action: null, onClick: null },
  ];

  // Calculate percentages for user role distribution
  const calculatePercentage = (count: number) => {
    if (totalUsers === 0) return 0;
    return Math.round((count / totalUsers) * 100);
  };

  const userRoleDistribution = [
    { role: 'Regular Users', count: userCount, percentage: calculatePercentage(userCount), color: 'bg-blue-500' },
    { role: 'Librarians', count: librarianCount, percentage: calculatePercentage(librarianCount), color: 'bg-green-500' },
    { role: 'Admins', count: adminCount, percentage: calculatePercentage(adminCount), color: 'bg-purple-500' },
  ];

  const topMetrics = [
    { label: 'Books Borrowed Today', value: borrowedBooks, icon: TrendingUp, color: 'cyan' },
    { label: 'New Registrations', value: newRegistrationsToday, icon: UserCheck, color: 'indigo' },
    { label: 'Pending Approvals', value: pendingRequests, icon: Clock, color: 'amber' },
    { label: 'System Uptime', value: '99.9%', icon: Activity, color: 'emerald' },
  ];

  return (
    <div className="space-y-8">
      {/* Admin Welcome Header */}
      <div className="bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-10 h-10" />
            <h1 className="text-4xl">Admin Dashboard</h1>
          </div>
          <p className="text-purple-100 text-lg">Complete system overview and control panel</p>
        </div>
      </div>

      {/* System Stats */}
      <div>
        <h2 className="text-2xl text-gray-900 dark:text-white mb-4">System Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {systemStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx} 
                className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all ${stat.onClick ? 'cursor-pointer' : ''}`}
                onClick={stat.onClick}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-10 h-10" />
                </div>
                <p className="text-4xl mb-1">{stat.value}</p>
                <p className="text-white/80">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts Section */}
      <div>
        <h2 className="text-2xl text-gray-900 dark:text-white mb-4">System Alerts</h2>
        <div className="space-y-3">
          {alerts.map((alert, idx) => (
            <div 
              key={idx}
              className={`rounded-xl p-4 flex items-center justify-between ${
                alert.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800' :
                alert.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800' :
                'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  alert.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/40' :
                  alert.type === 'info' ? 'bg-blue-100 dark:bg-blue-900/40' :
                  'bg-green-100 dark:bg-green-900/40'
                }`}>
                  {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                  {alert.type === 'info' && <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                  {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
                </div>
                <p className={`${
                  alert.type === 'warning' ? 'text-amber-800 dark:text-amber-300' :
                  alert.type === 'info' ? 'text-blue-800 dark:text-blue-300' :
                  'text-green-800 dark:text-green-300'
                }`}>{alert.message}</p>
              </div>
              {alert.action && (
                <button 
                  onClick={alert.onClick || undefined}
                  className={`px-4 py-2 rounded-lg text-white ${
                    alert.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  } transition-colors`}
                >
                  {alert.action}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top Metrics */}
      <div>
        <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Today's Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {topMetrics.map((metric, idx) => {
            const Icon = metric.icon;
            const colorClasses = {
              cyan: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
              indigo: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
              amber: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
              emerald: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
            }[metric.color];
            const iconColor = {
              cyan: 'text-cyan-600 dark:text-cyan-400',
              indigo: 'text-indigo-600 dark:text-indigo-400',
              amber: 'text-amber-600 dark:text-amber-400',
              emerald: 'text-emerald-600 dark:text-emerald-400',
            }[metric.color];
            
            return (
              <div key={idx} className={`${colorClasses} border-l-4 rounded-xl p-5 shadow-md`}>
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{metric.label}</p>
                </div>
                <p className="text-3xl text-gray-900 dark:text-white">{metric.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Role Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl text-gray-900 dark:text-white mb-6">User Distribution by Role</h2>
        <div className="space-y-4">
          {userRoleDistribution.map((role, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-900 dark:text-white">{role.role}</span>
                <span className="text-gray-600 dark:text-gray-400">{role.count} users ({role.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className={`${role.color} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${role.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Recent System Activities</h2>
        {recentActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Activity className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p>No recent activities</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity) => {
              const iconMap: Record<string, any> = {
                user: Users,
                book: BookOpen,
                ban: UserX,
                feedback: MessageSquare,
                promote: Award,
                donation: Gift,
                borrow: BookOpen,
                return: CheckCircle,
                late: Clock,
                purchase: DollarSign,
              };
              const Icon = iconMap[activity.type] || Activity;
              
              const colorMap: Record<string, string> = {
                user: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                book: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
                ban: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
                feedback: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
                promote: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
                donation: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
                borrow: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
                return: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
                late: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
                purchase: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
              };

              return (
                <div 
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${colorMap[activity.type] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white">{activity.action}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{activity.user}{activity.book ? ` - "${activity.book}"` : ''}</p>
                    </div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{activity.time}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Management Links */}
      <div>
        <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Quick Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg cursor-pointer transform hover:scale-105 transition-all"
            onClick={onNavigateToUserManagement}
          >
            <Users className="w-10 h-10 mb-4" />
            <h3 className="text-xl mb-2">User Management</h3>
            <p className="text-blue-100 mb-4">Manage all users, roles, and permissions</p>
            <button className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
              Manage Users →
            </button>
          </div>

          <div 
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg cursor-pointer transform hover:scale-105 transition-all"
            onClick={onNavigateToBooks}
          >
            <BookOpen className="w-10 h-10 mb-4" />
            <h3 className="text-xl mb-2">Book Catalog</h3>
            <p className="text-purple-100 mb-4">View and manage the entire book collection</p>
            <button className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
              View Catalog →
            </button>
          </div>

          <div 
            className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg cursor-pointer transform hover:scale-105 transition-all"
            onClick={onNavigateToFeedbacks}
          >
            <MessageSquare className="w-10 h-10 mb-4" />
            <h3 className="text-xl mb-2">Feedbacks</h3>
            <p className="text-amber-100 mb-4">Review user complaints and suggestions</p>
            <button className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
              View Feedbacks →
            </button>
          </div>
        </div>
      </div>

      {/* Revenue History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6" ref={revenueHistoryRef}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl text-gray-900 dark:text-white">Revenue History</h2>
          <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-lg">
            <p className="text-green-600 dark:text-green-400">Total: ${totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        {revenueHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <DollarSign className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p>No revenue transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {revenueHistory.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white">{item.username} purchased "{item.bookTitle}"</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{item.date}</p>
                  </div>
                </div>
                <p className="text-green-600 dark:text-green-400 text-lg">+${item.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}