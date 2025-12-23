import api from '../api/axiosConfig';
import { Book } from '../types';

export const BookService = {
    // Yardımcı fonksiyon: Gelen ham veriyi Book tipine çevirir
    mapToBook: (b: any): Book => {
        // Handle categories: backend might return a Set of objects or strings
        let catNames: string[] = [];
        if (Array.isArray(b.categories)) {
            catNames = b.categories.map((c: any) => {
                if (typeof c === 'string') return c;
                if (c?.name) return c.name;
                if (c?.categoryName) return c.categoryName;
                return null;
            }).filter((c): c is string => !!c);
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
            coverUrl: b.imageUrl ? b.imageUrl.replace('page_count', '').trim() : 'https://placehold.co/300x450',
            ebookFilePath: b.ebookFilePath || '',
            stock: b.availableStock || 0,
            isBorrowed: b.availableStock <= 0,
            comments: (b.comments || []).map((c: any) => ({
                id: String(c.id),
                username: c.user?.username || 'Anonymous',
                userBadge: c.user?.badge || 'Reader',
                text: c.comment,
                rating: c.stars,
                date: new Date(c.createdDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                isSpoiler: c.spoiler,
                helpfulCount: c.helpfulCount || 0,
                userId: c.user?.id
            })),
            rating: b.rating || 0,
            reviewCount: b.reviewCount || 0
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
        const data = response.data;
        if (!Array.isArray(data)) return [];

        // Robust mapping to handle string or object {name: "..."} or {categoryName: "..."}
        const categories = data.map((c: any) => {
            if (typeof c === 'string') return c;
            if (c?.name) return c.name;
            if (c?.categoryName) return c.categoryName;
            return null;
        }).filter((c): c is string => !!c);

        // Deduplicate categories just in case
        return Array.from(new Set(categories));
    },

    getAllTags: async (): Promise<string[]> => {
        const response = await api.get('/tags');
        return response.data;
    },

    getBlindDateBook: async (tag?: string): Promise<import('../types').BlindDateResponse> => {
        let url = '/books/blind-date-by-tag';
        if (tag) {
            // Backend path matches /books/blind-date-by-tag/{tagName}
            url += `/${encodeURIComponent(tag)}`;
        } else {
            throw new Error("A tag must be provided for blind date.");
        }

        const response = await api.get(url);
        const data = response.data;
        if (data.realBook) {
            data.realBook = BookService.mapToBook(data.realBook);
        }
        return data;
    },

    getNewArrivals: async (): Promise<Book[]> => {
        const response = await api.get('/books/new');
        return response.data.map(BookService.mapToBook);
    },

    getTopRatedBooks: async (): Promise<Book[]> => {
        const response = await api.get('/books/top-rated');
        return response.data.map(BookService.mapToBook);
    },

    getEditorsChoice: async (): Promise<Book[]> => {
        const response = await api.get('/editors-pick');
        return response.data.map(BookService.mapToBook);
    },

    addBook: async (book: any): Promise<Book> => {
        const response = await api.post('/librarian/add-book', book);
        return BookService.mapToBook(response.data);
    },

    deleteBook: async (isbn: string): Promise<void> => {
        await api.delete(`/librarian/delete-book/${isbn}`);
    },

    updateBook: async (id: string, book: any): Promise<Book> => {
        const response = await api.put<any>(`/librarian/update-book/${id}`, book);
        return BookService.mapToBook(response.data);
    },
};