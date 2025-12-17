import { useState } from "react";
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
  books: Book[];
  onDeleteComment: (bookId: string, commentId: string) => void;
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

  const handleConfirmDelete = () => {
    if (selectedComment) {
      onDeleteComment(selectedComment.bookId, selectedComment.commentId);
      toast.success("Comment deleted successfully!");
      setDeleteDialogOpen(false);
      setSelectedComment(null);
    }
  };

  // Get all comments from all books
  const allComments = books.flatMap(book => 
    (book.comments || []).map(comment => ({
      ...comment,
      bookId: book.id,
      bookTitle: book.title,
    }))
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-gray-900 dark:text-white mb-6">Comments Management</h2>
        
        {allComments.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No comments yet
          </div>
        ) : (
          <div className="space-y-4">
            {allComments.map((comment) => (
              <div
                key={`${comment.bookId}-${comment.id}`}
                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-900 dark:text-white">{comment.username}</span>
                      <span className="text-yellow-500">
                        {"★".repeat(comment.rating)}{"☆".repeat(5 - comment.rating)}
                      </span>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 mb-2">{comment.text}</div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Book: {comment.bookTitle}</span>
                      <span>•</span>
                      <span>{new Date(comment.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(comment.bookId, comment.bookTitle, comment.id, comment.text)}
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
