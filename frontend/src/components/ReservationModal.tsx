import { useState } from 'react';
import { Calendar, X } from 'lucide-react';

interface ReservationModalProps {
  bookTitle: string;
  onConfirm: (expectedReturnDate: string) => void;
  onClose: () => void;
}

export function ReservationModal({ bookTitle, onConfirm, onClose }: ReservationModalProps) {
  const [selectedDate, setSelectedDate] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate) {
      onConfirm(selectedDate);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900">Reserve Book</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Reserving: <span className="text-gray-900">{bookTitle}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="flex items-center gap-2 text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              <span>Expected Return Date</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
              max={maxDateStr}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-gray-500 mt-2">
              Select when you expect to return this book (within 30 days)
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              <strong>Important:</strong> Late returns will result in:
            </p>
            <ul className="list-disc list-inside text-yellow-700 mt-2 space-y-1">
              <li>$2 penalty per day from your wallet</li>
              <li>1 penalty point added to your account</li>
              <li>4 penalty points = Automatic ban</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Confirm Reservation
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
