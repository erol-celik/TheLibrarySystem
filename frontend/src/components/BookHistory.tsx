import { useState, useEffect } from 'react';
import { BookOpen, Calendar, CheckCircle, Clock, AlertCircle, XCircle, RotateCcw } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { RentalService } from '../services/RentalService';

interface RentalHistoryItem {
  id: number;
  bookTitle: string;
  bookAuthor: string;
  bookImage: string;
  rentDate: string;
  dueDate?: string;
  returnDate: string | null;
  status: 'REQUESTED' | 'APPROVED' | 'RENTED' | 'RETURNED' | 'LATE' | 'REJECTED';
  penaltyFee: number;
}

export function BookHistory() {
  const [history, setHistory] = useState<RentalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await RentalService.getUserRentals();
      setHistory(data);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (rentalId: number) => {
    try {
      await RentalService.returnBook(rentalId);
      toast.success("Book returned successfully!");
      loadHistory();
    } catch (error) {
      toast.error("Failed to return book.");
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RETURNED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
            <CheckCircle className="w-4 h-4" />
            Returned
          </span>
        );
      case 'RENTED':
      case 'APPROVED':
      case 'LATE':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
            <Clock className="w-4 h-4" />
            Active
          </span>
        );
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
            <Clock className="w-4 h-4" />
            Requested
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
            <XCircle className="w-4 h-4" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading history...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-gray-900 dark:text-white mb-6">Your Book History</h3>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">No book history yet.</p>
            <p className="text-sm text-purple-600 cursor-pointer hover:underline">
              Explore our library to rent your first book!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <ImageWithFallback
                  src={item.bookImage}
                  alt={item.bookTitle}
                  className="w-16 h-24 object-cover rounded"
                />

                <div className="flex-1">
                  <h4 className="text-gray-900 dark:text-white mb-1">{item.bookTitle}</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">{item.bookAuthor || 'Unknown Author'}</p>

                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    {/* Hide rent date for REQUESTED status */}
                    {item.status !== 'REQUESTED' && (
                      <span>Rent Date: {item.rentDate}</span>
                    )}
                    {item.status === 'REQUESTED' && (
                      <span className="italic">Pending approval</span>
                    )}
                    {/* Show due date for active rentals */}
                    {(item.status === 'APPROVED' || item.status === 'RENTED' || item.status === 'LATE') && item.dueDate && (
                      <>
                        <span className="mx-1">|</span>
                        <span className="text-orange-600 dark:text-orange-400 font-medium">Due: {item.dueDate}</span>
                      </>
                    )}
                    {item.returnDate && (
                      <>
                        <span className="mx-1">-</span>
                        <span>Returned: {item.returnDate}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                    </div>

                    {(item.status === 'APPROVED' || item.status === 'RENTED' || item.status === 'LATE') && (
                      <button
                        onClick={() => handleReturn(item.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Return Book
                      </button>
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