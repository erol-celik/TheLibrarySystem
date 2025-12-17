import api from '../api/axiosConfig';
import { Book } from '../types';

export const BookService = {
    // Tüm kitapları getir
    getAllBooks: async (): Promise<Book[]> => {
        const response = await api.get('/books');
        // Backend verisini Frontend formatına map'liyoruz
        return response.data.map((b: any) => ({
            id: String(b.id),
            title: b.title,
            author: b.author,
            bookType: b.bookType || 'PHYSICAL',
            categoryName: b.categoryName ? [b.categoryName] : [],
            tags: b.tags ? b.tags : [],
            description: b.description || '',
            isbnNo: b.isbnNo || '',
            pageCount: b.pageCount || 0,
            price: b.price || 0,
            publicationYear: b.publicationYear || 0,
            publisher: b.publisher || '',
            coverUrl: b.imageUrl || 'https://via.placeholder.com/300x450',
            ebookFilePath: b.ebookFilePath || '',
            stock: b.availableStock || 0,
            isBorrowed: b.availableStock <= 0, // Basit mantık: stok yoksa kiralanmıştır
        }));
    },

    // Kategorileri getir
    getAllCategories: async (): Promise<string[]> => {
        const response = await api.get('/categories');
        return response.data.map((c: any) => c.name);
    }
};