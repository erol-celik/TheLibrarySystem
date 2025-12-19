import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';

// Componentler
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { Sidebar } from './components/Sidebar';
import { BookCatalog } from './components/BookCatalog';
import { BookDetailModal } from './components/BookDetailModal';
import { AccountManagement } from './components/AccountManagement';
import { Wallet } from './components/Wallet';
import { HomePage } from './components/HomePage';

// Servisler ve Tipler
import { AuthService } from './services/AuthService';
import { BookService } from './services/BookService';
import { UserService } from './services/UserService';
import { Book, UserAccount } from './types';
import {DashboardService} from "./services/DashboardService";

export default function App() {
  // --- STATE (Hafıza Alanları) ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Veri State'leri
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, borrowedCount: 0,totalBooks: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  // Seçili Kitap (Modal için)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // --- INIT (Uygulama İlk Açıldığında Token Kontrolü) ---
  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = await UserService.getMe();
          setCurrentUser(user);
          setIsLoggedIn(true);
          fetchLibraryData();
        } catch (error) {
          console.error("Oturum yenilenemedi:", error);
          AuthService.logout();
        }
      }
    };
    initApp();
  }, []);

  // --- VERİ ÇEKME FONKSİYONU ---
  const fetchLibraryData = async () => {
    setIsLoadingData(true);
    try {
      const [booksData, catsData, dashboardData] = await Promise.all([
        BookService.getAllBooks(),
        BookService.getAllCategories(),
        // Dashboard verisini çekmek için direkt api çağrısı veya DashboardService kullanın
        DashboardService.getPublicStats()
      ]);

      setBooks(booksData);
      setCategories(catsData);

      setStats({
        totalUsers: dashboardData.totalUsers,
        borrowedCount: dashboardData.activeRentals,
        totalBooks: dashboardData.totalBooks
      });

    } catch (error) {
      console.error("Veriler çekilemedi:", error);
    } finally {
      setIsLoadingData(false);
    }
  };
// ------ Filtreleme Fonksiyonu ------
  const handleSearch = async () => {
    // 1. Eğer tüm filtreler boşsa, orijinal getAllBooks metoduna dön
    if (!searchTerm && !selectedCategory && selectedStatus === 'all') {
      setIsLoadingData(true);
      try {
        const originalBooks = await BookService.getAllBooks();
        setBooks(originalBooks);
      } finally {
        setIsLoadingData(false);
      }
      return;
    }

    // 2. Filtreler doluysa aramayı yap
    setIsLoadingData(true);
    try {
      const results = await BookService.getFilteredBooks({
        keyword: searchTerm || undefined,
        category: selectedCategory || undefined,
        available: selectedStatus === 'available' ? true : (selectedStatus === 'borrowed' ? false : undefined),
        page: 0,
        size: 15, // Catalog için daha geniş bir liste
        sortBy: 'title',
        direction: 'asc'
      });
      setBooks(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error("Arama hatası:", error);
      toast.error("Kitaplar aranırken bir hata oluştu.");
    } finally {
      setIsLoadingData(false);
    }
  };
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Sadece katalog sekmesindeyken aramayı tetikle
      if (activeTab === 'catalog') {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategory, selectedStatus]);

  // --- AUTH İŞLEMLERİ (Giriş / Kayıt / Çıkış) ---

  const handleLogin = async (email: string, pass: string) => {
    try {
      await AuthService.login({ email, password: pass });
      const user = await UserService.getMe();
      setCurrentUser(user);
      setIsLoggedIn(true);
      fetchLibraryData();
      toast.success(`Tekrar hoş geldin, ${user.username}!`);
      return true;
    } catch (error: any) {
      toast.error("Giriş başarısız. Bilgilerinizi kontrol edin.");
      return false;
    }
  };

  const handleRegister = async (name: string, email: string, pass: string) => {
    try {
      // 1. Backend'e kayıt isteği at (AuthService token'ı saklayacak)
      await AuthService.register({ name, email, password: pass });

      // 2. Kayıt başarılıysa kullanıcının detaylı profilini çek
      const user = await UserService.getMe();

      // 3. Stateleri güncelle (Otomatik giriş yap)
      setCurrentUser(user);
      setIsLoggedIn(true);
      setShowRegister(false);
      fetchLibraryData(); // Kitapları getir

      toast.success("Hesabınız başarıyla oluşturuldu! Hoş geldiniz.");
    } catch (error: any) {
      console.error("Kayıt hatası:", error.response?.data);
      // Hem .message hem de .error alanlarını kontrol ediyoruz
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Kayıt sırasında bir hata oluştu.";
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
                  notificationCount={0}
                  totalRevenue={0}
              />

              <div className="flex-1 overflow-x-hidden">
                <header className="bg-white dark:bg-gray-800 border-b p-6 flex justify-between items-center shadow-sm">
                  <h1 className="text-2xl font-bold capitalize text-gray-800 dark:text-white">
                    {activeTab === 'home' ? 'Kütüphane Paneli' : activeTab}
                  </h1>
                  <div className="flex items-center gap-4">
                 <span className="text-sm font-semibold px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                   {currentUser.username} • ${currentUser.walletBalance.toFixed(2)}
                 </span>
                  </div>
                </header>

                <main className="p-6">
                  {isLoadingData ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                      </div>
                  ) : (
                      <>
                        {activeTab === 'home' && (
                            <HomePage
                                books={books}
                                onSelectBook={setSelectedBook}
                                onNavigateToCatalog={() => setActiveTab('catalog')}
                                onNavigateToBlindDate={() => setActiveTab('blinddate')}
                                onCategorySelect={() => setActiveTab('catalog')}
                                totalUsers={stats.totalUsers}
                                booksBorrowedCount={stats.borrowedCount}
                                totalBooksCount={stats.totalBooks}
                            />
                        )}

                        {activeTab === 'catalog' && (
                            <BookCatalog
                                books={books}
                                categories={categories}
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                selectedCategory={selectedCategory}
                                onCategoryChange={setSelectedCategory}
                                selectedStatus={selectedStatus}
                                onStatusChange={setSelectedStatus}
                                onSelectBook={setSelectedBook}
                            />
                        )}

                        {activeTab === 'wallet' && (
                            <Wallet
                                balance={currentUser.walletBalance}
                                currentUsername={currentUser.username}
                                transactions={[]}
                                onAddFunds={() => toast.info("Ödeme sistemi yakında eklenecek.")}
                            />
                        )}

                        {activeTab === 'account' && (
                            <AccountManagement
                                username={currentUser.username}
                                email={currentUser.email}
                                role={currentUser.role}
                                phone={currentUser.phone}
                                address={currentUser.address}
                                penaltyCount={currentUser.penaltyCount}
                                userRole={currentUser.role}
                                onUpdateProfile={() => toast.info("Profil güncelleme özelliği yakında.")}
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
                      userRole={currentUser.role}
                      currentUsername={currentUser.username}
                      hasActiveBorrow={false}
                      currentUserBadge={currentUser.badge}
                      onBorrow={() => toast.info("Kiralama işlemi başlatılıyor...")}
                      onPurchase={() => toast.info("Satın alma işlemi başlatılıyor...")}
                      onAddComment={() => {}}
                      onDeleteComment={() => {}}
                      onEditBook={() => {}}
                  />
              )}
            </div>
        )}
      </>
  );
}