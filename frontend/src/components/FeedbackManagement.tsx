import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, Trash2, Eye, Search, BookOpen, Lightbulb, User, Calendar, XCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { FeedbackService } from '../services/FeedbackService';

interface Feedback {
  id: number;
  user: { username: string; email: string };
  feedbackType: 'COMPLAINT' | 'SUGGESTION';
  message: string;
  feedbackStatus: 'NEW' | 'RESOLVED';
  createdAt: string;
}

interface BookSuggestion {
  id: number;
  suggesterUser: { username: string };
  title: string;
  author: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  suggestionDate: string;
}

export function FeedbackManagement() {
  const [activeTab, setActiveTab] = useState<'feedbacks' | 'suggestions'>('feedbacks');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [suggestions, setSuggestions] = useState<BookSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseMessage, setResponseMessage] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fbData, sgData] = await Promise.all([
        FeedbackService.getAllFeedbacksAdmin(),
        FeedbackService.getAllSuggestionsAdmin()
      ]);
      setFeedbacks(fbData);
      setSuggestions(sgData);
    } catch (error) {
      toast.error('Failed to load feedback data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveFeedback = async () => {
    if (!selectedFeedback || !responseMessage) return;
    try {
      await FeedbackService.resolveFeedback(selectedFeedback.id, responseMessage);
      toast.success('Feedback resolved successfully');
      setFeedbacks(prev => prev.map(f => f.id === selectedFeedback.id ? { ...f, feedbackStatus: 'RESOLVED' } : f));
      setSelectedFeedback(null);
      setResponseMessage('');
    } catch (error) {
      toast.error('Failed to resolve feedback');
    }
  };

  const handleSuggestionStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await FeedbackService.updateSuggestionStatus(id, status);
      toast.success(`Suggestion ${status.toLowerCase()}`);
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Filter Logic
  const filteredFeedbacks = feedbacks.filter(f =>
    (f.user?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSuggestions = suggestions.filter(s =>
    (s.suggesterUser?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Feedback & Suggestions</h2>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('feedbacks')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'feedbacks'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            System Feedback
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'suggestions'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Book Suggestions
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : activeTab === 'feedbacks' ? (
        /* Feedback List */
        <div className="grid gap-4">
          {filteredFeedbacks.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${item.feedbackType === 'COMPLAINT' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                      {item.feedbackType}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${item.feedbackStatus === 'NEW' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                      }`}>
                      {item.feedbackStatus}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <User className="w-4 h-4" /> {item.user?.username}
                    </span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 mb-3">{item.message}</p>
                  <div className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {item.feedbackStatus === 'NEW' && (
                  <button
                    onClick={() => setSelectedFeedback(item)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredFeedbacks.length === 0 && <p className="text-center text-gray-500">No feedbacks found.</p>}
        </div>
      ) : (
        /* Suggestion List */
        <div className="grid gap-4">
          {filteredSuggestions.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-semibold text-lg text-gray-900 dark:text-white">{item.title}</span>
                    <span className="text-gray-500">by {item.author}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                    <span className="flex items-center gap-1"><User className="w-4 h-4" /> {item.suggesterUser?.username}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        item.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                {item.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSuggestionStatus(item.id, 'APPROVED')}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                      title="Approve"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleSuggestionStatus(item.id, 'REJECTED')}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      title="Reject"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredSuggestions.length === 0 && <p className="text-center text-gray-500">No suggestions found.</p>}
        </div>
      )}

      {/* Resolve Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Resolve Feedback</h3>
            <p className="text-gray-600 mb-4 text-sm">{selectedFeedback.message}</p>
            <textarea
              className="w-full border rounded-lg p-3 min-h-[100px] mb-4 dark:bg-gray-700 dark:text-white"
              placeholder="Enter resolution message..."
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setSelectedFeedback(null); setResponseMessage(''); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveFeedback}
                disabled={!responseMessage.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Submit Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}