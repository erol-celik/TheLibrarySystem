import { ImageWithFallback } from './figma/ImageWithFallback';
import { Book, User, Calendar } from 'lucide-react';

interface BookCardProps {
  book: {
    id: string;
    title: string;
    author: string;
    genres: string[];
    isbn: string;
    coverUrl: string;
    isBorrowed: boolean;
    borrowedBy?: string;
    dueDate?: string;
  };
  onBorrow: (id: string, borrowerName: string) => void;
  onReturn: (id: string) => void;
  onReserve?: (id: string) => void;
  userRole?: 'user' | 'librarian' | 'admin';
  currentUsername?: string;
}

export function BookCard({ book, onBorrow, onReturn, onReserve, userRole, currentUsername }: BookCardProps) {
  const handleBorrow = () => {
    // For regular users, automatically use their username
    if (userRole === 'user') {
      onBorrow(book.id, currentUsername || 'User');
    } else {
      // For librarian and admin, ask for borrower name
      const borrowerName = prompt('Enter borrower name:');
      if (borrowerName && borrowerName.trim()) {
        onBorrow(book.id, borrowerName.trim());
      }
    }
  };

  const canReturn = userRole === 'librarian' || userRole === 'admin' || 
                    (userRole === 'user' && book.borrowedBy === currentUsername);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all">
      <div className="relative h-64 bg-gray-200 dark:bg-gray-700">
        <ImageWithFallback
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover"
        />
        {book.isBorrowed && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>Borrowed</span>
          </div>
        )}
        {!book.isBorrowed && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full">
            Available
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start gap-2 mb-2">
          <Book className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-gray-900 dark:text-white mb-1">{book.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{book.author}</p>
          </div>
        </div>
        
        <div className="space-y-1 mb-4">
         {/* YENİ */}
<div className="flex items-start gap-2">
  <span className="text-gray-500 dark:text-gray-400 inline-block w-16">Genre:</span>
  <div className="flex flex-wrap gap-1">
{(book.genres || []).map((genre, index) => (
      <span 
        key={index} 
        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
      >
        {genre}
      </span>
    ))}
  </div>
</div>
          <p className="text-gray-500 dark:text-gray-400">
            <span className="inline-block w-16">ISBN:</span>
            <span className="text-gray-700 dark:text-gray-300">{book.isbn}</span>
          </p>
          {book.isBorrowed && book.borrowedBy && (
            <>
              <p className="text-gray-500 dark:text-gray-400">
                <span className="inline-block w-16">Borrower:</span>
                <span className="text-gray-700 dark:text-gray-300">{book.borrowedBy}</span>
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                <span className="inline-block w-16">Due:</span>
                <span className="text-gray-700 dark:text-gray-300">{book.dueDate}</span>
              </p>
            </>
          )}
        </div>
        
        {book.isBorrowed ? (
          canReturn ? (
            <button
              onClick={() => onReturn(book.id)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Return Book
            </button>
          ) : (
            <div className="space-y-2">
              <button
                disabled
                className="w-full bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed"
              >
                Borrowed by {book.borrowedBy}
              </button>
              {userRole === 'user' && onReserve && (
                <button
                  onClick={() => onReserve(book.id)}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reserve Book</span>
                </button>
              )}
            </div>
          )
        ) : (
          <button
            onClick={handleBorrow}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            Borrow Book
          </button>
        )}
      </div>
    </div>
  );
}