import { useState, useEffect } from 'react';
import { Gift, BookPlus, Loader2, Clock, BookOpen, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { DonationService, DonationRequest } from '../services/DonationService';

interface DonationFormProps {
  onAddDonation?: (donation: any) => void;
  currentUsername?: string;
}

export function DonationForm({ onAddDonation, currentUsername = 'current_user' }: DonationFormProps) {
  const [formData, setFormData] = useState({
    bookTitle: '',
    author: '',
    description: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [myDonations, setMyDonations] = useState<DonationRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await DonationService.getMyDonations();
      setMyDonations(data);
    } catch (error) {
      console.error("Failed to fetch donation history", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bookTitle.trim() || !formData.author.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Backend mapping: form 'author' maps to 'bookAuthor'
      const payload = {
        bookTitle: formData.bookTitle,
        bookAuthor: formData.author,
        description: formData.description || 'No description provided'
      };

      await DonationService.createDonation(payload);

      setFormData({
        bookTitle: '',
        author: '',
        description: '',
      });
      setSubmitted(true);
      toast.success('Donation request submitted successfully!');

      // Refresh list
      fetchHistory();

      setTimeout(() => {
        setSubmitted(false);
      }, 3000);

    } catch (error) {
      console.error('Donation submission error:', error);
      toast.error('Failed to submit donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">

      {/* 1. Decorative Header Banner */}
      <div className="bg-[#00A67E] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden transition-all hover:shadow-xl">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-black/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute top-4 right-8 w-12 h-12 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/10 rounded-full">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Donate a Book</h2>
          </div>
          <p className="text-green-50 text-base max-w-lg font-light leading-relaxed">
            Share the joy of reading! Your contributions help us build a richer library for everyone to explore.
          </p>
        </div>
      </div>

      {/* 2. Donation Form Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <BookPlus className="w-5 h-5 text-[#00A67E]" />
            New Donation Request
          </h3>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Book Title */}
            <div className="space-y-2">
              <label htmlFor="bookTitle" className="block text-gray-700 dark:text-gray-300 font-medium text-sm">
                Book Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="bookTitle"
                  name="bookTitle"
                  value={formData.bookTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pl-10 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A67E]/20 focus:border-[#00A67E] bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all placeholder:text-gray-400"
                  placeholder="e.g. The Hobbit"
                  required
                />
                <BookOpen className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Author */}
            <div className="space-y-2">
              <label htmlFor="author" className="block text-gray-700 dark:text-gray-300 font-medium text-sm">
                Author <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A67E]/20 focus:border-[#00A67E] bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all placeholder:text-gray-400"
                placeholder="e.g. J.R.R. Tolkien"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 font-medium text-sm">
                Book Condition / Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A67E]/20 focus:border-[#00A67E] bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all placeholder:text-gray-400 resize-none"
                placeholder="Briefly describe the condition of the book (e.g. New, Used, Hardcover)..."
              />
            </div>

            {submitted && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
                <div className="bg-green-100 dark:bg-green-800 rounded-full p-1">
                  <Gift className="w-4 h-4 text-green-600 dark:text-green-300" />
                </div>
                <p className="text-green-800 dark:text-green-300 font-medium text-sm">
                  Thank you! Your donation request has been submitted for review.
                </p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00A67E] hover:bg-[#008f6d] text-white px-6 py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.99]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gift className="w-5 h-5" />}
                {loading ? 'Submitting Request...' : 'Submit Donation'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. Guidelines Card */}
      <div className="bg-[#FFFBEB] dark:bg-yellow-900/10 rounded-2xl p-6 border border-[#FEF3C7] dark:border-yellow-800/30 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <AlertCircle className="w-24 h-24 text-yellow-600" />
        </div>
        <h3 className="text-[#92400E] dark:text-yellow-400 font-semibold mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Donation Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[#92400E] dark:text-yellow-400/90 text-sm relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0"></span>
            <span>Books must be readable</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0"></span>
            <span>Provide accurate details</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0"></span>
            <span>Librarian approval required</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0"></span>
            <span>Check status in list below</span>
          </div>
        </div>
      </div>

      {/* 4. My Donations History Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div
          className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => setShowHistory(!showHistory)}
        >
          <h3 className="text-gray-800 dark:text-gray-200 font-semibold text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00A67E]" />
            My Donations
          </h3>
          <button className="text-gray-400 hover:text-gray-600">
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showHistory && (
          <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
            {loadingHistory ? (
              <div className="flex justify-center items-center py-8 text-gray-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs">Loading history...</span>
              </div>
            ) : myDonations.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-8 text-gray-400 gap-2 text-center">
                <BookPlus className="w-8 h-8 opacity-20" />
                <p className="text-sm font-medium">No past donations found</p>
              </div>
            ) : (
              myDonations.map(don => (
                <div key={don.id} className="group flex flex-col gap-2 p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-700/30 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-900 dark:text-gray-100 font-semibold text-sm">{don.bookTitle}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{don.bookAuthor}</p>
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${don.status === 'APPROVED'
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                        : don.status === 'REJECTED'
                          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                      }`}>
                      {don.status || 'PENDING'}
                    </span>
                  </div>
                  {don.description && don.description !== 'No description provided' && (
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                      {don.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
