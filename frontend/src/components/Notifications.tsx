import { Bell, Check, X, Clock, BookOpen, AlertCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  date: string;
  read: boolean;
  targetRole?: 'user' | 'librarian' | 'admin' | 'all';
  targetUser?: string;
}

interface NotificationsProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkAllAsRead: () => void;
  currentUserRole?: 'user' | 'librarian' | 'admin';
  currentUsername?: string;
}

export function Notifications({ 
  notifications, 
  onMarkAsRead, 
  onDelete, 
  onMarkAllAsRead,
  currentUserRole,
  currentUsername
}: NotificationsProps) {
  // Filter notifications based on user role and username
  const filteredNotifications = notifications.filter(n => {
    // If notification has a specific target user, only show to that user
    if (n.targetUser && n.targetUser !== currentUsername) return false;
    
    // If notification has no targetRole or targetRole is 'all', show to everyone
    if (!n.targetRole || n.targetRole === 'all') return true;
    
    // Otherwise, only show if targetRole matches currentUserRole
    return n.targetRole === currentUserRole;
  });

  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string, read: boolean) => {
    if (read) return 'bg-gray-50 dark:bg-gray-700';
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-gray-900 dark:text-white">Notifications</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`${getBgColor(notification.type, notification.read)} rounded-lg p-4 transition-all ${
                  !notification.read ? 'border-l-4 border-purple-600 dark:border-purple-400' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-gray-900 dark:text-white mb-1">{notification.title}</h4>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">{notification.message}</p>
                        <p className="text-gray-500 dark:text-gray-400">{notification.date}</p>
                      </div>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => onMarkAsRead(notification.id)}
                            className="p-2 text-purple-600 dark:text-purple-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(notification.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}