import { Calendar, Clock, Check, X, User } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Reservation {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  coverUrl: string;
  reservedBy: string;
  reservationDate: string;
  expectedReturnDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ReservationsProps {
  reservations: Reservation[];
  userRole: 'user' | 'librarian' | 'admin';
  currentUsername: string;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function Reservations({ 
  reservations, 
  userRole, 
  currentUsername,
  onApprove, 
  onReject,
  onCancel 
}: ReservationsProps) {
  const isLibrarianOrAdmin = userRole === 'librarian' || userRole === 'admin';
  
  const userReservations = isLibrarianOrAdmin 
    ? reservations 
    : reservations.filter(r => r.reservedBy === currentUsername);

  const pendingCount = userReservations.filter(r => r.status === 'pending').length;
  const approvedCount = userReservations.filter(r => r.status === 'approved').length;
  const rejectedCount = userReservations.filter(r => r.status === 'rejected').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-600">Pending</p>
              <p className="text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600">Approved</p>
              <p className="text-gray-900">{approvedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-gray-600">Rejected</p>
              <p className="text-gray-900">{rejectedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reservations List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-gray-900 mb-6">
          {isLibrarianOrAdmin ? 'All Reservations' : 'My Reservations'}
        </h2>

        {userReservations.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reservations found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ImageWithFallback
                  src={reservation.coverUrl}
                  alt={reservation.bookTitle}
                  className="w-16 h-24 object-cover rounded"
                />
                
                <div className="flex-1">
                  <h4 className="text-gray-900 mb-1">{reservation.bookTitle}</h4>
                  <p className="text-gray-600 mb-2">{reservation.bookAuthor}</p>
                  <div className="flex items-center gap-4 text-gray-500">
                    {isLibrarianOrAdmin && (
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {reservation.reservedBy}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Reserved: {reservation.reservationDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Expected Return: {reservation.expectedReturnDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full flex items-center gap-2 ${getStatusColor(reservation.status)}`}>
                    {getStatusIcon(reservation.status)}
                    <span className="capitalize">{reservation.status}</span>
                  </span>

                  {isLibrarianOrAdmin && reservation.status === 'pending' && onApprove && onReject && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onApprove(reservation.id)}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title="Approve"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onReject(reservation.id)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Reject"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {!isLibrarianOrAdmin && reservation.status === 'pending' && onCancel && (
                    <button
                      onClick={() => onCancel(reservation.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}