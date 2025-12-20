// WalletService.ts
import api from '../api/axiosConfig';

export const WalletService = {
    // Para yükleme isteği
    deposit: async (amount: number) => {
        // Backend'de /api/wallet/deposit endpoint'ini çağırır
        const response = await api.post('/wallet/deposit', { amount });
        return response.data;
    },

    // Güncel bakiyeyi çekme
    getBalance: async () => {
        const response = await api.get('/wallet/balance');
        return response.data;
    },

    // İşlem geçmişini çekme (Server-side Persistence)
    getTransactions: async () => {
        const response = await api.get('/wallet/transactions');
        return response.data;
    }
};