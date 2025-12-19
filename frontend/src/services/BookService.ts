import api from '../api/axiosConfig';
import { Book } from '../types';

export const BookService = {
    // Yardımcı fonksiyon: Gelen ham veriyi Book tipine çevirir
    mapToBook: (b: any): Book => ({
        id: String(b.id),
        title: b.title,
        author: b.author,
        bookType: b.bookType || 'PHYSICAL',
        // DÜZELTME: Backend b.categories (Set<String>) gönderiyor
        categoryName: b.categories || [],
        tags: b.tags || [],
        description: b.description || '',
        isbnNo: b.isbn || '', // Backend'de alan adı 'isbn'
        pageCount: b.pageCount || 0,
        price: b.price || 0,
        publicationYear: b.publicationYear || 0,
        publisher: b.publisher || '',
        coverUrl: b.imageUrl || 'https://via.placeholder.com/300x450',
        ebookFilePath: b.ebookFilePath || '',
        stock: b.availableStock || 0,
        isBorrowed: b.availableStock <= 0,
        comments: b.comments || []
    }),

    getAllBooks: async (): Promise<Book[]> => {
        const response = await api.get('/books');
        // Backend /books'dan doğrudan Liste dönüyor
        return response.data.map(BookService.mapToBook);
    },

    getFilteredBooks: async (params: any): Promise<Book[]> => {
        const response = await api.get('/books/filter', { params, size :15});
        // KRİTİK: Backend 'Page' döndüğü için veriler .content içindedir
        const data = response.data.content || [];
        return data.map(BookService.mapToBook);
    },

    getAllCategories: async (): Promise<string[]> => {
        const response = await api.get('/categories');
        return response.data.map((c: any) => c.name);
    }
};