import { useState, useEffect, useRef } from "react";
import { Plus, X, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { ImageWithFallback } from "./figma/ImageWithFallback";

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

interface BookManagementProps {
  books: Book[];
  onAddBook: (book: Omit<Book, "id" | "isBorrowed">) => void;
  onRemoveBook: (id: string) => void;
  onEditBook: (id: string, book: Omit<Book, "id" | "isBorrowed">) => void;
}

export function BookManagement({
  books,
  onAddBook,
  onRemoveBook,
  onEditBook,
}: BookManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const editFormRef = useRef<HTMLFormElement>(null);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    bookType: "Hardcover",
    categoryName: "",
    tags: "",
    description: "",
    isbnNo: "",
    pageCount: "",
    price: "",
    publicationYear: "",
    publisher: "",
    coverUrl: "",
    ebookFilePath: "",
    stock: "",
  });

  // Scroll to edit form when editing starts
  useEffect(() => {
    if ((editingBook || showAddForm) && editFormRef.current) {
      editFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [editingBook, showAddForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const categoriesArray = newBook.categoryName
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c);
    const tagsArray = newBook.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    
    onAddBook({
      ...newBook,
      categoryName: categoriesArray,
      tags: tagsArray,
      pageCount: parseInt(newBook.pageCount),
      price: parseFloat(newBook.price),
      publicationYear: parseInt(newBook.publicationYear),
      stock: parseInt(newBook.stock),
      comments: [],
    });
    
    setNewBook({
      title: "",
      author: "",
      bookType: "Hardcover",
      categoryName: "",
      tags: "",
      description: "",
      isbnNo: "",
      pageCount: "",
      price: "",
      publicationYear: "",
      publisher: "",
      coverUrl: "",
      ebookFilePath: "",
      stock: "",
    });
    setShowAddForm(false);
    toast.success("Book added successfully!");
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;

    const categoriesArray = newBook.categoryName
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c);
    const tagsArray = newBook.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    
    onEditBook(editingBook.id, {
      ...newBook,
      categoryName: categoriesArray,
      tags: tagsArray,
      pageCount: parseInt(newBook.pageCount),
      price: parseFloat(newBook.price),
      publicationYear: parseInt(newBook.publicationYear),
      stock: parseInt(newBook.stock),
      comments: editingBook.comments || [],
    });
    
    setEditingBook(null);
    setNewBook({
      title: "",
      author: "",
      bookType: "Hardcover",
      categoryName: "",
      tags: "",
      description: "",
      isbnNo: "",
      pageCount: "",
      price: "",
      publicationYear: "",
      publisher: "",
      coverUrl: "",
      ebookFilePath: "",
      stock: "",
    });
    toast.success("Book updated successfully!");
  };

  const startEditing = (book: Book) => {
    setEditingBook(book);
    setShowAddForm(false);
    setNewBook({
      title: book.title,
      author: book.author,
      bookType: book.bookType,
      categoryName: book.categoryName.join(", "),
      tags: book.tags.join(", "),
      description: book.description,
      isbnNo: book.isbnNo,
      pageCount: book.pageCount.toString(),
      price: book.price.toString(),
      publicationYear: book.publicationYear.toString(),
      publisher: book.publisher,
      coverUrl: book.coverUrl,
      ebookFilePath: book.ebookFilePath,
      stock: book.stock.toString(),
    });
  };

  const cancelEdit = () => {
    setEditingBook(null);
    setNewBook({
      title: "",
      author: "",
      bookType: "Hardcover",
      categoryName: "",
      tags: "",
      description: "",
      isbnNo: "",
      pageCount: "",
      price: "",
      publicationYear: "",
      publisher: "",
      coverUrl: "",
      ebookFilePath: "",
      stock: "",
    });
  };

  const handleRemove = (book: Book) => {
    if (book.isBorrowed) {
      toast.error(
        "Cannot remove a borrowed book. Please wait for it to be returned."
      );
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to remove "${book.title}"?`
      )
    ) {
      onRemoveBook(book.id);
      toast.success("Book removed successfully!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900 dark:text-white">
            {editingBook ? 'Edit Book' : 'Book Management'}
          </h2>
          {!editingBook && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              {showAddForm ? (
                <>
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Add New Book</span>
                </>
              )}
            </button>
          )}
          {editingBook && (
            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
              <span>Cancel Edit</span>
            </button>
          )}
        </div>

        {(showAddForm || editingBook) && (
          <form ref={editFormRef} onSubmit={editingBook ? handleEditSubmit : handleSubmit} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Author *
                </label>
                <input
                  type="text"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Book Type *
                </label>
                <select
                  value={newBook.bookType}
                  onChange={(e) => setNewBook({ ...newBook, bookType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="Hardcover">Hardcover</option>
                  <option value="Paperback">Paperback</option>
                  <option value="E-Book">E-Book</option>
                  <option value="Audiobook">Audiobook</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Publisher *
                </label>
                <input
                  type="text"
                  value={newBook.publisher}
                  onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Categories (comma-separated) *
                </label>
                <input
                  type="text"
                  value={newBook.categoryName}
                  onChange={(e) => setNewBook({ ...newBook, categoryName: e.target.value })}
                  placeholder="Fantasy, Adventure, Mystery"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newBook.tags}
                  onChange={(e) => setNewBook({ ...newBook, tags: e.target.value })}
                  placeholder="Magic, Quest, Dragons"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  ISBN Number *
                </label>
                <input
                  type="text"
                  value={newBook.isbnNo}
                  onChange={(e) => setNewBook({ ...newBook, isbnNo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Page Count *
                </label>
                <input
                  type="number"
                  value={newBook.pageCount}
                  onChange={(e) => setNewBook({ ...newBook, pageCount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  value={newBook.price}
                  onChange={(e) => setNewBook({ ...newBook, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Publication Year *
                </label>
                <input
                  type="number"
                  value={newBook.publicationYear}
                  onChange={(e) => setNewBook({ ...newBook, publicationYear: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="1000"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  value={newBook.stock}
                  onChange={(e) => setNewBook({ ...newBook, stock: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="0"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  E-Book File Path
                </label>
                <input
                  type="url"
                  value={newBook.ebookFilePath}
                  onChange={(e) => setNewBook({ ...newBook, ebookFilePath: e.target.value })}
                  placeholder="https://example.com/ebooks/book.pdf"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows={3}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Cover Image URL *
                </label>
                <input
                  type="url"
                  value={newBook.coverUrl}
                  onChange={(e) => setNewBook({ ...newBook, coverUrl: e.target.value })}
                  placeholder="https://example.com/book-cover.jpg"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              {editingBook ? 'Update Book' : 'Add Book to Library'}
            </button>
          </form>
        )}

        <div>
          <h3 className="text-gray-900 dark:text-white mb-4">All Books</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">
                    Cover
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">
                    Author
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {books.map((book) => (
                  <tr
                    key={book.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3">
                      <ImageWithFallback
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {book.title}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {book.author}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {book.bookType}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      ${book.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {book.stock}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          book.isBorrowed
                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                            : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        }`}
                      >
                        {book.isBorrowed
                          ? "Borrowed"
                          : "Available"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(book)}
                          className="text-white px-3 py-2 rounded-md transition-colors text-sm bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemove(book)}
                          disabled={book.isBorrowed}
                          className={`text-white px-3 py-2 rounded-md transition-colors text-sm ${
                            book.isBorrowed
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
