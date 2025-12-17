// src/types.ts

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
  activeRentalsCount?: number; // Backend hesaplar
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
  createdDate: string;
}