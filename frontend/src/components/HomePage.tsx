import { useState } from 'react';
import { Star, Gift, Sparkles, BookOpen, Zap, Heart, PartyPopper, Search, ChevronRight, Award, Users, TrendingUp, CheckCircle, ArrowRight, Quote, Filter, ShoppingCart, Library } from 'lucide-react';

interface HomePageProps {
  books?: any[];
  onSelectBook?: (book: any) => void;
  onNavigateToCatalog?: () => void;
  onNavigateToBlindDate?: () => void;
  onCategorySelect?: (category: string) => void;
  totalUsers?: number;
  booksBorrowedCount?: number;
  totalBooksCount?: number;
  categories?: string[]; // Received from backend
}

export function HomePage({
  books = [],
  totalBooksCount = 0,
  onSelectBook,
  onNavigateToCatalog,
  onNavigateToBlindDate,
  onCategorySelect,
  totalUsers = 0,
  booksBorrowedCount = 0,
  categories = [] // Default to empty if not provided
}: HomePageProps) {
  const [showBlindDate, setShowBlindDate] = useState(false);
  const [revealStep, setRevealStep] = useState(0);
  const [randomBook, setRandomBook] = useState<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Helper function to find real book data from props
  const findRealBook = (id: string) => {
    return books.find(b => b.id === id);
  };

  // Helper function to safely select book
  const handleSelectBook = (bookId: string) => {
    const realBook = findRealBook(bookId);
    if (realBook && onSelectBook) {
      onSelectBook(realBook);
    }
  };

  // Calculate average rating for each book
  const calculateAverageRating = (book: any) => {
    if (!book.comments || book.comments.length === 0) return 0;
    const sum = book.comments.reduce((acc: number, comment: any) => acc + comment.rating, 0);
    return sum / book.comments.length;
  };

  // Get top rated books dynamically from real data
  const topRatedBooks = books
    .map(book => ({
      ...book,
      averageRating: calculateAverageRating(book),
      reviewCount: book.comments?.length || 0
    }))
    .filter(book => book.averageRating > 0) // Only books with ratings
    .sort((a, b) => b.averageRating - a.averageRating) // Sort by rating descending
    .slice(0, 5) // Take top 5
    .map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      rating: parseFloat(book.averageRating.toFixed(1)),
      coverUrl: book.coverUrl,
      price: book.price,
      genre: book.categoryName[0] || 'General',
      pages: book.pageCount,
      reviewCount: book.reviewCount
    }));

  // Get new arrivals - books with no or few comments (recently added)
  const newArrivals = books
    .map(book => ({
      ...book,
      commentCount: book.comments?.length || 0
    }))
    .filter(book => book.commentCount <= 2) // Books with 2 or fewer comments are considered "new"
    .slice(-5) // Take last 5 books from the filtered list
    .reverse() // Reverse to show newest first
    .map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      rating: calculateAverageRating(book) || 0,
      coverUrl: book.coverUrl,
      price: book.price,
      genre: book.categoryName[0] || 'General',
      pages: book.pageCount,
      isNew: true
    }));

  // Visual assets map for categories (Name -> Assets)
  // This maps backend category names to icons/images.
  // Keys should match Backend/Database English names.
  const categoryAssets: Record<string, { icon: any, color: string, image: string }> = {
    'Fantasy': {
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      image: 'https://images.unsplash.com/photo-1614544048536-0d28caf77f41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg'
    },
    'Science Fiction': {
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      image: 'https://images.unsplash.com/photo-1635698054698-1eaf72c5a894?crop=entropy&cs=tinysrgb&fit=max&fm=jpg'
    },
    'Mystery': {
      icon: Search,
      color: 'from-gray-700 to-gray-900',
      image: 'https://images.unsplash.com/photo-1698954634383-eba274a1b1c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg'
    },
    'Romance': {
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      image: 'https://images.unsplash.com/photo-1711185901354-73cb6b666c32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg'
    },
    'Non-Fiction': {
      icon: BookOpen,
      color: 'from-green-500 to-emerald-500',
      image: 'https://images.unsplash.com/photo-1658842042844-eeb5ad17b7d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg'
    },
    'Biography': {
      icon: Award,
      color: 'from-orange-500 to-amber-500',
      image: 'https://images.unsplash.com/photo-1582739010387-0b49ea2adaf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg'
    },
    'History': {
      icon: Library, // Fallback or specific
      color: 'from-yellow-600 to-orange-700',
      image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg'
    }
  };

  // Helper for default assets
  const defaultAssets = {
    icon: BookOpen,
    color: 'from-indigo-500 to-purple-500',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?crop=entropy&cs=tinysrgb&fit=max&fm=jpg'
  };

  // Process categories with dynamic counts and assets
  const displayedCategories = categories.map(catName => {
    const assets = categoryAssets[catName] || defaultAssets;
    // Calculate count dynamically from all books
    const count = books.filter(b => b.categoryName && b.categoryName.includes(catName)).length;
    return {
      name: catName,
      count: count,
      ...assets
    };
  });

  // Testimonials
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Avid Reader',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      text: 'BookHub has completely transformed my reading experience. The blind date feature introduced me to books I would never have discovered otherwise!',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Book Enthusiast',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      text: 'The best digital library I\'ve ever used. The collection is vast, and the borrowing process is seamless. Highly recommend!',
      rating: 5,
    },
    {
      name: 'Emma Williams',
      role: 'Student',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
      text: 'As a student, BookHub has been invaluable. Free borrowing, great selection, and the community features are amazing!',
      rating: 5,
    },
  ];

  const handleBlindDate = () => {
    setIsAnimating(true);
    setRevealStep(0);
    setShowBlindDate(true);
    const randomIndex = Math.floor(Math.random() * topRatedBooks.length);
    setRandomBook(topRatedBooks[randomIndex]);

    setTimeout(() => setRevealStep(1), 500);
    setTimeout(() => setRevealStep(2), 1500);
    setTimeout(() => setRevealStep(3), 2500);
    setTimeout(() => {
      setRevealStep(4);
      setIsAnimating(false);
    }, 3500);
  };

  const handleCloseBlindDate = () => {
    setShowBlindDate(false);
    setRevealStep(0);
  };

  const scrollToTopRated = () => {
    const element = document.getElementById('top-rated-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1703236079592-4d2f222e8d2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsaWJyYXJ5JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY1NDE2OTY1fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Library"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>

        <div className="relative z-10 px-8 md:px-16 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/20">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <p className="text-white text-sm">✨ Your Digital Library Awaits</p>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl text-white mb-6">
              Discover Your Next
              <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Favorite Book
              </span>
            </h1>

            <p className="text-xl text-purple-100 mb-10 leading-relaxed">
              Access thousands of books, join a vibrant reading community, and explore new worlds through literature. All free with your membership.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button
                onClick={onNavigateToCatalog}
                className="bg-white text-purple-900 px-8 py-4 rounded-xl hover:bg-purple-50 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-2 group"
              >
                <BookOpen className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Browse Catalog
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onNavigateToBlindDate || handleBlindDate}
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl hover:bg-white/20 transition-all border border-white/20 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Try Blind Date
              </button>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-40 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <p className="text-purple-100">Total Books</p>
              <p className="text-3xl">{totalBooksCount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-green-100">Active Members</p>
              <p className="text-3xl">{totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <p className="text-blue-100">Books Borrowed</p>
              <p className="text-3xl">{booksBorrowedCount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>


      {/* Featured Categories */}
      <div className="space-y-6">
        <div>
          <h2 className="text-4xl text-gray-900 dark:text-white">Browse by Category</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">Explore our diverse collection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayedCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.name}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden cursor-pointer transform hover:scale-105"
                onClick={() => onCategorySelect && onCategorySelect(category.name)}
              >
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90`}></div>

                <div className="relative z-10 p-8">
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl w-fit mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl text-white mb-2">{category.name}</h3>
                  <p className="text-white/80 text-lg mb-6">{category.count} books available</p>
                  <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all border border-white/30 flex items-center gap-2 group-hover:gap-3">
                    Explore
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}</div>
      </div>

      {/* Featured New Arrivals */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h2 className="text-4xl text-gray-900 dark:text-white">New Arrivals</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Fresh additions to our collection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {newArrivals.map((book) => (
            <div
              key={book.id}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden cursor-pointer transform hover:scale-105"
              onClick={() => handleSelectBook(book.id)}
            >
              <div className="relative h-80 overflow-hidden">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                {book.isNew && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    New
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full w-fit mb-2">
                    <span className="text-purple-600 dark:text-purple-400 text-sm">{book.genre}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span>{book.rating}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-700">
                <h3 className="text-gray-900 dark:text-white mb-1 line-clamp-1">{book.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{book.author}</p>
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg flex items-center justify-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Rated Books Grid */}
      {topRatedBooks.length > 0 && (
        <div className="space-y-6" id="top-rated-section">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-4 rounded-2xl shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl text-gray-900 dark:text-white">Top Rated Books</h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">Our community favorites</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...topRatedBooks].sort((a, b) => b.rating - a.rating).map((book) => (
              <div
                key={book.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden cursor-pointer transform hover:scale-105"
                onClick={() => handleSelectBook(book.id)}
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 rounded-full shadow-lg">
                    ${book.price.toFixed(2)}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full w-fit mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-gray-900 text-sm">{book.rating}</span>
                        {book.reviewCount > 0 && <span className="text-gray-500 text-xs">({book.reviewCount})</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-700">
                  <h3 className="text-gray-900 dark:text-white line-clamp-1 mb-1">{book.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-1">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blind Date Section */}
      <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 rounded-3xl p-8 md:p-12 shadow-xl border-2 border-pink-200 dark:border-gray-600">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-4 rounded-2xl shadow-lg">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-4xl text-gray-900 dark:text-white flex items-center gap-2">
              Blind Date with a Book
              <Heart className="w-7 h-7 text-pink-500 animate-pulse" />
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Let fate choose your next adventure!</p>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-2 border-pink-200 dark:border-gray-600 mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-pulse" />
                <h3 className="text-2xl text-gray-900 dark:text-white">How it works</h3>
                <Sparkles className="w-8 h-8 text-pink-600 dark:text-pink-400 animate-pulse" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                Experience the thrill of discovery! Choose your favorite tags, and let our mystery book selector
                find your perfect match. Your literary soulmate is waiting... ✨
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white transform hover:scale-105 transition-all">
                <Gift className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Choose Tags</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white transform hover:scale-105 transition-all">
                <Heart className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Mystery Match</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white transform hover:scale-105 transition-all">
                <Sparkles className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Reveal Book</p>
              </div>
            </div>
          </div>

          <div className="relative inline-block">
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-3xl blur-xl opacity-75 animate-pulse"></div>
            <button
              onClick={onNavigateToBlindDate}
              className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white px-12 py-6 rounded-2xl hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all transform hover:scale-110 shadow-2xl flex items-center gap-4 group text-2xl"
            >
              <Sparkles className="w-8 h-8 group-hover:rotate-180 transition-transform duration-500" />
              🎭 Try Blind Date with a Book 🎭
              <PartyPopper className="w-8 h-8 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>

          <p className="text-gray-500 dark:text-gray-400 mt-6 text-sm italic">
            "The best books come as a surprise" - Anonymous Book Lover
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 md:p-12 shadow-xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl text-gray-900 dark:text-white mb-4">How BookHub Works</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Get started in just a few simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center group">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <Search className="w-10 h-10 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
              <div className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">1</span>
              </div>
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Browse & Search</h3>
              <p className="text-gray-600 dark:text-gray-300">Explore our vast collection of books across all genres</p>
            </div>
          </div>

          <div className="text-center group">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
              <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">2</span>
              </div>
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Borrow or Buy</h3>
              <p className="text-gray-600 dark:text-gray-300">Choose to borrow for free or purchase to keep forever</p>
            </div>
          </div>

          <div className="text-center group">
            <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
              <div className="bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">3</span>
              </div>
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Read & Enjoy</h3>
              <p className="text-gray-600 dark:text-gray-300">Immerse yourself in amazing stories and knowledge</p>
            </div>
          </div>

          <div className="text-center group">
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <Star className="w-10 h-10 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
              <div className="bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">4</span>
              </div>
              <h3 className="text-xl text-gray-900 dark:text-white mb-3">Rate & Review</h3>
              <p className="text-gray-600 dark:text-gray-300">Share your thoughts and earn badges for activity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-4xl text-gray-900 dark:text-white mb-4">What Our Readers Say</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Join thousands of satisfied book lovers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-purple-100 dark:border-gray-600"
            >
              <Quote className="w-12 h-12 text-purple-300 dark:text-purple-400 mb-6" />

              <div className="flex items-center gap-2 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 leading-relaxed">"{testimonial.text}"</p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full border-2 border-purple-200 dark:border-purple-400"
                />
                <div>
                  <p className="text-gray-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your Reading Stats & Achievements */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1674476803343-2a2c7678d367?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWFkaW5nJTIwYm9va3MlMjBjYWZlfGVufDF8fHx8MTc2NTQ2ODk4N3ww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Reading"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-pink-900/90"></div>

        <div className="relative z-10 px-8 md:px-16 py-12 md:py-16">
          <div className="text-center mb-10">

            <h2 className="text-4xl md:text-5xl text-white mb-4">
              Your Reading Journey Continues
            </h2>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Every book is a new adventure. Keep exploring, keep learning, and keep growing with BookHub
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20 hover:bg-white/15 transition-all transform hover:scale-105">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-xl">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-blue-100">Available Books</p>
                  <p className="text-3xl text-white">{books.length}</p>
                </div>
              </div>
              <p className="text-white/80">
                Thousands of books waiting for you to discover
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20 hover:bg-white/15 transition-all transform hover:scale-105">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-br from-pink-400 to-pink-600 p-4 rounded-xl">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-pink-100">Community</p>
                  <p className="text-3xl text-white">{totalUsers}</p>
                </div>
              </div>
              <p className="text-white/80">
                Join fellow book lovers sharing their passion
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20 hover:bg-white/15 transition-all transform hover:scale-105">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-green-100">Total Reads</p>
                  <p className="text-3xl text-white">{booksBorrowedCount}</p>
                </div>
              </div>
              <p className="text-white/80">
                Books borrowed by our amazing community
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20">
            <h3 className="text-2xl text-white mb-6 text-center">What Would You Like To Do Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={onNavigateToCatalog}
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg group"
              >
                <BookOpen className="w-8 h-8 mx-auto mb-3 group-hover:rotate-12 transition-transform" />
                <p className="mb-1">Browse Books</p>
                <p className="text-blue-100 text-sm">Explore catalog</p>
              </button>

              <button
                onClick={onNavigateToBlindDate}
                className="bg-gradient-to-br from-pink-500 to-purple-600 text-white p-6 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg group"
              >
                <Gift className="w-8 h-8 mx-auto mb-3 group-hover:rotate-12 transition-transform" />
                <p className="mb-1">Blind Date</p>
                <p className="text-pink-100 text-sm">Random pick</p>
              </button>

              <button
                onClick={scrollToTopRated}
                className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white p-6 rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg group"
              >
                <Star className="w-8 h-8 mx-auto mb-3 group-hover:rotate-12 transition-transform" />
                <p className="mb-1">Top Rated</p>
                <p className="text-yellow-100 text-sm">Best books</p>
              </button>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-white/90 text-lg italic mb-4">
              "A reader lives a thousand lives before he dies. The man who never reads lives only one."
            </p>
            <p className="text-white/70">— George R.R. Martin</p>
          </div>
        </div>

        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-pink-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}