import { BookOpen, Clock, CheckCircle, XCircle, TrendingUp, Users, AlertCircle, Gift, MessageSquare, DollarSign, Package } from 'lucide-react';

interface LibrarianHomePageProps {
  pendingBorrowRequests?: number;
  pendingReturnRequests?: number;
  pendingDonations?: number;
  totalBooksManaged?: number;
  activeLoans?: number;
  overdueBooks?: number;
  onNavigateToBorrows?: () => void;
  onNavigateToReturns?: () => void;
  onNavigateToDonations?: () => void;
  recentActivities?: Array<{ id: string; user: string; action: string; book?: string; time: string; type: string }>;
  booksBorrowedToday?: number;
  booksReturnedToday?: number;
  newDonationsToday?: number;
}

export function LibrarianHomePage({
  pendingBorrowRequests = 8,
  pendingReturnRequests = 5,
  pendingDonations = 3,
  totalBooksManaged = 1247,
  activeLoans = 156,
  overdueBooks = 12,
  onNavigateToBorrows,
  onNavigateToReturns,
  onNavigateToDonations,
  recentActivities = [],
  booksBorrowedToday = 0,
  booksReturnedToday = 0,
  newDonationsToday = 0,
}: LibrarianHomePageProps) {
  const todayStats = [
    { label: 'Books Borrowed', value: booksBorrowedToday, trend: '+' + booksBorrowedToday, icon: BookOpen, color: 'blue' },
    { label: 'Books Returned', value: booksReturnedToday, trend: '+' + booksReturnedToday, icon: CheckCircle, color: 'green' },
    { label: 'New Donations', value: newDonationsToday, trend: '+' + newDonationsToday, icon: Gift, color: 'purple' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl mb-2">Welcome, Librarian! 📚</h1>
            <p className="text-green-100 text-lg">Here's your library overview for today</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
            <Clock className="w-12 h-12" />
          </div>
        </div>
      </div>

      {/* Today's Stats */}
      <div>
        <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Today's Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {todayStats.map((stat, idx) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-green-600',
              purple: 'from-purple-500 to-purple-600',
            }[stat.color];

            return (
              <div key={idx} className={`bg-gradient-to-br ${colorClasses} rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all`}>
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8" />
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">{stat.trend}</span>
                </div>
                <p className="text-3xl mb-1">{stat.value}</p>
                <p className="text-white/80">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Actions */}
      <div>
        <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Pending Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Borrow Requests */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all cursor-pointer"
            onClick={onNavigateToBorrows}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl">
                {pendingBorrowRequests}
              </div>
            </div>
            <h3 className="text-gray-900 dark:text-white mb-2">Borrow Requests</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Users waiting to borrow books</p>
            <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Review Requests
            </button>
          </div>

          {/* Pending Return Requests */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all cursor-pointer"
            onClick={onNavigateToReturns}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl">
                {pendingReturnRequests}
              </div>
            </div>
            <h3 className="text-gray-900 dark:text-white mb-2">Return Requests</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Books ready to be returned</p>
            <button className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors">
              Process Returns
            </button>
          </div>

          {/* Pending Donations */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all cursor-pointer"
            onClick={onNavigateToDonations}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <Gift className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl">
                {pendingDonations}
              </div>
            </div>
            <h3 className="text-gray-900 dark:text-white mb-2">Donation Requests</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Books pending approval</p>
            <button className="mt-4 w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors">
              Review Donations
            </button>
          </div>
        </div>
      </div>

      {/* Library Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg">
              <Package className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Total Books</p>
              <p className="text-3xl text-gray-900 dark:text-white">{totalBooksManaged}</p>
            </div>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
            <p className="text-indigo-600 dark:text-indigo-400 text-sm">Under your management</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg">
              <TrendingUp className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Active Loans</p>
              <p className="text-3xl text-gray-900 dark:text-white">{activeLoans}</p>
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
            <p className="text-amber-600 dark:text-amber-400 text-sm">Currently borrowed</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Overdue Books</p>
              <p className="text-3xl text-gray-900 dark:text-white">{overdueBooks}</p>
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <p className="text-red-600 dark:text-red-400 text-sm">Requires attention</p>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Recent Activities</h2>
        <div className="space-y-3">
          {recentActivities.map((activity, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'borrow' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  activity.type === 'return' ? 'bg-green-100 dark:bg-green-900/30' :
                  activity.type === 'donation' ? 'bg-purple-100 dark:bg-purple-900/30' :
                  'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {activity.type === 'borrow' && <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                  {activity.type === 'return' && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
                  {activity.type === 'donation' && <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                  {activity.type === 'late' && <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">"{activity.book}"</p>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border-2 border-green-200 dark:border-gray-600">
        <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Quick Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mt-1">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-gray-900 dark:text-white mb-1">Process requests promptly</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Keep users happy by reviewing requests within 24 hours</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg mt-1">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-gray-900 dark:text-white mb-1">Monitor overdue books</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Send reminders to users with overdue books</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}