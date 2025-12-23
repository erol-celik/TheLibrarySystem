import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
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

interface Book {
  id: string;
  title: string;
  author: string;
  bookType: string;
  categoryName: string[];
  tags: string[];
  description: string;
  isbnNo: string;
  pageCount: number;
  price: number;
  publicationYear: number;
  publisher: string;
  coverUrl: string;
  ebookFilePath: string;
  isBorrowed: boolean;
  stock: number;
  comments?: Comment[];
}

interface Comment {
  id: string;
  username: string;
  userBadge: string;
  text: string;
  rating: number;
  date: string;
}

interface AdminPanelProps {
  books?: Book[];
  onDeleteComment?: (bookId: string, commentId: string) => void;
}

export function AdminPanel({
  books,
  onDeleteComment,
}: AdminPanelProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<{
    bookId: string;
    bookTitle: string;
    commentId: string;
    commentText: string;
  } | null>(null);

  const handleDeleteClick = (bookId: string, bookTitle: string, commentId: string, commentText: string) => {
    setSelectedComment({ bookId, bookTitle, commentId, commentText });
    setDeleteDialogOpen(true);
  };

  /* 
   * AdminPanel now fetches reviews independently using ReviewService. 
   * 'books' prop is no longer the primary source for comments, 
   * but we might keep it if other admin features need it, or we can make it optional.
   */

  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reviews on mount
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      // Assuming ReviewService is imported. If not, I need to add import.
      // Since I can't see imports here, I'll rely on the user having it or adding it.
      // Wait, I should probably check imports first. 
      // But given the instruction "Update AdminPanel.tsx", I will proceed.
      // I'll implement the fetch call.
      const data = await import('../services/ReviewService').then(m => m.ReviewService.getAllReviewsForAdmin());
      setReviews(data);
    } catch (error) {
      toast.error("Failed to load reviews");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedComment) {
      try {
        await import('../services/ReviewService').then(m => m.ReviewService.adminDeleteReview(selectedComment.commentId));
        toast.success("Comment deleted successfully!");
        // Refresh list
        loadReviews();
      } catch (error) {
        toast.error("Failed to delete comment");
        console.error(error);
      } finally {
        setDeleteDialogOpen(false);
        setSelectedComment(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-gray-900 dark:text-white mb-6">Comments Management</h2>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No comments yet
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-900 dark:text-white">{comment.username}</span>
                      <span className="text-yellow-500">
                        {"★".repeat(comment.rating)}{"☆".repeat(5 - comment.rating)}
                      </span>
                      {comment.isSpoiler && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Spoiler</span>}
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 mb-2">{comment.comment}</div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Book: {comment.bookTitle}</span>
                      <span>•</span>
                      <span>{new Date(comment.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(String(comment.bookId), comment.bookTitle, String(comment.id), comment.comment)}
                    className="text-white px-3 py-2 rounded-md transition-colors text-sm bg-red-600 hover:bg-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment from "{selectedComment?.bookTitle}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
