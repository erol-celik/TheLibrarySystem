import { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

// Componentler
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { Sidebar } from './components/Sidebar';
import { BookCatalog } from './components/BookCatalog';
import { BookDetailModal } from './components/BookDetailModal';
import { AccountManagement } from './components/AccountManagement';
import { Wallet, Transaction } from './components/Wallet';
import { HomePage } from './components/HomePage';
import { LibrarianPanel } from './components/LibrarianPanel';
import { AdminHomePage } from './components/AdminHomePage';
import { LibrarianHomePage } from './components/LibrarianHomePage';
import { BookHistory } from './components/BookHistory';
import { FeedbackForm } from './components/FeedbackForm';
import { DonationForm } from './components/DonationForm';
import { BlindDate } from './components/BlindDate';
import { BookManagement } from "./components/BookManagement";
import { UserManagement } from './components/UserManagement';
import { FeedbackManagement } from './components/FeedbackManagement';
import { AdminPanel } from './components/AdminPanel'; // Yorum yönetimi için

// Servisler ve Tipler
import { AuthService } from './services/AuthService';
import { BookService } from './services/BookService';
import { UserService } from './services/UserService';
import { Book, UserAccount } from './types';
import { DashboardService } from "./services/DashboardService";
import { RentalService } from './services/RentalService';
import { WalletService } from "./services/WalletService";
import { NotificationService, NotificationItem } from './services/NotificationService';
import { Notifications } from './components/Notifications';
import { FeedbackService, Feedback } from './services/FeedbackService';


function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- STATE (Hafıza Alanları) ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);

  // Veri State'leri
  // Veri State'leri
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newArrivals, setNewArrivals] = useState<Book[]>([]);
  const [topRatedBooks, setTopRatedBooks] = useState<Book[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  // Allow stats to hold additional admin/librarian data
  const [stats, setStats] = useState<any>({ totalUsers: 0, borrowedCount: 0, totalBooks: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]); // Initialize Transaction State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [rentalRequests, setRentalRequests] = useState([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  // Seçili Kitap (Modal için)
  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // --- INIT (Uygulama İlk Açıldığında Token Kontrolü) ---
  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // 1. Kullanıcıyı çek
          const user = await UserService.getMe();
          setCurrentUser(user);
          setIsLoggedIn(true);

          // 2. Cüzdan geçmişini çek (Sadece normal kullanıcılar için)
          if (user.role === 'user') {
            try {
              const txList = await WalletService.getTransactions();
              setTransactions(txList);
            } catch (err) {
            console.error("Failed to fetch wallet history:", err);
          }
        }

        // 3. Fetch library data with user role context
        await fetchLibraryData(user);

      } catch (error) {
        console.error("Failed to renew session:", error);
        AuthService.logout();
      }
    }
  };
  initApp();
}, []);
useEffect(() => {
  console.log("Current User Role:", currentUser ? currentUser.role : "Guest");
}, [currentUser]);
  useEffect(() => {
    // Unified Search Automation
    // Automatically triggers search when filters change
    const delayDebounceFn = setTimeout(() => {
      handleSearch(currentPage);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategory, selectedStatus, currentPage]);

  // Reset Page logic is now inside handleSearch (Force Sync)
  useEffect(() => {
    if (location.pathname === '/requests' && (currentUser?.role === 'librarian' || currentUser?.role === 'admin')) {
      RentalService.getAllRequests().then(setRentalRequests);
    }
    if (location.pathname === '/notifications') {
      fetchNotificationsRaw();
    }
  }, [location.pathname, currentUser]);

  // Sayfa İlk Yüklendiğinde Bildirim Sayısını Getir (Sadece Giriş Yapılmışsa)
  useEffect(() => {
    if (isLoggedIn) {
      NotificationService.getUnreadCount().then(setNotificationCount).catch(() => { });
    }
  }, [isLoggedIn]);

  // --- DATA FETCHING FUNCTION ---
  // Accepts optional user parameter to handle async state timing issues
  const fetchLibraryData = async (user?: typeof currentUser) => {
    const activeUser = user || currentUser; // Use passed user or fall back to state
    setIsLoadingData(true);
    try {
      const [catsData, dashboardData, newArrivalsData, topRatedData] = await Promise.all([
        BookService.getAllCategories(),
        DashboardService.getPublicStats(),
        BookService.getNewArrivals(),
        BookService.getTopRatedBooks()
      ]);

      setCategories(catsData);
      setNewArrivals(newArrivalsData);
      setTopRatedBooks(topRatedData);
      console.log('DEBUG: Categories fetched:', catsData);

      let adminStats = null;
      let librarianStats = null;

      console.log('[DEBUG] Active user role:', activeUser?.role);

      if (activeUser?.role === 'admin') {
        console.log('[DEBUG] Fetching admin stats...');
        adminStats = await DashboardService.getAdminStats();
        console.log('[DEBUG] Admin stats received:', adminStats);
      } else if (activeUser?.role === 'librarian') {
        console.log('[DEBUG] Fetching librarian stats...');
        librarianStats = await DashboardService.getLibrarianStats();
        console.log('[DEBUG] Librarian stats received:', librarianStats);
      }

      const mergedStats = {
        totalUsers: dashboardData.totalUsers,
        borrowedCount: dashboardData.activeRentals,
        totalBooks: dashboardData.totalBooks,
        ...adminStats,
        ...librarianStats
      };

      console.log('[DEBUG] Merged stats for state:', mergedStats);
      setStats(mergedStats);

      // Fetch unread notifications count
      if (activeUser) {
        const count = await NotificationService.getUnreadCount();
        setNotificationCount(count);
      }

    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Error loading data.");
    } finally {
      setIsLoadingData(false);
    }
  };
  // Track last filters to force reset page on change
  const lastFiltersRef = useRef({ category: '', status: 'all', search: '' });

  // ------ Filtreleme Fonksiyonu ------
  const handleSearch = async (pageIndex = currentPage, cat = selectedCategory) => {
    // 1. Force Sync: Check if filters changed
    const currentFilters = { category: cat, status: selectedStatus, search: searchTerm };
    const filtersChanged = JSON.stringify(lastFiltersRef.current) !== JSON.stringify(currentFilters);

    if (filtersChanged) {
      // Filtre değiştiyse SAYFAYI ZORLA SIFIRLA
      pageIndex = 0;
      setCurrentPage(0);
      lastFiltersRef.current = currentFilters;
    }

    setIsLoadingData(true);
    try {
      const results = await BookService.getFilteredBooks({
        keyword: searchTerm || undefined,
        category: cat || undefined,
        available: selectedStatus === 'available' ? true : (selectedStatus === 'borrowed' ? false : undefined),
        page: pageIndex,
        size: 12,
        sortBy: 'title',
        direction: 'asc'
      });

      setBooks(Array.isArray(results.content) ? results.content : []);
      setTotalPages(results.totalPages);
      // setCurrentPage(pageIndex); // Yukarıda zaten set ettik veya aynı kaldı
      if (!filtersChanged && pageIndex !== currentPage) {
        setCurrentPage(pageIndex);
      }

    } catch (error) {
      console.error("Search error:", error);
      toast.error("An error occurred while searching for books.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      // Scroll to top of catalog
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Kategori değişince sayfa 0'a dönecek
  const handleCategoryChange = (newCat: string) => {
    setSelectedCategory(newCat);
    // handleSearch(0, newCat); // REMOVED: useEffect will trigger search
  };

  useEffect(() => {
    // console.log("App.tsx Rendered. Path:", location.pathname);
  }, [location.pathname]);

  const handleBorrow = async (bookId: string) => {
    if (!bookId || bookId === "undefined") {
      console.error("ERROR: Book ID not found!", bookId);
      toast.error("Book ID is missing. Please refresh the page and try again.");
      return;
    }

    if (!currentUser) return;

    setIsLoadingData(true);
    try {
      console.log("Sending borrow request. Book ID:", bookId);
      await RentalService.rentBook(bookId);
      toast.success("Borrow request submitted successfully! Your book will be active after librarian approval.");

      setSelectedBook(null); // Modalı kapat
    } finally {
      setIsLoadingData(false);
    }
  };

  // Notification Polling (Heartbeat) - 30 seconds
  useEffect(() => {
    if (!currentUser) return;

    const pollNotifications = async () => {
      try {
        const count = await NotificationService.getUnreadCount();
        setNotificationCount(count);
      } catch (err) {
        console.warn("Notification polling failed:", err);
      }
    };

    // Run immediately on mount/user change
    pollNotifications();

    const interval = setInterval(pollNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);
  // --- AUTH OPERATIONS (Login / Register / Logout) ---

  const handleLogin = async (email: string, pass: string, role: 'user' | 'librarian' | 'admin' = 'user') => {
    try {
      console.log(`[DEBUG] Attempting login for ${email} with role: ${role}`);
      await AuthService.login({ email, password: pass }, role);
      const user = await UserService.getMe();
      setCurrentUser(user);
      setIsLoggedIn(true);

      // Fetch wallet transactions for regular users (fixes persistence issue)
      if (user.role === 'user') {
        try {
          const txList = await WalletService.getTransactions();
          setTransactions(txList);
        } catch (err) {
          console.error("Failed to fetch transaction history:", err);
        }
      }

      fetchLibraryData(user); // Pass user directly to avoid async state timing issue
      toast.success(`Welcome back, ${user.username}!`);
      return true;
    } catch (error: any) {
      console.error("[DEBUG] Login failed:", error);
      const errorMessage = error.response?.data?.error || "Login failed. Please check your credentials.";
      toast.error(errorMessage);
      return false;
    }
  };

  const handleRegister = async (name: string, email: string, pass: string) => {
    try {
      // 1. Backend'e kayıt isteği at (AuthService token'ı saklayacak)
      await AuthService.register({ name, email, password: pass, confirmPassword: pass });

      // 2. Kayıt başarılıysa kullanıcının detaylı profilini çek
      const user = await UserService.getMe();

      // 3. Update states (auto login)
      setCurrentUser(user);
      setIsLoggedIn(true);
      setShowRegister(false);
      fetchLibraryData(user); // Pass user for role-specific stats

      toast.success("Account created successfully! Welcome.");
    } catch (error: any) {
      console.error("Registration error:", error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Registration failed.";
      toast.error(errorMessage);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setBooks([]);
    toast.info("Logged out successfully.");
  };

  // Onaylama fonksiyonu
  const handleApprove = async (id: number) => {
    try {
      await RentalService.approveRequest(id);
      toast.success("Request approved!");
      const updated = await RentalService.getAllRequests();
      setRentalRequests(updated);
    } catch (error) {
      toast.error("Approval failed.");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await RentalService.rejectRequest(id);
      toast.success("Request rejected!");
      const updated = await RentalService.getAllRequests();
      setRentalRequests(updated);
    } catch (error) {
      toast.error("Rejection failed.");
    }
  };

  // --- BAKİYE GÜNCELLEME SİNYALİ ---
  const refreshUserBalance = async () => {
    if (currentUser?.role !== 'user') return;
    try {
      const updatedUser = await UserService.getMe();
      // FIX: Preserve existing state but update user data
      setCurrentUser(prev => prev ? ({ ...prev, ...updatedUser }) : updatedUser);
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

  const handleUpdateProfile = async (data: { fullName: string; phone: string; address: string; bio: string }) => {
    if (!currentUser) return;
    try {
      setIsLoadingData(true);
      const updated = await UserService.updateProfile({
        username: data.fullName,
        phone: data.phone,
        address: data.address,
        bio: data.bio
      });
      setCurrentUser(updated);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleAddBook = (newBook: any) => {
    console.log("Book to add:", newBook);
    // Buraya daha önce yazdığımız API isteği gelecek
  };

  const handleRemoveBook = async (id: string) => {
    // 1. Find book to get ISBN (if needed) or just use ID if backend accepts ID
    // The backend accept ID (Long) for deleteBookByIsbn (which we renamed to deleteBookById in backend)
    // But frontend service might expect ISBN string. Let's check BookService.ts
    // BookService.deleteBook takes 'isbn: string'.
    // However, looking at the backend change: public BookResponse deleteBookById(Long id)
    // So we should pass the ID.

    if (!id) return;

    try {
      // Optimistic update or wait for success? Let's wait for success.
      await BookService.deleteBook(id);

      // Update State
      setBooks(prev => prev.filter(b => b.id !== id));
      toast.success("Book deleted successfully.");
    } catch (error) {
      console.error("Book deletion error:", error);
      toast.error("Failed to delete book.");
    }
  };

  const handleEditBook = async (id: string, updatedBook: any) => {
    try {
      if (!updatedBook) return;

      // Call Backend
      // Note: Layout of updatedBook might match what BookManagement sends.
      // DTO conversion happens in BookManagement usually or here?
      // BookManagement sends {...newBook, ...} which matches AddBookRequest structure (approximately).
      // Let's assume the payload is correct for backend.

      const responseBook = await BookService.updateBook(id, updatedBook);

      // Update State
      setBooks(prev => prev.map(b => b.id === id ? responseBook : b));

      toast.success("Book updated successfully.");
    } catch (error) {
      console.error("Book update error:", error);
      toast.error("Failed to update book.");
    }
  };

  const handleAddFunds = async (amount: number) => {
    if (currentUser?.role !== 'user') return;

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    try {
      setIsLoadingData(true);
      // 1. Backend'e para yükle
      await WalletService.deposit(amount);

      // 2. Bakiyeyi güncelle (DB'den çekip state'e yaz)
      await refreshUserBalance();

      // 3. İşlem geçmişini güncelle (DB'den çekip state'e yaz)
      const updatedHistory = await WalletService.getTransactions();
      setTransactions(updatedHistory);

      toast.success(`$${amount} added successfully!`);
    } catch (error: any) {
      console.error("Add funds error:", error);
      toast.error("Failed to add funds.");
    } finally {
      setIsLoadingData(false);
    }
  };


  // --- BİLDİRİM İŞLEMLERİ ---
  const fetchNotificationsRaw = async () => {
    try {
      if (!isLoggedIn) return;
      const notes = await NotificationService.getAllNotifications();
      setNotifications(notes);

      const count = await NotificationService.getUnreadCount();
      setNotificationCount(count);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      // State güncelle (tek tek fetch yapmaya gerek yok)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setNotificationCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      // Optimistic update
      const notificationToDelete = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));

      // If it was unread, decrease count
      if (notificationToDelete && !notificationToDelete.read) {
        setNotificationCount(prev => Math.max(0, prev - 1));
      }

      await NotificationService.deleteNotification(id);
      toast.success("Notification deleted.");
    } catch (e) {
      console.error("Failed to delete notification", e);
      toast.error("An error occurred while deleting the notification.");
      // Revert changes if needed, but for now just showing error is enough combined with a refresh could be better but keeping it simple as per plan
      fetchNotificationsRaw(); // Re-fetch to sync state
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length === 0) return;

      await NotificationService.markAllAsRead(unreadIds);

      // Hepsini okundu yap
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setNotificationCount(0);
      toast.success("All notifications marked as read.");
    } catch (e) {
      toast.error("Operation failed.");
    }
  };

  // --- RENDER (Ekran Çizimi) ---
  return (
    <>
      {/* Bildirimlerin her zaman görünmesi için Toaster en dışta olmalı */}
      <Toaster position="top-center" richColors />

      {showRegister ? (
        <RegisterScreen
          onRegister={handleRegister}
          onBackToLogin={() => setShowRegister(false)}
        />
      ) : (!isLoggedIn || !currentUser) ? (
        <LoginScreen
          onLogin={handleLogin}
          onRegister={() => setShowRegister(true)}
        />
      ) : (
        /* ANA UYGULAMA PANELİ */
        <div className={`flex min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>

          <Sidebar
            userRole={currentUser.role}
            onLogout={handleLogout}
            notificationCount={notificationCount}
          />

          <div className="flex-1 overflow-x-hidden">
            <header className="bg-white dark:bg-gray-800 border-b p-6 flex justify-between items-center shadow-sm">
              <h1 className="text-2xl font-bold capitalize text-gray-800 dark:text-white">
                {location.pathname === '/' ? 'Library Dashboard' : location.pathname.substring(1).replace('-', ' ')}
              </h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  title="Toggle Theme"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <span className="text-sm font-semibold px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                  {currentUser.role === 'user'
                    ? `${currentUser.username} • $${currentUser.walletBalance.toFixed(2)}`
                    : currentUser.username}
                </span>
              </div>
            </header>

            <main className="p-6 w-full">
              {isLoadingData ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <Routes>
                  <Route path="/" element={
                    <>
                      {currentUser.role === 'admin' ? (
                        <AdminHomePage
                          {...stats}
                          borrowedBooks={stats.borrowedCount}
                          pendingRequests={stats.systemAlerts || 0}
                          onNavigateToUserManagement={() => navigate('/users')}
                          onNavigateToBooks={() => navigate('/catalog')}
                          onNavigateToFeedbacks={() => navigate('/feedback-management')}
                        />
                      ) : currentUser.role === 'librarian' ? (
                        <LibrarianHomePage
                          pendingBorrowRequests={stats.borrowRequests || 0}
                          pendingReturnRequests={stats.returnRequests || 0}
                          pendingDonations={stats.donationRequests || 0}
                          totalBooksManaged={stats.totalBooks || 0}
                          activeLoans={stats.activeLoans || 0}
                          overdueBooks={stats.overdueBooks || 0}
                          booksBorrowedToday={stats.booksBorrowedToday || 0}
                          booksReturnedToday={stats.booksReturnedToday || 0}
                          newDonationsToday={stats.newDonationsToday || 0}
                          onNavigateToBorrows={() => navigate('/requests')}
                          onNavigateToReturns={() => navigate('/requests')}
                          onNavigateToDonations={() => navigate('/requests')}
                        />
                      ) : (
                        <HomePage
                          books={books}
                          onSelectBook={setSelectedBook}
                          onNavigateToCatalog={() => navigate('/catalog')}
                          onNavigateToBlindDate={() => navigate('/blinddate')}
                          onCategorySelect={(category) => {
                            setSelectedCategory(category);
                            navigate('/catalog');
                          }}
                          totalUsers={stats.totalUsers}
                          booksBorrowedCount={stats.borrowedCount}
                          totalBooksCount={stats.totalBooks}
                          categories={categories}
                        />
                      )}
                    </>
                  } />

                  <Route path="/blinddate" element={
                    <BlindDate
                      onPurchase={() => toast.info("Purchase feature coming soon via Blind Date!")}
                      onBorrow={handleBorrow}
                    />
                  } />

                  <Route path="/catalog" element={
                    <BookCatalog
                      books={books}
                      categories={categories}
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      selectedCategory={selectedCategory}
                      onCategoryChange={handleCategoryChange}
                      selectedStatus={selectedStatus}
                      onStatusChange={setSelectedStatus}
                      onSelectBook={setSelectedBook}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  } />

                  <Route path="/wallet" element={
                    <Wallet
                      balance={currentUser.walletBalance}
                      currentUsername={currentUser.username}
                      transactions={transactions}
                      onAddFunds={handleAddFunds}
                    />
                  } />

                  <Route path="/book-management" element={
                    <BookManagement
                      books={books || []}
                      onAddBook={handleAddBook}
                      onRemoveBook={handleRemoveBook}
                      onEditBook={handleEditBook}
                    />
                  } />
                  
                  <Route path="/profile" element={
                    <AccountManagement
                      username={currentUser.username}
                      email={currentUser.email}
                      phone={currentUser.phone}
                      address={currentUser.address}
                      penaltyCount={currentUser.penaltyCount}
                      userRole={currentUser.role}
                      bio={currentUser.bio}
                      isBanned={currentUser.status === 'blocked'}
                      memberSince={currentUser.createdDate}
                      totalBorrowedCount={currentUser.totalBorrowedCount || 0}
                      activeLoanCount={currentUser.activeLoanCount || 0}
                      onUpdateProfile={handleUpdateProfile}
                    />
                  } />

                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/comments" element={<AdminPanel />} />
                  <Route path="/feedback-management" element={<FeedbackManagement />} />
                  <Route path="/history" element={<BookHistory />} />

                  <Route path="/donation" element={
                    <DonationForm
                      currentUsername={currentUser?.username}
                      onAddDonation={(donation) => {
                        console.log("Donation added:", donation);
                      }}
                    />
                  } />

                  <Route path="/feedback" element={
                    <FeedbackForm
                      currentUsername={currentUser?.username}
                      userRole={currentUser?.role}
                      onAddFeedback={(fb) => console.log(fb)}
                    />
                  } />

                  <Route path="/requests" element={
                    (currentUser?.role === 'librarian' || currentUser?.role === 'admin') ? (
                      <LibrarianPanel
                        borrowRequests={rentalRequests.map((req: any) => ({
                          id: String(req.id),
                          bookId: String(req.bookId || ''),
                          bookTitle: req.bookTitle,
                          username: req.userName,
                          requestDate: req.rentDate,
                          status: req.status
                        }))}
                        onApproveBorrow={(id) => handleApprove(Number(id))}
                        onRejectBorrow={(id) => handleReject(Number(id))}
                      />
                    ) : <Navigate to="/" />
                  } />

                  <Route path="/notifications" element={
                    <Notifications
                      notifications={notifications}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDeleteNotification}
                      onMarkAllAsRead={handleMarkAllAsRead}
                      currentUserRole={currentUser?.role}
                      currentUsername={currentUser?.username}
                    />
                  } />
                  
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              )}
            </main>
          </div>

          {/* Kitap Detay Modalı */}
          {selectedBook && (
            <BookDetailModal
              book={selectedBook}
              onClose={() => setSelectedBook(null)}
              onBorrow={() => handleBorrow(selectedBook.id)}
              userRole={currentUser.role}
              currentUsername={currentUser.username}
              hasActiveBorrow={false}
              currentUserBadge={currentUser.badge}
              onPurchase={async () => {
                await refreshUserBalance();
                await fetchLibraryData();
                // Re-fetch the same book to get updated ebookFilePath
                if (selectedBook) {
                  await handleSearch(); // This will refresh the books list
                }
              }}
              onAddComment={() => { }}
              onDeleteComment={() => { }}
              onEditBook={() => { }}
            />
          )}
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}