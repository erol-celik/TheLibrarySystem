import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { toast } from 'sonner';

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

export default function App() {
  // --- STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Veri State'leri (Artık boş dizilerle başlıyor, Backend dolduracak)
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Seçili Kitap (Modal için)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // --- INIT (Uygulama Açılışı) ---
  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Token varsa kullanıcının en güncel halini Backend'den çek
          const user = await UserService.getMe();
          setCurrentUser(user);
          setIsLoggedIn(true);
          
          // Kullanıcı giriş yaptıysa kitapları da çekelim
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
      const [booksData, catsData] = await Promise.all([
        BookService.getAllBooks(),
        BookService.getAllCategories()
      ]);
      setBooks(booksData);
      setCategories(catsData);
    } catch (error) {
      console.error("Kütüphane verileri çekilemedi", error);
      toast.error("Sunucuya bağlanılamadı.");
    } finally {
      setIsLoadingData(false);
    }
  };

  // --- AUTH İŞLEMLERİ ---
  const handleLogin = async (email: string, pass: string) => {
    try {
      await AuthService.login({ email, password: pass });
      // Login başarılı olunca profili çek
      const user = await UserService.getMe();
      setCurrentUser(user);
      setIsLoggedIn(true);
      fetchLibraryData(); // Kitapları yükle
      return true;
    } catch (error: any) {
      toast.error("Giriş başarısız. Bilgileri kontrol et.");
      return false;
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setBooks([]); // Güvenlik için veriyi temizle
  };

  // --- RENDER ---

  if (showRegister) {
    return (
      <RegisterScreen 
        onRegister={async (name, email, pass) => {
           try {
             await AuthService.register({ name, email, password: pass });
             toast.success("Kayıt başarılı! Giriş yapabilirsin.");
             setShowRegister(false);
           } catch(e) { toast.error("Kayıt başarısız."); }
        }} 
        onBackToLogin={() => setShowRegister(false)} 
      />
    );
  }

  if (!isLoggedIn || !currentUser) {
    return (
      <LoginScreen 
        onLogin={handleLogin} 
        onRegister={() => setShowRegister(true)} 
      />
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className={`flex min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        
        {/* Sidebar */}
        <Sidebar 
          userRole={currentUser.role}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          notificationCount={0}
          totalRevenue={0}
        />

        {/* Ana İçerik */}
        <div className="flex-1 overflow-x-hidden">
          <header className="bg-white dark:bg-gray-800 border-b p-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold capitalize text-gray-800 dark:text-white">
              {activeTab}
            </h1>
            <div className="flex items-center gap-4">
               <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                 {currentUser.username} (${currentUser.walletBalance.toFixed(2)})
               </span>
            </div>
          </header>

          <main className="p-6">
            {isLoadingData ? (
              <div className="text-center p-10">Yükleniyor...</div>
            ) : (
              <>
                {activeTab === 'home' && (
                  <HomePage 
                    books={books} 
                    onSelectBook={setSelectedBook}
                    onNavigateToCatalog={() => setActiveTab('catalog')} 
                    onNavigateToBlindDate={() => setActiveTab('blinddate')} 
                    onCategorySelect={() => setActiveTab('catalog')} 
                    totalUsers={0} 
                    booksBorrowedCount={0} 
                  />
                )}

                {activeTab === 'catalog' && (
                  <BookCatalog 
                    books={books} 
                    categories={categories}
                    searchTerm="" 
                    onSearchChange={() => {}} 
                    selectedCategory="" 
                    onCategoryChange={() => {}} 
                    selectedStatus="all" 
                    onStatusChange={() => {}} 
                    onSelectBook={setSelectedBook} 
                  />
                )}

                {activeTab === 'wallet' && (
                  <Wallet 
                    balance={currentUser.walletBalance} 
                    currentUsername={currentUser.username}
                    transactions={[]} // Transaction servisi yazılınca burası dolacak
                    onAddFunds={() => toast.info("Para yükleme servisi henüz bağlanmadı.")} 
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
                     userRole={currentUser.role} // Prop ismi farklı olabilir, kontrol et
                     onUpdateProfile={() => toast.info("Güncelleme servisi eklenecek.")}
                   />
                )}
              </>
            )}
          </main>
        </div>

        {/* Modal */}
        {selectedBook && (
          <BookDetailModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            userRole={currentUser.role}
            currentUsername={currentUser.username}
            hasActiveBorrow={false} // RentalService'den gelecek
            currentUserBadge={currentUser.badge}
            onBorrow={() => toast.info("Kiralama servisi eklenecek")}
            onPurchase={() => toast.info("Satın alma servisi eklenecek")}
            onAddComment={() => {}}
            onDeleteComment={() => {}}
            onEditBook={() => {}}
          />
        )}
      </div>
    </>
  );
}