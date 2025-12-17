import { Clock, User, BookOpen } from 'lucide-react';

interface BorrowedBook {
  id: string;
  title: string;
  author: string;
  borrowedBy: string;
  dueDate: string;
}

interface BorrowedBooksListProps {
  books: BorrowedBook[];
  onReturn: (id: string) => void;
}

export function BorrowedBooksList({ books, onReturn }: BorrowedBooksListProps) {
  if (books.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No books currently borrowed</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700">Book Title</th>
              <th className="px-6 py-3 text-left text-gray-700">Author</th>
              <th className="px-6 py-3 text-left text-gray-700">Borrowed By</th>
              <th className="px-6 py-3 text-left text-gray-700">Due Date</th>
              <th className="px-6 py-3 text-left text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {books.map((book) => {
              const dueDate = new Date(book.dueDate);
              const today = new Date();
              const isOverdue = dueDate < today;
              
              return (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-900">{book.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{book.author}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{book.borrowedBy}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={isOverdue ? 'text-red-600' : 'text-gray-700'}>
                        {book.dueDate}
                        {isOverdue && ' (Overdue)'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onReturn(book.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Return
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
