import { useState, useEffect } from 'react';
import { X, ShoppingCart, BookOpen, Calendar, User as UserIcon, Building, Star, Send, Trash2, ThumbsUp, Eye, EyeOff, Edit2 } from 'lucide-react';
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

import { Book, Comment } from '../types';
import { ReviewService, ReviewRequest } from '../services/ReviewService';

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
  onBorrow?: () => void;
  onPurchase?: () => void;
  userRole: 'user' | 'librarian' | 'admin';
  hasActiveBorrow?: boolean;
  currentUsername?: string;
  currentUserBadge?: string;
  onAddComment?: (bookId: string, comment: Comment) => void;
  onDeleteComment?: (bookId: string, commentId: string) => void;
  onEditBook?: (id: string, book: any) => void;
}

export function BookDetailModal({
  book,
  onClose,
  onBorrow,
  onPurchase,
  userRole,
  hasActiveBorrow,
  currentUsername,
  currentUserBadge,
  // onAddComment, // Deprecated in favor of internal logic, kept for prop signature compatibility if needed
  onDeleteComment,
  onEditBook
}: BookDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>(book.comments || []);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [expandedSpoilers, setExpandedSpoilers] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Mode State
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editIsSpoiler, setEditIsSpoiler] = useState(false);

  // Stats
  const [average, setAverage] = useState<string>('N/A');
  const [reviewCount, setReviewCount] = useState<number>(0);

  useEffect(() => {
    fetchReviews();
  }, [book.id]);

  useEffect(() => {
    if (comments.length > 0) {
      const avg = (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1);
      setAverage(avg);
      setReviewCount(comments.length);
    } else {
      setAverage('N/A');
      setReviewCount(0);
    }
  }, [comments]);

  const fetchReviews = async () => {
    try {
      const data = await ReviewService.getReviewsByBookId(book.id);
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    }
  };

  const handleDeleteClick = (commentId: string) => {
    setSelectedCommentId(commentId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedCommentId && onDeleteComment) {
      onDeleteComment(book.id, selectedCommentId);
      toast.success("Comment deleted successfully!");
      setDeleteDialogOpen(false);
      setSelectedCommentId(null);
      // Optimistic update
      setComments(prev => prev.filter(c => c.id !== selectedCommentId));
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUsername) return;

    setIsSubmitting(true);
    const request: ReviewRequest = {
      bookId: book.id,
      stars: rating,
      comment: newComment,
      spoiler: isSpoiler
    };

    try {
      await ReviewService.addReview(request);
      toast.success("Review posted successfully!");
      setNewComment('');
      setRating(5);
      setIsSpoiler(false);
      fetchReviews(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to post review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = async (commentId: string) => {
    try {
      await ReviewService.toggleLike(commentId);
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to like review.");
    }
  };

  const toggleSpoilerReveal = (commentId: string) => {
    setExpandedSpoilers(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.text);
    setEditRating(comment.rating);
    setEditIsSpoiler(comment.isSpoiler || false);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent('');
    setEditRating(5);
    setEditIsSpoiler(false);
  };

  const handleUpdateReview = async () => {
    if (!editingCommentId || !editContent.trim()) return;

    try {
      const request: ReviewRequest = {
        bookId: book.id,
        stars: editRating,
        comment: editContent,
        spoiler: editIsSpoiler
      };
      await ReviewService.updateReview(editingCommentId, request);
      toast.success("Review updated successfully!");
      cancelEditing();
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to update review.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-gray-900 dark:text-white">Book Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Left: Image */}
            <div>
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-96 object-cover rounded-xl shadow-lg"
              />
              {book.bookType !== 'PHYSICAL' && (
                <div className="mt-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Price</span>
                    <span className="text-purple-600 dark:text-purple-400">${book.price.toFixed(2)}</span>
                  </div>
                </div>
              )}
              {reviewCount > 0 && (
                <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Average Rating</span>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-yellow-600 dark:text-yellow-400">{average} / 5</span>
                    </div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{reviewCount} reviews</p>
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="space-y-4">
              <div>
                <h1 className="text-gray-900 dark:text-white mb-2">{book.title}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">by {book.author}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {book.categoryName.map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{book.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span>Pages</span>
                  </div>
                  <p className="text-gray-900 dark:text-white">{book.pageCount}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>Published</span>
                  </div>
                  <p className="text-gray-900 dark:text-white">{book.publicationYear}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <Building className="w-4 h-4" />
                    <span>Publisher</span>
                  </div>
                  <p className="text-gray-900 dark:text-white">{book.publisher}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span>Type</span>
                  </div>
                  <p className="text-gray-900 dark:text-white">{book.bookType}</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-600 dark:text-gray-400">ISBN</p>
                <p className="text-gray-900 dark:text-white">{book.isbnNo}</p>
              </div>

              {book.isBorrowed && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
                    <UserIcon className="w-4 h-4" />
                    <span>Currently borrowed by {book.borrowedBy}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              {userRole === 'user' && (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {!book.isBorrowed && onBorrow && (
                    <button
                      onClick={onBorrow}
                      disabled={hasActiveBorrow}
                      className={`py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${hasActiveBorrow
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      <BookOpen className="w-5 h-5" />
                      <span>Borrow</span>
                    </button>
                  )}
                  {onPurchase && (
                    <button
                      onClick={onPurchase}
                      className={`bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 ${!book.isBorrowed && onBorrow ? '' : 'col-span-2'}`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Purchase</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-gray-900 dark:text-white mb-4">Reviews & Comments</h3>

            {/* Add Comment Form (only for users) */}
            {userRole === 'user' && currentUsername && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 dark:text-gray-300">Your Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="transition-colors"
                        >
                          <Star
                            className={`w-5 h-5 ${star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Spoiler Toggle */}
                  <button
                    onClick={() => setIsSpoiler(!isSpoiler)}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${isSpoiler ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'}`}
                  >
                    {isSpoiler ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {isSpoiler ? 'Contains Spoiler' : 'Does Not Contain Spoiler'}
                  </button>
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts about this book..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
                  rows={3}
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No reviews yet. Be the first to review this book!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    {editingCommentId === comment.id ? (
                      // EDIT MODE UI
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Edit your review</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button key={star} onClick={() => setEditRating(star)}>
                                <Star className={`w-5 h-5 ${star <= editRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:text-white"
                          rows={3}
                        />
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setEditIsSpoiler(!editIsSpoiler)}
                            className={`text-xs px-2 py-1 rounded ${editIsSpoiler ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
                          >
                            {editIsSpoiler ? 'Contains Spoiler' : 'Does Not Contain Spoiler'}
                          </button>
                          <div className="flex gap-2">
                            <button onClick={cancelEditing} className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                            <button onClick={handleUpdateReview} className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">Save</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // VIEW MODE UI
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                              <div className="flex flex-col">
                                <span className="text-gray-900 dark:text-white font-medium">{comment.username}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{comment.userBadge}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < comment.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                    }`}
                                />
                              ))}
                            </div>

                            <button
                              onClick={() => toggleLike(comment.id)}
                              className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span className="text-xs">{comment.helpfulCount || 0}</span>
                            </button>

                            {/* Edit Button for Owner */}
                            {currentUsername === comment.username && (
                              <button
                                onClick={() => startEditing(comment)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Edit Review"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Admin delete button */}
                            {(userRole === 'admin' || currentUsername === comment.username) && onDeleteComment && (
                              <button
                                onClick={() => handleDeleteClick(comment.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete Comment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mb-2">
                          {comment.isSpoiler && !expandedSpoilers.has(comment.id) ? (
                            <div className="relative group cursor-pointer" onClick={() => toggleSpoilerReveal(comment.id)}>
                              {/* Blurred Content */}
                              <div className="filter blur-md opacity-30 select-none">
                                {comment.text}
                              </div>
                              {/* Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 shadow-sm flex items-center gap-2">
                                  <EyeOff className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    This comment contains spoilers. Click to reveal.
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-700 dark:text-gray-300">
                              {comment.text}
                              {comment.isSpoiler && (
                                <button
                                  onClick={() => toggleSpoilerReveal(comment.id)}
                                  className="ml-2 text-xs text-gray-400 hover:text-gray-600 inline-flex items-center gap-1"
                                >
                                  <EyeOff className="w-3 h-3" />
                                  (Hide Spoiler)
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <p className="text-gray-500 dark:text-gray-400 text-sm">{comment.date}</p>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Delete Comment Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the comment.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
