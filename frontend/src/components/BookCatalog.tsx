import { Search, Library, Star, Filter, SlidersHorizontal, Grid3x3, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Book } from '../types';

interface BookCatalogProps {
  books: Book[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onSelectBook: (book: Book) => void;
  // Pagination Props
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function BookCatalog({
  books,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  selectedStatus,
  onStatusChange,
  onSelectBook,
  currentPage,
  totalPages,
  onPageChange
}: BookCatalogProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('title');

  // Calculate average rating for a book
  const getAverageRating = (book: Book) => {
    if (!book.comments || book.comments.length === 0) return 0;
    const sum = book.comments.reduce((acc, comment) => acc + comment.rating, 0);
    return sum / book.comments.length;
  };

  // Sort books
  const sortedBooks = [...books].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating':
        return getAverageRating(b) - getAverageRating(a);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Enhanced Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title, author, or ISBN..."
              className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                <Filter className="w-4 h-4" />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white transition-all"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                <Library className="w-4 h-4" />
                Availability
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white transition-all"
              >
                <option value="all">All Books</option>
                <option value="available">Available Only</option>
                <option value="borrowed">Borrowed Only</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                <SlidersHorizontal className="w-4 h-4" />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white transition-all"
              >
                <option value="title">Title (A-Z)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                <LayoutGrid className="w-4 h-4" />
                View
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${viewMode === 'grid'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${viewMode === 'list'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Active Filters:</span>
            {searchTerm && (
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded-full text-sm flex items-center gap-2">
                Search: "{searchTerm}"
                <button onClick={() => onSearchChange('')} className="hover:text-purple-900 dark:hover:text-purple-100">×</button>
              </span>
            )}
            {selectedCategory && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-sm flex items-center gap-2">
                Category: {selectedCategory}
                <button onClick={() => onCategoryChange('')} className="hover:text-blue-900 dark:hover:text-blue-100">×</button>
              </span>
            )}
            {selectedStatus !== 'all' && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full text-sm flex items-center gap-2">
                Status: {selectedStatus}
                <button onClick={() => onStatusChange('all')} className="hover:text-green-900 dark:hover:text-green-100">×</button>
              </span>
            )}
            {(searchTerm || selectedCategory || selectedStatus !== 'all') && (
              <button
                onClick={() => {
                  onSearchChange('');
                  onCategoryChange('');
                  onStatusChange('all');
                }}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 dark:text-gray-400">
          Showing <span className="text-purple-600 dark:text-purple-400">{sortedBooks.length}</span> book{sortedBooks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Books Display */}
      {sortedBooks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-16 text-center transition-colors">
          <Library className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
          <h3 className="text-2xl text-gray-900 dark:text-white mb-2">No Books Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your filters or search term</p>
          <button
            onClick={() => {
              onSearchChange('');
              onCategoryChange('');
              onStatusChange('all');
            }}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedBooks.map((book) => {
            const avgRating = getAverageRating(book);
            return (
              <div
                key={book.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer group transform hover:scale-105 duration-300"
                onClick={() => onSelectBook(book)}
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Price Tag */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full shadow-lg">
                    ${book.price.toFixed(2)}
                  </div>

                  {/* Status Badge */}
                  {book.isBorrowed ? (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      Borrowed
                    </div>
                  ) : (
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      Available
                    </div>
                  )}

                  {/* Rating */}
                  {avgRating > 0 && (
                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-gray-900">{avgRating.toFixed(1)}</span>
                      <span className="text-gray-500 text-sm">({book.comments.length})</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-gray-900 dark:text-white mb-2 line-clamp-1">{book.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">by {book.author}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {book.categoryName.slice(0, 2).map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded-full text-xs"
                      >
                        {cat}
                      </span>
                    ))}
                    {book.categoryName.length > 2 && (
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                        +{book.categoryName.length - 2}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <span>{book.pageCount} pages</span>
                    <span>{book.publicationYear}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {sortedBooks.map((book) => {
            const avgRating = getAverageRating(book);
            return (
              <div
                key={book.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer group"
                onClick={() => onSelectBook(book)}
              >
                <div className="flex gap-6 p-6">
                  {/* Book Cover */}
                  <div className="relative w-32 h-48 flex-shrink-0 overflow-hidden rounded-xl">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {book.isBorrowed ? (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                    ) : (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl text-gray-900 dark:text-white mb-1">{book.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400">by {book.author}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <span className="text-2xl text-purple-600 dark:text-purple-400">${book.price.toFixed(2)}</span>
                        {avgRating > 0 && (
                          <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-gray-900 dark:text-white">{avgRating.toFixed(1)}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">({book.comments.length})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {book.categoryName.map((cat, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded-full text-xs"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Library className="w-4 h-4" />
                        {book.pageCount} pages
                      </span>
                      <span>Published {book.publicationYear}</span>
                      <span className={`px-3 py-1 rounded-full text-xs ${book.isBorrowed
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        }`}>
                        {book.isBorrowed ? 'Borrowed' : 'Available'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      <div className="flex items-center justify-center gap-4 mt-8 pb-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || totalPages === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentPage === 0 || totalPages === 0
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 shadow-sm'
            }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
            Page <span className="font-bold text-purple-600 dark:text-purple-400">{totalPages === 0 ? 0 : currentPage + 1}</span> of <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
          </span>
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || totalPages === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentPage >= totalPages - 1 || totalPages === 0
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 shadow-sm'
            }`}
        >
          <span>Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}