import { useState, useEffect } from 'react';
import { Shuffle, Heart, BookOpen, Package, DollarSign, Tag } from 'lucide-react';
import { toast } from 'sonner';

import { BookService } from '../services/BookService';
import { Book, BlindDateResponse } from '../types';

interface BlindDateProps {
  books?: Book[]; // Optional now, or removed if not used
  onPurchase: (bookId: string) => void;
  onBorrow?: (bookId: string) => void;
}

export function BlindDate({ onPurchase, onBorrow }: BlindDateProps) {
  const [blindDateData, setBlindDateData] = useState<BlindDateResponse | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await BookService.getAllTags();
        setAllTags(tags);
      } catch (error) {
        console.error("Failed to fetch tags for blind date:", error);
      }
    };
    fetchTags();
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  const shuffleBook = async () => {
    setIsLoading(true);
    setBlindDateData(null);
    setIsRevealed(false);

    try {
      // Pick a random tag from selected tags or all tags if none selected
      let tagToUse = '';
      if (selectedTags.length > 0) {
        const randomIndex = Math.floor(Math.random() * selectedTags.length);
        tagToUse = selectedTags[randomIndex];
      } else if (allTags.length > 0) {
        const randomIndex = Math.floor(Math.random() * allTags.length);
        tagToUse = allTags[randomIndex];
      } else {
        toast.error('No tags available to search.');
        setIsLoading(false);
        return;
      }

      const data = await BookService.getBlindDateBook(tagToUse);
      setBlindDateData(data);
    } catch (error) {
      console.error("Blind date error:", error);
      toast.error('Failed to find a book. Please try again or select different tags.');
    } finally {
      setIsLoading(false);
    }
  };

  const revealBook = () => {
    setIsRevealed(true);
  };

  const handlePurchase = () => {
    if (blindDateData?.realBook) {
      onPurchase(blindDateData.realBook.id);
    }
  };

  const handleBorrow = () => {
    if (blindDateData?.realBook && onBorrow) {
      onBorrow(blindDateData.realBook.id);
    }
  };

  const handleNotYourType = () => {
    shuffleBook();
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
              className={`px-4 py-2 rounded-xl border-2 transition-all transform hover:scale-105 ${selectedTags.includes(tag)
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
          disabled={isLoading}
          className="flex-1 bg-purple-600 text-white py-4 px-6 rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Shuffle className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Finding Match...' : 'Shuffle & Find Your Match'}</span>
        </button>
        {blindDateData && !isRevealed && (
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
      {blindDateData && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          {!isRevealed ? (
            <div className="text-center py-12">
              <div className="w-64 h-80 mx-auto bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center mb-6 animate-pulse">
                <Package className="w-24 h-24 text-white" />
              </div>
              <h3 className="text-3xl text-gray-900 dark:text-white mb-2 font-serif">{blindDateData.maskedTitle}</h3>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 italic">by {blindDateData.maskedAuthor}</p>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl max-w-2xl mx-auto mb-8">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  &quot;{blindDateData.description}&quot;
                </p>
              </div>

              {/* Vibe Tags */}
              {blindDateData.vibeTags && blindDateData.vibeTags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {blindDateData.vibeTags.map(tag => (
                    <span key={tag} className="px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-sm font-medium flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-gray-500 dark:text-gray-500 animate-bounce">
                Click reveal to unwrap your literary surprise!
              </p>
            </div>
          ) : (
            <div>
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <img
                    src={blindDateData.realBook.coverUrl}
                    alt={blindDateData.realBook.title}
                    className="w-full h-96 object-cover rounded-xl shadow-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-gray-900 dark:text-white mb-2">{blindDateData.realBook.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">by {blindDateData.realBook.author}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {blindDateData.realBook.categoryName.map((category, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{blindDateData.realBook.description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                        <BookOpen className="w-4 h-4" />
                        <span>Pages</span>
                      </div>
                      <p className="text-gray-900 dark:text-white">{blindDateData.realBook.pageCount} pages</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Published</p>
                      <p className="text-gray-900 dark:text-white">{blindDateData.realBook.publicationYear}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">Price</p>
                        <p className="text-gray-900 dark:text-white">${blindDateData.realBook.price.toFixed(2)}</p>
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

      {!blindDateData && (
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