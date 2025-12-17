import { useState } from 'react';
import { Wallet as WalletIcon, Plus, CreditCard, TrendingUp, DollarSign, ShoppingBag, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
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

  const handleAddFunds = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onAddFunds(numAmount);
      setAmount('');
      setShowAddFunds(false);
    }
  };

  // Filter transactions for current user and reverse order (newest first)
  const userTransactions = currentUsername 
    ? transactions.filter(t => t.username === currentUsername).reverse()
    : [...transactions].reverse();

  // Calculate stats
  const totalCredits = userTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebits = userTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <WalletIcon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-blue-100">Available Balance</p>
              <h2 className="text-white">${balance.toFixed(2)}</h2>
            </div>
          </div>
          <button
            onClick={() => setShowAddFunds(true)}
            className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Funds</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
          <div>
            <p className="text-blue-200">Total Credits</p>
            <p className="text-white">${totalCredits.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-blue-200">Total Spent</p>
            <p className="text-white">${totalDebits.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-blue-200">Transactions</p>
            <p className="text-white">{userTransactions.length}</p>
          </div>
        </div>
      </div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-gray-900 dark:text-white mb-4">Add Funds to Wallet</h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Amount ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  className="px-4 py-2 border-2 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  ${preset}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddFunds}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Funds
              </button>
              <button
                onClick={() => {
                  setShowAddFunds(false);
                  setAmount('');
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ArrowUpCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">Credits</p>
              <p className="text-gray-900 dark:text-white">${totalCredits.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <ArrowDownCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">Debits</p>
              <p className="text-gray-900 dark:text-white">${totalDebits.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">Transactions</p>
              <p className="text-gray-900 dark:text-white">{userTransactions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-gray-900 dark:text-white mb-4">Transaction History</h3>
        {userTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CreditCard className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {userTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      transaction.type === 'credit' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                    }`}
                  >
                    {transaction.type === 'credit' ? (
                      <ArrowUpCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowDownCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white">{transaction.description}</p>
                    <p className="text-gray-500 dark:text-gray-400">{transaction.date}</p>
                  </div>
                </div>
                <p
                  className={`${
                    transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}