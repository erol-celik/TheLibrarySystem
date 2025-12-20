import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Gift, BookOpen, Edit, DollarSign, Tag } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  bookType: string;
  categoryName: string[];
  description: string;
  isbnNo: string;
  pageCount: number;
  price: number;
  publicationYear: number;
  publisher: string;
  coverUrl: string;
}

interface BorrowRequest {
  id: string;
  bookId: string;
  bookTitle: string;
  username: string;
  requestDate: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'RETURNED'; // Aligned with Backend Enums
}

interface DonationRequest {
  id: string;
  username: string;
  bookTitle: string;
  author: string;
  isbn: string;
  pageCount: number;
  publisher: string;
  publicationYear: number;
  bookType: string;
  categoryName: string[];
  description: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Feedback {
  id: string;
  username: string;
  message: string;
  date: string;
  status: 'new' | 'reviewed';
}

interface LibrarianPanelProps {
  books: Book[];
  onAddBook: (book: Omit<Book, 'id' | 'isBorrowed'>) => void;
  onRemoveBook: (id: string) => void;
  borrowRequests: BorrowRequest[];
  donationRequests: DonationRequest[];
  feedbacks: Feedback[];
  onApproveBorrow: (id: string) => void;
  onRejectBorrow: (id: string) => void;
  onApproveDonation: (id: string, formData: {
    bookType: string;
    categoryName: string;
    tags: string;
    description: string;
    isbnNo: string;
    pageCount: string;
    price: string;
    publicationYear: string;
    publisher: string;
    coverUrl: string;
    ebookFilePath: string;
    stock: string;
  }) => void;
  onRejectDonation: (id: string) => void;
}

export function LibrarianPanel({
  books,
  onAddBook,
  onRemoveBook,
  borrowRequests,
  donationRequests,
  feedbacks,
  onApproveBorrow,
  onRejectBorrow,
  onApproveDonation,
  onRejectDonation,
}: LibrarianPanelProps) {
  const [activeTab, setActiveTab] = useState<'borrow' | 'donation'>('borrow');
  const [editingDonation, setEditingDonation] = useState<string | null>(null);
  const [donationFormData, setDonationFormData] = useState({
    bookType: 'Hardcover',
    categoryName: '',
    tags: '',
    description: '',
    isbnNo: '',
    pageCount: '',
    price: '',
    publicationYear: '',
    publisher: '',
    coverUrl: '',
    ebookFilePath: '',
    stock: '1',
  });

  // Filter by Backend Status 'REQUESTED'
  const pendingBorrows = borrowRequests.filter(r => r.status === 'REQUESTED');
  const pendingDonations = donationRequests.filter(r => r.status === 'pending');

  const handleEditDonation = (donationId: string) => {
    const donation = donationRequests.find(d => d.id === donationId);
    if (donation) {
      setEditingDonation(donationId);
      setDonationFormData({
        bookType: donation.bookType || 'Hardcover',
        categoryName: donation.categoryName.join(', '),
        tags: '',
        description: donation.description || '',
        isbnNo: donation.isbn || '',
        pageCount: donation.pageCount ? donation.pageCount.toString() : '',
        price: '0',
        publicationYear: donation.publicationYear ? donation.publicationYear.toString() : '',
        publisher: donation.publisher || '',
        coverUrl: '',
        ebookFilePath: '',
        stock: '1',
      });
    }
  };

  const handleSaveAndApprove = (donationId: string) => {
    const tags = donationFormData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
    onApproveDonation(donationId, donationFormData);
    setEditingDonation(null);
    setDonationFormData({
      bookType: 'Hardcover',
      categoryName: '',
      tags: '',
      description: '',
      isbnNo: '',
      pageCount: '',
      price: '',
      publicationYear: '',
      publisher: '',
      coverUrl: '',
      ebookFilePath: '',
      stock: '1',
    });
  };

  return (
    <div className="space-y-6" >
      {/* Stats Cards */}
      < div className="grid grid-cols-1 md:grid-cols-2 gap-6" >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">Borrow Requests</p>
              <p className="text-2xl text-gray-900 dark:text-white">{pendingBorrows.length}</p>
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
              <p className="text-2xl text-gray-900 dark:text-white">{pendingDonations.length}</p>
            </div>
          </div>
        </div>
      </div >

      {/* Tabs */}
      < div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden" >
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
              <span>Borrow Requests ({pendingBorrows.length})</span>
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
              <span>Donations ({pendingDonations.length})</span>
            </div>
          </button>
        </div>

        <div className="p-6">
          {/* Borrow Requests */}
          {activeTab === 'borrow' && (
            <div className="space-y-4">
              {pendingBorrows.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p>No pending borrow requests</p>
                </div>
              ) : (
                pendingBorrows.map((request) => (
                  <div key={request.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-gray-900 dark:text-white mb-1">{request.bookTitle}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-1">Requested by: {request.username}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Date: {request.requestDate}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onApproveBorrow(request.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => onRejectBorrow(request.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
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

          {/* Donation Requests */}
          {activeTab === 'donation' && (
            <div className="space-y-4">
              {pendingDonations.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p>No pending donation requests</p>
                </div>
              ) : (
                pendingDonations.map((request) => (
                  <div key={request.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-gray-900 dark:text-white mb-1">{request.bookTitle}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-1">by {request.author}</p>
                        <p className="text-gray-600 dark:text-gray-300 mb-1">Donated by: {request.username}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Date: {request.requestDate}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-300">ISBN: </span>
                        <span className="text-gray-900 dark:text-white">{request.isbn}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300">Pages: </span>
                        <span className="text-gray-900 dark:text-white">{request.pageCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300">Publisher: </span>
                        <span className="text-gray-900 dark:text-white">{request.publisher}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300">Year: </span>
                        <span className="text-gray-900 dark:text-white">{request.publicationYear}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{request.description}</p>

                    {editingDonation === request.id ? (
                      <div className="space-y-4 mb-4">
                        <div className="bg-white dark:bg-gray-600 p-4 rounded-lg space-y-3">
                          <h4 className="text-gray-900 dark:text-white mb-4">Complete Book Details</h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Book Type */}
                            <div>
                              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                Book Type *
                              </label>
                              <select
                                value={donationFormData.bookType}
                                onChange={(e) => setDonationFormData({ ...donationFormData, bookType: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                              >
                                <option value="Hardcover">Hardcover</option>
                                <option value="Paperback">Paperback</option>
                                <option value="E-Book">E-Book</option>
                                <option value="Audiobook">Audiobook</option>
                              </select>
                            </div>

                            {/* Publisher */}
                            <div>
                              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                Publisher *
                              </label>
                              <input
                                type="text"
                                value={donationFormData.publisher}
                                onChange={(e) => setDonationFormData({ ...donationFormData, publisher: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Publisher name"
                                required
                              />
                            </div>

                            {/* ISBN */}
                            <div>
                              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                ISBN Number *
                              </label>
                              <input
                                type="text"
                                value={donationFormData.isbnNo}
                                onChange={(e) => setDonationFormData({ ...donationFormData, isbnNo: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="978-0-00-000000-0"
                                required
                              />
                            </div>

                            {/* Page Count */}
                            <div>
                              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                Page Count *
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={donationFormData.pageCount}
                                onChange={(e) => setDonationFormData({ ...donationFormData, pageCount: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="300"
                                required
                              />
                            </div>

                            {/* Publication Year */}
                            <div>
                              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                Publication Year *
                              </label>
                              <input
                                type="number"
                                min="1000"
                                max={new Date().getFullYear() + 1}
                                value={donationFormData.publicationYear}
                                onChange={(e) => setDonationFormData({ ...donationFormData, publicationYear: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="2024"
                                required
                              />
                            </div>

                            {/* Price */}
                            <div>
                              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                Price (USD) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={donationFormData.price}
                                onChange={(e) => setDonationFormData({ ...donationFormData, price: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="0.00"
                                required
                              />
                            </div>

                            {/* Stock */}
                            <div>
                              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                Stock Quantity *
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={donationFormData.stock}
                                onChange={(e) => setDonationFormData({ ...donationFormData, stock: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="1"
                                required
                              />
                            </div>

                            {/* Categories */}
                            <div className="md:col-span-2">
                              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                Categories (comma-separated) *
                              </label>
                              <input
                                type="text"
                                value={donationFormData.categoryName}
                                onChange={(e) => setDonationFormData({ ...donationFormData, categoryName: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Fantasy, Adventure, Mystery"
                                required
                              />
                            </div>

                            {/* Tags */}
                            <div className="md:col-span-2">
                              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                Tags (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={donationFormData.tags}
                                onChange={(e) => setDonationFormData({ ...donationFormData, tags: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Magic, Quest, Dragons"
                              />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                Description *
                              </label>
                              <textarea
                                value={donationFormData.description}
                                onChange={(e) => setDonationFormData({ ...donationFormData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                rows={3}
                                placeholder="Brief description of the book..."
                                required
                              />
                            </div>

                            {/* Cover URL */}
                            <div className="md:col-span-2">
                              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                Cover Image URL *
                              </label>
                              <input
                                type="url"
                                value={donationFormData.coverUrl}
                                onChange={(e) => setDonationFormData({ ...donationFormData, coverUrl: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="https://example.com/book-cover.jpg"
                                required
                              />
                            </div>

                            {/* E-Book File Path */}
                            <div className="md:col-span-2">
                              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                                E-Book File Path (optional)
                              </label>
                              <input
                                type="url"
                                value={donationFormData.ebookFilePath}
                                onChange={(e) => setDonationFormData({ ...donationFormData, ebookFilePath: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="https://example.com/ebooks/book.pdf"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveAndApprove(request.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Save & Accept
                          </button>
                          <button
                            onClick={() => setEditingDonation(null)}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditDonation(request.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Accept & Edit
                        </button>
                        <button
                          onClick={() => onRejectDonation(request.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div >
    </div >
  );
}