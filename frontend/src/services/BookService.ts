import api from '../api/axiosConfig';
import { Book } from '../types';

export const BookService = {
    // Yardımcı fonksiyon: Gelen ham veriyi Book tipine çevirir
    mapToBook: (b: any): Book => {
        // Handle categories: backend might return a Set of objects or strings, or just strings?
        // Usually Spring Data REST / Custom methods might return just the object.
        // If it returns Set<Category> (objects with name prop):
        let catNames: string[] = [];
        if (Array.isArray(b.categories)) {
            catNames = b.categories.map((c: any) => typeof c === 'string' ? c : c.name);
        }

        return {
            id: b.id ? String(b.id) : '',
            title: b.title,
            author: b.author,
            bookType: b.bookType || 'PHYSICAL',
            categoryName: catNames,
            tags: b.tags || [],
            description: b.description || '',
            isbnNo: b.isbn || '', // Backend'de alan adı 'isbn'
            pageCount: b.pageCount || 0,
            price: b.price || 0,
            publicationYear: b.publicationYear || 0,
            publisher: b.publisher || '',
            coverUrl: b.imageUrl || 'https://placehold.co/300x450',
            ebookFilePath: b.ebookFilePath || '',
            stock: b.availableStock || 0,
            isBorrowed: b.availableStock <= 0,
            comments: b.comments || []
        };
    },

    getAllBooks: async (): Promise<Book[]> => {
        const response = await api.get('/books');
        return response.data.map(BookService.mapToBook);
    },

    getFilteredBooks: async (params: any): Promise<{ content: Book[], totalPages: number }> => {
        // Empty string check for category to ensure backend treats it as null/undefined
        if (params.category === "") {
            params.category = undefined;
        } else if (params.category) {
            // Trim whitespace to ensure matching
            params.category = String(params.category).trim();
        } else if (params.category === null) {
            params.category = undefined;
        }

        console.log('Sending Category:', params.category === undefined ? "All (null sent)" : params.category);

        const response = await api.get('/books/filter', { params });
        console.log('DEBUG: Filter response:', response.data);
        // KRİTİK: Backend 'Page' döndüğü için veriler .content içindedir
        const data = response.data.content || [];
        return {
            content: data.map(BookService.mapToBook),
            // User confirmed data is in 'page' object: page.totalPages
            totalPages: response.data.page?.totalPages || response.data.totalPages || 0
        };
    },

    getAllCategories: async (): Promise<string[]> => {
        const response = await api.get('/categories');
        return response.data.map((c: any) => c.name);
    }
};