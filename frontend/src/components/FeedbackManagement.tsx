import { useState } from 'react';
import { MessageSquare, CheckCircle, Clock, Trash2, Eye, Filter, Search, TrendingUp, Users, AlertCircle, Lightbulb, BarChart3 } from 'lucide-react';

interface Feedback {
  id: string;
  username: string;
  message: string;
  date: string;
  status: 'new' | 'reviewed';
  category?: string;
}

interface FeedbackManagementProps {
  feedbacks: Feedback[];
  onMarkAsReviewed: (id: string) => void;
  onDeleteFeedback: (id: string) => void;
}

export function FeedbackManagement({ feedbacks, onMarkAsReviewed, onDeleteFeedback }: FeedbackManagementProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'reviewed'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const categories = [
    { id: 'all', name: 'All Categories', icon: MessageSquare },
    { id: 'suggestion', name: 'Suggestions', icon: Lightbulb },
    { id: 'complaint', name: 'Complaints', icon: AlertCircle },
  ];

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesStatus = filterStatus === 'all' || feedback.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || feedback.category === filterCategory;
    const matchesSearch = 
      feedback.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const stats = {
    total: feedbacks.length,
    new: feedbacks.filter(f => f.status === 'new').length,
    reviewed: feedbacks.filter(f => f.status === 'reviewed').length,
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'suggestion': return Lightbulb;
      case 'complaint': return AlertCircle;
      default: return MessageSquare;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'suggestion': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'complaint': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-purple-100 text-purple-600 border-purple-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <MessageSquare className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-5xl mb-2">Feedback Management</h1>
              <p className="text-purple-100 text-xl">Review and manage user feedback</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-purple-100 dark:border-purple-900/30 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl text-gray-900 dark:text-white">{stats.total}</span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-400">Total Feedbacks</h3>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-orange-100 dark:border-orange-900/30 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl text-gray-900 dark:text-white">{stats.new}</span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-400">Pending Review</h3>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-green-100 dark:border-green-900/30 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl text-gray-900 dark:text-white">{stats.reviewed}</span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-400">Reviewed</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by username or message..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'new' | 'reviewed')}
              className="px-6 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-6 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedbacks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl text-gray-900 dark:text-white mb-2">No Feedbacks Found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'No feedback has been submitted yet'}
            </p>
          </div>
        ) : (
          filteredFeedbacks.map((feedback) => {
            const CategoryIcon = getCategoryIcon(feedback.category);
            return (
              <div
                key={feedback.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 transition-all hover:shadow-xl ${
                  feedback.status === 'new' ? 'border-orange-200 dark:border-orange-900/50 bg-orange-50/30 dark:bg-orange-900/10' : 'border-gray-100 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`px-3 py-1 rounded-lg border-2 ${getCategoryColor(feedback.category)} flex items-center gap-2`}>
                        <CategoryIcon className="w-4 h-4" />
                        <span className="text-sm capitalize">{feedback.category || 'general'}</span>
                      </div>
                      
                      <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-lg border-2 border-purple-200 dark:border-purple-800 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{feedback.username}</span>
                      </div>

                      <div className={`px-3 py-1 rounded-lg border-2 ${
                        feedback.status === 'new'
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                      } flex items-center gap-2`}>
                        {feedback.status === 'new' ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        <span className="text-sm capitalize">{feedback.status}</span>
                      </div>

                      <span className="text-gray-500 dark:text-gray-400 text-sm">{feedback.date}</span>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      {feedback.message}
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedFeedback(feedback)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>

                      {feedback.status === 'new' && (
                        <button
                          onClick={() => onMarkAsReviewed(feedback.id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as Reviewed
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this feedback?')) {
                            onDeleteFeedback(feedback.id);
                          }
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selectedFeedback && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedFeedback(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl">Feedback Details</h2>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800">
                  <p className="text-purple-600 dark:text-purple-400 text-sm mb-1">Username</p>
                  <p className="text-gray-900 dark:text-white">{selectedFeedback.username}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
                  <p className="text-blue-600 dark:text-blue-400 text-sm mb-1">Date</p>
                  <p className="text-gray-900 dark:text-white">{selectedFeedback.date}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border-2 border-green-200 dark:border-green-800 col-span-2">
                  <p className="text-green-600 dark:text-green-400 text-sm mb-1">Type</p>
                  <p className="text-gray-900 dark:text-white capitalize">{selectedFeedback.category || 'general'}</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600">
                <p className="text-gray-600 dark:text-gray-400 mb-2">Message</p>
                <p className="text-gray-900 dark:text-white leading-relaxed">{selectedFeedback.message}</p>
              </div>

              <div className="flex items-center gap-3">
                {selectedFeedback.status === 'new' && (
                  <button
                    onClick={() => {
                      onMarkAsReviewed(selectedFeedback.id);
                      setSelectedFeedback(null);
                    }}
                    className="flex-1 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark as Reviewed
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this feedback?')) {
                      onDeleteFeedback(selectedFeedback.id);
                      setSelectedFeedback(null);
                    }
                  }}
                  className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}