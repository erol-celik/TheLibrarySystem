import { useState } from 'react';
import { Gift, BookPlus } from 'lucide-react';
import { toast } from 'sonner';

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

interface DonationFormProps {
  onAddDonation: (donation: DonationRequest) => void;
  currentUsername?: string;
}

export function DonationForm({ onAddDonation, currentUsername = 'current_user' }: DonationFormProps) {
  const [formData, setFormData] = useState({
    bookTitle: '',
    author: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bookTitle || !formData.author) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newDonation: DonationRequest = {
      id: Date.now().toString(),
      username: currentUsername,
      bookTitle: formData.bookTitle,
      author: formData.author,
      isbn: '',
      pageCount: 0,
      publisher: '',
      publicationYear: 0,
      bookType: 'Physical',
      categoryName: [],
      description: '',
      requestDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'pending',
    };

    onAddDonation(newDonation);
    setFormData({
      bookTitle: '',
      author: '',
    });
    setSubmitted(true);
    toast.success('Donation request submitted successfully!');

    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <Gift className="w-10 h-10" />
          <h2 className="text-3xl">Donate a Book</h2>
        </div>
        <p className="text-green-100">
          Share the joy of reading! Donate your books to our library and help others discover new stories.
        </p>
      </div>

      {/* Donation Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Book Title */}
            <div className="md:col-span-2">
              <label htmlFor="bookTitle" className="block text-gray-700 dark:text-gray-300 mb-2">
                Book Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="bookTitle"
                name="bookTitle"
                value={formData.bookTitle}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter book title"
                required
              />
            </div>

            {/* Author */}
            <div className="md:col-span-2">
              <label htmlFor="author" className="block text-gray-700 dark:text-gray-300 mb-2">
                Author <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter author name"
                required
              />
            </div>
          </div>

          {submitted && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-300">
                Thank you for your donation! Your request has been sent to the librarian for review.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <BookPlus className="w-5 h-5" />
            Submit Donation
          </button>
        </form>
      </div>

      {/* Info Box */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
        <h3 className="text-lg text-yellow-900 dark:text-yellow-300 mb-3">Donation Guidelines</h3>
        <ul className="space-y-2 text-yellow-800 dark:text-yellow-400">
          <li>• Books should be in good, readable condition</li>
          <li>• Just provide the book title and author name</li>
          <li>• The librarian will add the remaining book details</li>
          <li>• Your donation request will be reviewed by the librarian</li>
          <li>• You will be notified once your donation is accepted</li>
          <li>• Thank you for contributing to our library!</li>
        </ul>
      </div>
    </div>
  );
}