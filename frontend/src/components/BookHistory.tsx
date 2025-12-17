import { BookOpen, Calendar, CheckCircle, ShoppingBag, Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BookHistoryItem {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  coverUrl: string;
  borrowDate?: string;
  returnDate?: string;
  purchaseDate?: string;
  status: 'returned' | 'purchased' | 'active';
  price?: number;
  username?: string;
}

interface BookHistoryProps {
  history: BookHistoryItem[];
  currentUsername?: string;
}

export function BookHistory({ history, currentUsername }: BookHistoryProps) {
  // Filter history by current user
  const filteredHistory = currentUsername 
    ? history.filter(item => item.username === currentUsername)
    : history;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-gray-900 dark:text-white mb-6">Your Book History</h3>
        
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No book history yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <ImageWithFallback
                  src={item.coverUrl}
                  alt={item.bookTitle}
                  className="w-16 h-24 object-cover rounded"
                />
                
                <div className="flex-1">
                  <h4 className="text-gray-900 dark:text-white mb-1">{item.bookTitle}</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">{item.bookAuthor}</p>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    {item.status === 'purchased' && item.purchaseDate && (
                      <span>Purchased: {item.purchaseDate}</span>
                    )}
                    {item.status === 'returned' && item.borrowDate && item.returnDate && (
                      <span>Borrowed: {item.borrowDate} - Returned: {item.returnDate}</span>
                    )}
                    {item.status === 'active' && item.borrowDate && (
                      <span>Borrowed: {item.borrowDate} (Active)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === 'returned' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                        <CheckCircle className="w-4 h-4" />
                        Returned
                      </span>
                    )}
                    {item.status === 'purchased' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
                        <ShoppingBag className="w-4 h-4" />
                        Purchased ${item.price?.toFixed(2)}
                      </span>
                    )}
                    {item.status === 'active' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                        <Clock className="w-4 h-4" />
                        Currently Borrowed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}