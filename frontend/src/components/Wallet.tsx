import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, Plus, CreditCard, TrendingUp, DollarSign, ShoppingBag, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export interface Transaction {
  id: string;
  type?: 'credit' | 'debit';
  transactionType?: 'DEPOSIT' | 'PURCHASE' | 'RENTAL';
  amount: number;
  description: string;
  createdAt?: string;
  date?: string;
  username: string;
}

interface WalletProps {
  balance: number;
  onAddFunds: (amount: number) => void;
  transactions?: Transaction[];
  currentUsername?: string;
}

export function Wallet({ balance, onAddFunds, transactions = [], currentUsername }: WalletProps) {
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState('');

  // CRITICAL FIX: Ensure transactions is always an array to prevent crash
  // Even if default prop is [], parent might pass null explicitly
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  // Debug: Log balance changes
  useEffect(() => {
    console.log("Wallet Component Received Balance:", balance);
    console.log("Wallet Transactions:", safeTransactions);
  }, [balance, safeTransactions]);

  const handleAddFunds = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      // Parent component handles the async logic
      onAddFunds(numAmount);
      setAmount('');
      setShowAddFunds(false);
    }
  };

  // Filter transactions for current user and reverse order (newest first)
  // Backend auth ensures we only get our transactions, so frontend filtering is redundant/risky
  const userTransactions = [...safeTransactions].reverse();

  // Helper to determine if transaction is incoming (Credit) or outgoing (Debit)
  // Backend types: DEPOSIT (Credit), PURCHASE/PENALTY_PAYMENT (Debit)
  // We use strict matching but also fallback to safe checks
  const isCredit = (t: Transaction) => {
    const type = t.transactionType || t.type;
    return type === 'DEPOSIT' || type === 'credit';
  };

  // Calculate stats based on requested logic
  // 1. Total Debits: Sum of all outgoing transactions (PURCHASE, RENTAL) in local history
  const totalDebits = userTransactions
    .filter(t => !isCredit(t))
    .reduce((sum, t) => sum + t.amount, 0);

  // 2. Available Balance: Strictly from Backend (Prop)
  // Ensure we use the prop value passed from parent (App.tsx -> UserService.getMe)
  const availableBalance = balance || 0;

  // 3. Total Credits (Lifetime Deposits): Calculated as Balance + Debits
  // This ensures mathematical consistency: Incoming - Outgoing = Balance  => Incoming = Balance + Outgoing
  const totalCredits = availableBalance + totalDebits;

  return (
    <div className="space-y-6">
      {/* Balance Card - Compact, No Stats */}
      <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner">
            <WalletIcon className="w-10 h-10" />
          </div>
          <div>
            <p className="text-blue-100 font-medium">Available Balance</p>
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              ${availableBalance.toFixed(2)}
            </h2>
          </div>
        </div>
        <button
          onClick={() => setShowAddFunds(true)}
          className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Add Funds</span>
        </button>
      </div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Funds to Wallet</h3>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Amount ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-shadow"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {[10, 25, 50].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset.toString())}
                  className="px-4 py-2 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors font-medium"
                >
                  ${preset}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddFunds}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/30"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setShowAddFunds(false);
                  setAmount('');
                }}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats - Synchronized with Transaction Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
              <ArrowUpCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Credits</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalCredits.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
              <ArrowDownCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalDebits.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{userTransactions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-500" />
          Transaction History
        </h3>

        {userTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-gray-300 dark:text-gray-500" />
            </div>
            <p className="font-medium">No transactions yet</p>
            <p className="text-sm opacity-70">Add funds to start using your wallet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userTransactions.map((transaction) => {
              const credit = isCredit(transaction);
              return (
                <div
                  key={transaction.id}
                  className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-blue-100 dark:hover:border-gray-600"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl ${credit ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}
                    >
                      {credit ? (
                        <ArrowUpCircle className="w-5 h-5" />
                      ) : (
                        <ArrowDownCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-semibold">{transaction.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {transaction.date || transaction.createdAt ? new Date(transaction.date || transaction.createdAt!).toLocaleString('tr-TR') : "Tarih yok"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-lg ${credit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}
                    >
                      {credit ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                      {transaction.transactionType || transaction.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}