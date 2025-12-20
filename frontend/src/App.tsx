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

// Servisler ve Tipler
import { AuthService } from './services/AuthService';
import { BookService } from './services/BookService';
import { UserService } from './services/UserService';
import { Book, UserAccount } from './types';
import { DashboardService } from "./services/DashboardService";
import { RentalService } from './services/RentalService';
import { WalletService } from "./services/WalletService";


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
  const [stats, setStats] = useState({ totalUsers: 0, borrowedCount: 0, totalBooks: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]); // Initialize Transaction State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [rentalRequests, setRentalRequests] = useState([]);
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

          // 2. Cüzdan geçmişini çek
          try {
            const txList = await WalletService.getTransactions();
            setTransactions(txList);
          } catch (err) {
            console.error("Cüzdan geçmişi çekilemedi:", err);
          }

          // 3. Kütüphane verilerini çek
          fetchLibraryData();

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
    if (activeTab === 'requests' && (currentUser?.role === 'admin' || currentUser?.role === 'librarian')) {
      RentalService.getAllRequests().then(setRentalRequests);
    }
  }, [activeTab]);

  // --- VERİ ÇEKME FONKSİYONU ---
  const fetchLibraryData = async () => {
    setIsLoadingData(true);
    try {
      const [catsData, dashboardData] = await Promise.all([
        BookService.getAllCategories(),
        // Dashboard verisini çekmek için direkt api çağrısı veya DashboardService kullanın
        DashboardService.getPublicStats()
      ]);

      setCategories(catsData);
      console.log('DEBUG: Categories fetched:', catsData);

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
        size: 15,
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
    } catch (error: any) {
      // Backend'den gelen hata mesajını (Örn: Banlı kullanıcı) göster
      const msg = error.response?.data || "Kiralama talebi gönderilemedi.";
      toast.error(msg);
    } finally {
      setIsLoadingData(false);
    }
  };
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
      await AuthService.register({ name, email, password: pass, confirmPassword: pass });

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

  // Onaylama fonksiyonu
  const handleApprove = async (id: number) => {

    try {
      await RentalService.approveRequest(id);
      toast.success("Talep onaylandı, stok güncellendi!");
      // Listeyi yenile
      const updated = await RentalService.getAllRequests();
      setRentalRequests(updated);
      fetchLibraryData(); // Dashboard sayılarını güncelle
    } catch (error) {
      toast.error("Onaylama başarısız.");
    }
  };

  // --- BAKİYE GÜNCELLEME SİNYALİ ---
  const refreshUserBalance = async () => {
    try {
      const updatedUser = await UserService.getMe();
      // FIX: Preserve existing state but update user data
      setCurrentUser(prev => prev ? ({ ...prev, ...updatedUser }) : updatedUser);
    } catch (error) {
      console.error("Bakiye güncellenirken hata:", error);
    }
  };

  const handleAddFunds = async (amount: number) => {

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

                  {activeTab === 'account' && (
                    <AccountManagement
                      username={currentUser.username}
                      email={currentUser.email}
                      phone={currentUser.phone}
                      address={currentUser.address}
                      penaltyCount={currentUser.penaltyCount}
                      userRole={currentUser.role}
                      onUpdateProfile={() => toast.info("Profil güncelleme özelliği yakında.")}
                    />
                  )}

                  {activeTab === 'requests' && (
                    currentUser?.role?.toUpperCase() === 'ROLE_LIBRARIAN')
                    && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Bekleyen Kiralama Talepleri</h2>
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b">
                              <th className="py-2">Kullanıcı</th>
                              <th>Kitap</th>
                              <th>Tarih</th>
                              <th>İşlem</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rentalRequests.map((req: any) => (
                              <tr key={req.id} className="border-b">
                                <td className="py-3">{req.userName}</td>
                                <td>{req.bookTitle}</td>
                                <td>{req.rentDate}</td>
                                <td>
                                  <button
                                    onClick={() => handleApprove(req.id)}
                                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                                  >
                                    Onayla
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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
              onPurchase={() => toast.info("Satın alma işlemi başlatılıyor...")}
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