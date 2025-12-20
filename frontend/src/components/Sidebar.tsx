import { Library, Shield, User, Wallet, Bell, BookOpen, LogOut, Home, MessageSquare, Gift, ClipboardList, BookMarked } from 'lucide-react';

interface SidebarProps {
  userRole: 'user' | 'librarian' | 'admin';
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  notificationCount: number;
}

export function Sidebar({ userRole, activeTab, onTabChange, onLogout, notificationCount }: SidebarProps) {
  // Role-based colors
  const roleColors = {
    user: {
      bg: 'bg-blue-600',
      hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/30',
      text: 'text-blue-600',
      badgeBg: 'bg-white',
      badgeText: 'text-blue-600',
    },
    librarian: {
      bg: 'bg-green-600',
      hoverBg: 'hover:bg-green-50 dark:hover:bg-green-900/30',
      text: 'text-green-600',
      badgeBg: 'bg-white',
      badgeText: 'text-green-600',
    },
    admin: {
      bg: 'bg-purple-600',
      hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/30',
      text: 'text-purple-600',
      badgeBg: 'bg-white',
      badgeText: 'text-purple-600',
    },
  };

  const colors = roleColors[userRole];

  const userMenuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'catalog', icon: Library, label: 'Book Catalog' },
    { id: 'account', icon: User, label: 'Account' },
    { id: 'wallet', icon: Wallet, label: 'My Wallet' },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: notificationCount },
    { id: 'history', icon: BookOpen, label: 'Book History' },
    { id: 'feedback', icon: MessageSquare, label: 'Feedback' },
    { id: 'donation', icon: Gift, label: 'Donate Book' },
  ];

  const librarianMenuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'catalog', icon: Library, label: 'Book Catalog' },
    { id: 'bookManagement', icon: BookMarked, label: 'Book Management' },
    { id: 'requests', icon: ClipboardList, label: 'Requests' },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: notificationCount },
  ];

  const adminMenuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'catalog', icon: Library, label: 'Book Catalog' },
    { id: 'admin', icon: MessageSquare, label: 'Comments Panel' },
    { id: 'users', icon: User, label: 'User Management' },
    { id: 'feedbackManagement', icon: MessageSquare, label: 'Feedbacks' },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: notificationCount },
  ];

  const menuItems =
    userRole === 'user' ? userMenuItems :
      userRole === 'librarian' ? librarianMenuItems :
        adminMenuItems;

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col transition-colors sticky top-0">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${colors.bg} rounded-lg`}>
            <Library className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white">BookHub</h2>
            <p className="text-gray-500 dark:text-gray-400 capitalize">{userRole}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                ? `${colors.bg} text-white shadow-lg`
                : `text-gray-600 dark:text-gray-300 ${colors.hoverBg}`
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`${isActive ? colors.badgeBg : colors.bg} ${isActive ? colors.badgeText : 'text-white'} text-xs px-2 py-1 rounded-full`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}