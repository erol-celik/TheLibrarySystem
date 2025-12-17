import { useState } from 'react';
import { Shuffle, Heart, BookOpen, Package, DollarSign, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface Book {
  id: string;
  title: string;
  author: string;
  categoryName: string[];
  tags: string[];
  description: string;
  price: number;
  pageCount: number;
  publicationYear: number;
  coverUrl: string;
  bookType: string;
  publisher: string;
}

interface BlindDateProps {
  books: Book[];
  onPurchase: (bookId: string) => void;
  onBorrow?: (bookId: string) => void;
}

export function BlindDate({ books, onPurchase, onBorrow }: BlindDateProps) {
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags from books
  const allTags = Array.from(new Set(books.flatMap(book => book.tags || [])));

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setCurrentBook(null);
    setIsRevealed(false);
  };

  const shuffleBook = () => {
    // Filter books based on selected tags
    let availableBooks = books;
    if (selectedTags.length > 0) {
      availableBooks = books.filter(book => 
        book.tags && book.tags.some(tag => selectedTags.includes(tag))
      );
    }
    
    // Exclude current book
    availableBooks = availableBooks.filter(b => b.id !== currentBook?.id);
    
    if (availableBooks.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableBooks.length);
      setCurrentBook(availableBooks[randomIndex]);
      setIsRevealed(false);
    } else {
      toast.error('No books available with selected tags. Please adjust your tag selection.');
    }
  };

  const revealBook = () => {
    setIsRevealed(true);
  };

  const handlePurchase = () => {
    if (currentBook) {
      onPurchase(currentBook.id);
    }
  };

  const handleBorrow = () => {
    if (currentBook && onBorrow) {
      onBorrow(currentBook.id);
    }
  };

  const handleNotYourType = () => {
    // Filter books based on selected tags
    let availableBooks = books;
    if (selectedTags.length > 0) {
      availableBooks = books.filter(book => 
        book.tags && book.tags.some(tag => selectedTags.includes(tag))
      );
    }
    
    // Exclude current book
    availableBooks = availableBooks.filter(b => b.id !== currentBook?.id);
    
    if (availableBooks.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableBooks.length);
      setCurrentBook(availableBooks[randomIndex]);
      setIsRevealed(true); // Automatically reveal the new book
      toast.info('Finding you a new match...');
    } else {
      toast.error('No books available with selected tags. Please adjust your tag selection.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-white">Blind Date with a Book</h2>
            <p className="text-pink-100">
              Let us surprise you with a perfect match!
            </p>
          </div>
        </div>
        <p className="text-white/90">
          Select your preferred tags and click shuffle to discover a mystery book picked just for you. Will it be love at first read?
        </p>
      </div>

      {/* Tag Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Tag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-gray-900 dark:text-white">Select Your Preferences</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Choose one or more tags to filter books. Leave empty for random selection from all books.
        </p>
        <div className="flex flex-wrap gap-3">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 rounded-xl border-2 transition-all transform hover:scale-105 ${
                selectedTags.includes(tag)
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-purple-600 shadow-lg'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        {selectedTags.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Selected tags:</span>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
            <button
              onClick={() => setSelectedTags([])}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm underline"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={shuffleBook}
          className="flex-1 bg-purple-600 text-white py-4 px-6 rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
        >
          <Shuffle className="w-6 h-6" />
          <span>Shuffle & Find Your Match</span>
        </button>
        {currentBook && !isRevealed && (
          <button
            onClick={revealBook}
            className="flex-1 bg-pink-600 text-white py-4 px-6 rounded-xl hover:bg-pink-700 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
          >
            <Package className="w-6 h-6" />
            <span>Reveal Your Book</span>
          </button>
        )}
      </div>

      {/* Book Display */}
      {currentBook && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          {!isRevealed ? (
            <div className="text-center py-12">
              <div className="w-64 h-80 mx-auto bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center mb-6 animate-pulse">
                <Package className="w-24 h-24 text-white" />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-2">Mystery Book Awaits!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your perfect match is wrapped and ready. Click reveal to unwrap your literary surprise!
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Pages</p>
                  <p className="text-purple-600 dark:text-purple-400">{currentBook.pageCount}</p>
                </div>
                <div className="bg-pink-50 dark:bg-pink-900/30 rounded-lg p-4">
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Year</p>
                  <p className="text-pink-600 dark:text-pink-400">{currentBook.publicationYear}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Price</p>
                  <p className="text-blue-600 dark:text-blue-400">${currentBook.price}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-4">
                <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Type</p>
                  <p className="text-green-600 dark:text-green-400">{currentBook.bookType}</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4">
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Categories</p>
                  <p className="text-orange-600 dark:text-orange-400">{currentBook.categoryName.length}</p>
                </div>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 max-w-md mx-auto mt-4">
                <p className="text-gray-600 dark:text-gray-400 mb-1">Publisher</p>
                <p className="text-indigo-600 dark:text-indigo-400">{currentBook.publisher}</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <img
                    src={currentBook.coverUrl}
                    alt={currentBook.title}
                    className="w-full h-96 object-cover rounded-xl shadow-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-gray-900 dark:text-white mb-2">{currentBook.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">by {currentBook.author}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {currentBook.categoryName.map((category, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{currentBook.description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                        <BookOpen className="w-4 h-4" />
                        <span>Pages</span>
                      </div>
                      <p className="text-gray-900 dark:text-white">{currentBook.pageCount} pages</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Published</p>
                      <p className="text-gray-900 dark:text-white">{currentBook.publicationYear}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">Price</p>
                        <p className="text-gray-900 dark:text-white">${currentBook.price.toFixed(2)}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <button
                      onClick={handlePurchase}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                    >
                      Purchase This Book
                    </button>
                  </div>

                  {onBorrow && (
                    <button
                      onClick={handleBorrow}
                      className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Shuffle className="w-5 h-5" />
                      <span>Borrow This Book</span>
                    </button>
                  )}

                  <button
                    onClick={handleNotYourType}
                    className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Shuffle className="w-5 h-5" />
                    <span>Not Your Type? Try Another</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!currentBook && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
          <Heart className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-gray-900 dark:text-white mb-2">Ready for Romance?</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Click &quot;Shuffle & Find Your Match&quot; to begin your blind date adventure!
          </p>
        </div>
      )}
    </div>
  );
}