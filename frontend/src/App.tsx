import { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'sonner';

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


export default function App() {
  // --- STATE (Hafıza Alanları) ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
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
              console.error("Cüzdan geçmişi çekilemedi:", err);
            }
          }

          // 3. Fetch library data with user role context
          fetchLibraryData(user);

        } catch (error) {
          console.error("Oturum yenilenemedi:", error);
          AuthService.logout();
        }
      }
    };
    initApp();
  }, []);
  useEffect(() => {
    console.log("Mevcut Kullanıcı Rolü:", currentUser ? currentUser.role : "Guest");
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
    if (activeTab === 'requests' && (currentUser?.role === 'librarian' || currentUser?.role === 'admin')) {
      RentalService.getAllRequests().then(setRentalRequests);
    }
    if (activeTab === 'notifications') {
      fetchNotificationsRaw();
    }
  }, [activeTab, currentUser]);

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
      console.error("Arama hatası:", error);
      toast.error("Kitaplar aranırken bir hata oluştu.");
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
    // console.log("App.tsx Rendered. ActiveTab:", activeTab);
  }, [activeTab]);

  const handleBorrow = async (bookId: string) => {
    if (!bookId || bookId === "undefined") {
      console.error("HATA: Kitap ID'si bulunamadı!", bookId);
      toast.error("Kitap ID bilgisi eksik. Lütfen sayfayı yenileyip tekrar deneyin.");
      return;
    }

    if (!currentUser) return;

    setIsLoadingData(true);
    try {
      console.log("Kiralama isteği gönderiliyor. Kitap ID:", bookId);
      await RentalService.rentBook(bookId);
      toast.success("Kiralama talebiniz oluşturuldu! Kütüphaneci onayından sonra kitabınız aktifleşecek.");

      await fetchLibraryData();
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
    toast.info("Oturum kapatıldı.");
  };

  // Onaylama fonksiyonu
  const handleApprove = async (id: number) => {
    try {
      await RentalService.approveRequest(id);
      toast.success("Talep onaylandı!");
      const updated = await RentalService.getAllRequests();
      setRentalRequests(updated);
      fetchLibraryData();
    } catch (error) {
      toast.error("Onaylama başarısız.");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await RentalService.rejectRequest(id);
      toast.success("Talep reddedildi!");
      const updated = await RentalService.getAllRequests();
      setRentalRequests(updated);
      fetchLibraryData();
    } catch (error) {
      toast.error("Reddetme başarısız.");
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
      console.error("Bakiye güncellenirken hata:", error);
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
      toast.success("Profil başarıyla güncellendi!");
    } catch (error: any) {
      console.error("Profil güncelleme hatası:", error);
      toast.error("Profil güncellenemedi.");
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
      toast.success("Kitap başarıyla silindi.");
    } catch (error) {
      console.error("Kitap silme hatası:", error);
      toast.error("Kitap silinemedi.");
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

      toast.success("Kitap başarıyla güncellendi.");

      // Refresh Stats
      await fetchLibraryData();
    } catch (error) {
      console.error("Kitap güncelleme hatası:", error);
      toast.error("Kitap güncellenemedi.");
    }
  };

  const handleAddFunds = async (amount: number) => {
    if (currentUser?.role !== 'user') return;

    if (isNaN(amount) || amount <= 0) {
      toast.error("Lütfen geçerli bir miktar girin.");
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

      toast.success(`$${amount} başarıyla yüklendi!`);
    } catch (error: any) {
      console.error("Para yükleme hatası:", error);
      toast.error("Yükleme başarısız oldu.");
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
      console.error("Bildirimler çekilemedi", e);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      // State güncelle (tek tek fetch yapmaya gerek yok)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setNotificationCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error("Okundu işaretlenemedi", e);
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
      toast.success("Bildirim silindi.");
    } catch (e) {
      console.error("Bildirim silinemedi", e);
      toast.error("Bildirim silinirken bir hata oluştu.");
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
      toast.success("Tüm bildirimler okundu olarak işaretlendi.");
    } catch (e) {
      toast.error("İşlem başarısız.");
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
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            notificationCount={notificationCount}
          />

          <div className="flex-1 overflow-x-hidden">
            <header className="bg-white dark:bg-gray-800 border-b p-6 flex justify-between items-center shadow-sm">
              <h1 className="text-2xl font-bold capitalize text-gray-800 dark:text-white">
                {activeTab === 'home' ? 'Kütüphane Paneli' : activeTab}
              </h1>
              <div className="flex items-center gap-4">
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
                <>
                  {activeTab === 'home' && (
                    <>
                      {currentUser.role === 'admin' ? (
                        <AdminHomePage
                          {...stats}
                          borrowedBooks={stats.borrowedCount}
                          pendingRequests={stats.systemAlerts || 0}
                          onNavigateToUserManagement={() => setActiveTab('users')}
                          onNavigateToBooks={() => setActiveTab('catalog')}
                          onNavigateToFeedbacks={() => setActiveTab('feedbackManagement')}
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
                          onNavigateToBorrows={() => setActiveTab('requests')}
                          onNavigateToReturns={() => setActiveTab('requests')}
                          onNavigateToDonations={() => setActiveTab('requests')}
                        />
                      ) : (
                        <HomePage
                          books={books}
                          onSelectBook={setSelectedBook}
                          onNavigateToCatalog={() => setActiveTab('catalog')}
                          onNavigateToBlindDate={() => setActiveTab('blinddate')}
                          onCategorySelect={(category) => {
                            setSelectedCategory(category);
                            setActiveTab('catalog');
                          }}
                          totalUsers={stats.totalUsers}
                          booksBorrowedCount={stats.borrowedCount}
                          totalBooksCount={stats.totalBooks}
                          categories={categories}
                        />
                      )}
                    </>
                  )}

                  {activeTab === 'blinddate' && (
                    <BlindDate
                      onPurchase={() => toast.info("Purchase feature coming soon via Blind Date!")}
                      onBorrow={handleBorrow}
                    />
                  )}

                  {activeTab === 'catalog' && (
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
                  )}

                  {activeTab === 'wallet' && (
                    <Wallet
                      balance={currentUser.walletBalance}
                      currentUsername={currentUser.username}
                      transactions={transactions}
                      onAddFunds={handleAddFunds}
                    />
                  )}

                  {activeTab === 'bookManagement' && (
                    <BookManagement
                      books={books || []}
                      onAddBook={handleAddBook}
                      onRemoveBook={handleRemoveBook}
                      onEditBook={handleEditBook}
                    />
                  )}
                  {activeTab === 'account' && (
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
                  )}

                  {activeTab === 'users' && (
                    <UserManagement />
                  )}

                  {/* Comments Management Panel */}
                  {activeTab === 'admin' && (
                    <AdminPanel />
                  )}

                  {activeTab === 'feedbackManagement' && (
                    <FeedbackManagement />
                  )}

                  {activeTab === 'history' && (
                    <BookHistory />
                  )}

                  {activeTab === 'donation' && (
                    <DonationForm
                      currentUsername={currentUser?.username}
                      onAddDonation={(donation) => {
                        console.log("Donation added:", donation);
                        // Optional: Add to a local list or trigger a refetch if needed, 
                        // but DonationForm now handles its own history fetching.
                      }}
                    />
                  )}

                  {activeTab === 'feedback' && (
                    <FeedbackForm
                      currentUsername={currentUser?.username}
                      userRole={currentUser?.role}
                      onAddFeedback={(fb) => console.log(fb)}
                    />
                  )}

                  {activeTab === 'requests' && (
                    currentUser?.role === 'librarian' || currentUser?.role === 'admin')
                    && (
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
                    )}

                  {activeTab === 'notifications' && (
                    <Notifications
                      notifications={notifications}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDeleteNotification}
                      onMarkAllAsRead={handleMarkAllAsRead}
                      currentUserRole={currentUser?.role}
                      currentUsername={currentUser?.username}
                    />
                  )}
                </>
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