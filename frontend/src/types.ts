// src/types.ts

export interface Comment {
  id: string;
  username: string;
  userBadge: string;
  text: string;
  rating: number;
  date: string;
  isSpoiler?: boolean;
  helpfulCount?: number;
  userId?: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  bookType: 'PHYSICAL' | 'DIGITAL';
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
  stock: number;
  isBorrowed: boolean;
  borrowedBy?: string; // Added for UI detail
  activeRentalsCount?: number;
  comments: Comment[]; // Now required and typed
}

export interface UserAccount {
  id: string; // Backend ID'si
  username: string; // İsim (Name)
  email: string;
  role: 'user' | 'librarian' | 'admin';
  status: 'active' | 'blocked';
  walletBalance: number;
  penaltyCount: number;
  phone: string;
  address: string;
  profilePicture: string;
  badge: string; // Şimdilik string, backend'den badge sistemi kalktı ama UI istiyor
  bio?: string;
  createdDate: string;
}

export interface BlindDateResponse {
  maskedTitle: string;
  maskedAuthor: string;
  description: string;
  vibeTags: string[]; // backend uses Set<String>, frontend sees array
  realBook: Book;    // The actual book details populated from backend
}