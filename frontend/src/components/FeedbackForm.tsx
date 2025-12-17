import { useState } from 'react';
import { MessageSquare, Send, Lightbulb, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Feedback {
  id: string;
  username: string;
  message: string;
  date: string;
  status: 'new' | 'reviewed';
  category?: string;
}

interface FeedbackFormProps {
  onAddFeedback: (feedback: Feedback) => void;
  currentUsername?: string;
  userRole?: 'user' | 'librarian' | 'admin';
}

export function FeedbackForm({ onAddFeedback, currentUsername = 'current_user', userRole = 'user' }: FeedbackFormProps) {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('suggestion');
  const [submitted, setSubmitted] = useState(false);

  const getRoleColor = () => {
    switch (userRole) {
      case 'user':
        return {
          primary: 'bg-blue-600 hover:bg-blue-700',
          light: 'bg-blue-50 border-blue-200 text-blue-800',
          accent: 'text-blue-600',
          gradient: 'from-blue-500 to-blue-600',
        };
      case 'librarian':
        return {
          primary: 'bg-green-600 hover:bg-green-700',
          light: 'bg-green-50 border-green-200 text-green-800',
          accent: 'text-green-600',
          gradient: 'from-green-500 to-green-600',
        };
      case 'admin':
        return {
          primary: 'bg-purple-600 hover:bg-purple-700',
          light: 'bg-purple-50 border-purple-200 text-purple-800',
          accent: 'text-purple-600',
          gradient: 'from-purple-500 to-purple-600',
        };
      default:
        return {
          primary: 'bg-blue-600 hover:bg-blue-700',
          light: 'bg-blue-50 border-blue-200 text-blue-800',
          accent: 'text-blue-600',
          gradient: 'from-blue-500 to-blue-600',
        };
    }
  };

  const colors = getRoleColor();

  const categories = [
    { id: 'suggestion', name: 'Suggestion', icon: Lightbulb },
    { id: 'complaint', name: 'Complaint', icon: AlertCircle },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const newFeedback: Feedback = {
      id: Date.now().toString(),
      username: currentUsername,
      message: message.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'new',
      category,
    };

    onAddFeedback(newFeedback);
    setMessage('');
    setCategory('suggestion');
    setSubmitted(true);
    toast.success('Feedback sent successfully!');
    
    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className={`bg-gradient-to-r ${colors.gradient} rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <MessageSquare className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl">Send Feedback</h1>
              <p className="text-white/80 text-lg">Help us improve BookHub</p>
            </div>
          </div>
          <p className="text-white/90 text-lg max-w-2xl">
            Your feedback matters! Share your thoughts, suggestions, or report issues directly with the admin team. 
            We're committed to making BookHub better for everyone.
          </p>
        </div>
      </div>

      {submitted && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-white animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl mb-1">Feedback Sent Successfully!</h3>
              <p className="text-white/90">
                Thank you for your feedback. The admin team will review it within 48 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Category Selection */}
          <div>
            <label className="block text-gray-900 dark:text-white mb-4">
              Feedback Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                      category === cat.id
                        ? `border-${userRole === 'user' ? 'blue' : userRole === 'librarian' ? 'green' : 'purple'}-500 bg-gradient-to-br ${colors.gradient} text-white shadow-lg`
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${category === cat.id ? 'text-white' : colors.accent}`} />
                    <p className={`text-sm ${category === cat.id ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {cat.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-gray-900 dark:text-white mb-4">
              Your Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Share your thoughts, suggestions, or report any issues you've encountered..."
            />
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              {message.length} / 1000 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              className={`${colors.primary} text-white px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-3 text-lg`}
            >
              <Send className="w-6 h-6" />
              Send Feedback
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setMessage('');
                setCategory('suggestion');
              }}
              className="text-gray-600 dark:text-gray-300 px-6 py-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
          <div className="bg-blue-500 p-3 rounded-xl w-fit mb-4">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-blue-900 dark:text-blue-300 mb-2">Be Specific</h3>
          <p className="text-blue-700 dark:text-blue-400 text-sm">
            Include details about your experience to help us understand better
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800">
          <div className="bg-purple-500 p-3 rounded-xl w-fit mb-4">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-purple-900 dark:text-purple-300 mb-2">Stay Respectful</h3>
          <p className="text-purple-700 dark:text-purple-400 text-sm">
            Keep your message constructive and professional
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
          <div className="bg-green-500 p-3 rounded-xl w-fit mb-4">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-green-900 dark:text-green-300 mb-2">Get Response</h3>
          <p className="text-green-700 dark:text-green-400 text-sm">
            We'll review within 48 hours and respond via notifications
          </p>
        </div>
      </div>
    </div>
  );
}