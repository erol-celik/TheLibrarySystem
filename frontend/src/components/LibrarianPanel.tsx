import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Gift, BookOpen } from 'lucide-react';
import { DonationRequests } from './DonationRequests';

interface BorrowRequest {
  id: string;
  bookId: string;
  bookTitle: string;
  username: string;
  requestDate: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'RETURNED';
}

interface LibrarianPanelProps {
  borrowRequests: BorrowRequest[];
  onApproveBorrow: (id: string) => void;
  onRejectBorrow: (id: string) => void;
}

export function LibrarianPanel({
  borrowRequests,
  onApproveBorrow,
  onRejectBorrow,
}: LibrarianPanelProps) {
  const [activeTab, setActiveTab] = useState<'borrow' | 'donation'>('borrow');

  // Filter by Backend Status 'REQUESTED'
  const pendingBorrows = borrowRequests.filter(r => r.status === 'REQUESTED');

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">Borrow Requests</p>
              <p className="text-2xl text-gray-900 dark:text-white font-bold">{pendingBorrows.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <Gift className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">Donation Requests</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">View Pending Contributions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('borrow')}
            className={`flex-1 px-6 py-4 text-center transition-colors ${activeTab === 'borrow'
              ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold">Borrow Requests ({pendingBorrows.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('donation')}
            className={`flex-1 px-6 py-4 text-center transition-colors ${activeTab === 'donation'
              ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Gift className="w-5 h-5" />
              <span className="font-semibold">Donations</span>
            </div>
          </button>
        </div>

        <div className="p-6">
          {/* Borrow Requests */}
          {activeTab === 'borrow' && (
            <div className="space-y-4">
              {pendingBorrows.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                  <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium font-medium">No pending borrow requests</p>
                </div>
              ) : (
                pendingBorrows.map((request) => (
                  <div key={request.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 flex items-center justify-between border border-transparent hover:border-purple-100 dark:hover:border-purple-900/30 transition-all">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{request.bookTitle}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        <p className="text-gray-600 dark:text-gray-300">Requested by: <span className="font-semibold text-purple-600 dark:text-purple-400">{request.username}</span></p>
                        <p className="text-gray-500 dark:text-gray-400 italic">Date: {request.requestDate}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onApproveBorrow(request.id)}
                        className="bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition-all flex items-center gap-2 font-semibold shadow-sm active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => onRejectBorrow(request.id)}
                        className="bg-red-600 text-white px-5 py-2.5 rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 font-semibold shadow-sm active:scale-95"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Donation Requests - Using New Component */}
          {activeTab === 'donation' && (
            <DonationRequests />
          )}
        </div>
      </div>
    </div>
  );
}