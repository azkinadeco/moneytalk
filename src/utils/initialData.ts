import { Category, Wallet, FinancialGoal, Budget, Transaction, RecurringTransaction, DebtItem } from '../types';
import { getTodayDateString, getCurrentMonthString } from './format';

export const INITIAL_CATEGORIES: Category[] = [
  // Expense Categories
  { id: 'cat-food', name: 'Makanan & Kuliner', icon: 'Utensils', color: '#F97316', type: 'expense' },
  { id: 'cat-transport', name: 'Transportasi', icon: 'Car', color: '#3B82F6', type: 'expense' },
  { id: 'cat-shopping', name: 'Belanja & Groceries', icon: 'ShoppingBag', color: '#EC4899', type: 'expense' },
  { id: 'cat-bills', name: 'Tagihan & Utilitas', icon: 'Zap', color: '#EAB308', type: 'expense' },
  { id: 'cat-entertainment', name: 'Hiburan & Hobi', icon: 'Gamepad2', color: '#8B5CF6', type: 'expense' },
  { id: 'cat-health', name: 'Kesehatan & Skincare', icon: 'HeartPulse', color: '#10B981', type: 'expense' },
  { id: 'cat-education', name: 'Edukasi & Buku', icon: 'GraduationCap', color: '#06B6D4', type: 'expense' },
  { id: 'cat-charity', name: 'Donasi & Keluarga', icon: 'HeartHandshake', color: '#F43F5E', type: 'expense' },
  { id: 'cat-other-exp', name: 'Lain-lain', icon: 'Package', color: '#6B7280', type: 'expense' },

  // Income Categories
  { id: 'cat-salary', name: 'Gaji Pokok', icon: 'Briefcase', color: '#10B981', type: 'income' },
  { id: 'cat-freelance', name: 'Freelance & Side Job', icon: 'Laptop', color: '#3B82F6', type: 'income' },
  { id: 'cat-invest', name: 'Dividen & Investasi', icon: 'TrendingUp', color: '#8B5CF6', type: 'income' },
  { id: 'cat-gift', name: 'Hadiah & Bonus', icon: 'Gift', color: '#F59E0B', type: 'income' },
  { id: 'cat-other-inc', name: 'Pemasukan Lain', icon: 'Coins', color: '#14B8A6', type: 'income' },
];

export const INITIAL_WALLETS: Wallet[] = [
  { id: 'wal-bca', name: 'BCA Utama', type: 'bank', initialBalance: 12500000, color: '#00529B', icon: 'Landmark', accountNumber: '••• 8821' },
  { id: 'wal-cash', name: 'Dompet Tunai', type: 'cash', initialBalance: 750000, color: '#10B981', icon: 'Wallet', accountNumber: 'Cash on Hand' },
  { id: 'wal-gopay', name: 'GoPay', type: 'ewallet', initialBalance: 420000, color: '#00AED6', icon: 'Smartphone', accountNumber: '0812•••' },
  { id: 'wal-mandiri', name: 'Mandiri Tabungan', type: 'bank', initialBalance: 8200000, color: '#003366', icon: 'CreditCard', accountNumber: '••• 4519' },
  { id: 'wal-invest', name: 'Bibit Portofolio', type: 'investment', initialBalance: 15000000, color: '#059669', icon: 'TrendingUp', accountNumber: 'Reksadana' },
];

export const INITIAL_GOALS: FinancialGoal[] = [
  { id: 'goal-emergency', title: 'Dana Darurat (6 Bulan)', targetAmount: 30000000, currentAmount: 21500000, deadline: '2026-12-31', icon: 'ShieldCheck', color: '#10B981' },
  { id: 'goal-vacation', title: 'Liburan ke Jepang', targetAmount: 25000000, currentAmount: 14200000, deadline: '2027-04-15', icon: 'Plane', color: '#3B82F6' },
  { id: 'goal-gadget', title: 'iPhone Baru', targetAmount: 18000000, currentAmount: 12000000, deadline: '2026-12-25', icon: 'Smartphone', color: '#8B5CF6' },
];

export const INITIAL_BUDGETS: Budget[] = [
  { id: 'b-1', categoryId: 'cat-food', limit: 3000000, month: getCurrentMonthString() },
  { id: 'b-2', categoryId: 'cat-transport', limit: 1000000, month: getCurrentMonthString() },
  { id: 'b-3', categoryId: 'cat-shopping', limit: 1800000, month: getCurrentMonthString() },
  { id: 'b-4', categoryId: 'cat-entertainment', limit: 800000, month: getCurrentMonthString() },
  { id: 'b-5', categoryId: 'cat-bills', limit: 1200000, month: getCurrentMonthString() },
];

export const INITIAL_RECURRING: RecurringTransaction[] = [
  { id: 'rec-1', name: 'Langganan Netflix Premium', amount: 186000, type: 'expense', categoryId: 'cat-entertainment', walletId: 'wal-bca', frequency: 'monthly', dayOfMonth: 5, isActive: true },
  { id: 'rec-2', name: 'Internet Wifi Indihome', amount: 375000, type: 'expense', categoryId: 'cat-bills', walletId: 'wal-bca', frequency: 'monthly', dayOfMonth: 15, isActive: true },
  { id: 'rec-3', name: 'Spotify Family Subscription', amount: 86900, type: 'expense', categoryId: 'cat-entertainment', walletId: 'wal-gopay', frequency: 'monthly', dayOfMonth: 20, isActive: true },
  { id: 'rec-4', name: 'Gaji Pokok Bulanan', amount: 14000000, type: 'income', categoryId: 'cat-salary', walletId: 'wal-bca', frequency: 'monthly', dayOfMonth: 25, isActive: true },
];

export const INITIAL_DEBTS: DebtItem[] = [
  { id: 'debt-1', type: 'receivable', personName: 'Andi Pratama', amount: 500000, paidAmount: 200000, dueDate: '2026-11-30', note: 'Pinjam bayar tiket konser', createdAt: Date.now() - 86400000 * 5, isCompleted: false },
  { id: 'debt-2', type: 'payable', personName: 'Budi Santoso', amount: 350000, paidAmount: 350000, dueDate: '2026-11-20', note: 'Talangan beli kemeja', createdAt: Date.now() - 86400000 * 12, isCompleted: true },
];

export const getInitialTransactions = (): Transaction[] => {
  const today = getTodayDateString();
  const dateObj = new Date();
  
  const formatDate = (daysAgo: number): string => {
    const d = new Date(dateObj);
    d.setDate(d.getDate() - daysAgo);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return [
    {
      id: 'tx-1',
      type: 'expense',
      amount: 45000,
      categoryId: 'cat-food',
      walletId: 'wal-gopay',
      date: today,
      time: '12:30',
      note: 'Makan siang Kopi Kenangan & Roti',
      createdAt: Date.now() - 3600000 * 2,
    },
    {
      id: 'tx-2',
      type: 'expense',
      amount: 28000,
      categoryId: 'cat-transport',
      walletId: 'wal-gopay',
      date: today,
      time: '08:45',
      note: 'Gojek ke kantor',
      createdAt: Date.now() - 3600000 * 5,
    },
    {
      id: 'tx-3',
      type: 'expense',
      amount: 320000,
      categoryId: 'cat-shopping',
      walletId: 'wal-bca',
      date: formatDate(1),
      time: '19:15',
      note: 'Belanja bulanan minimarket & buah',
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'tx-4',
      type: 'income',
      amount: 3500000,
      categoryId: 'cat-freelance',
      walletId: 'wal-bca',
      date: formatDate(2),
      time: '14:00',
      note: 'DP Project Web Design Klien',
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'tx-5',
      type: 'expense',
      amount: 186000,
      categoryId: 'cat-bills',
      walletId: 'wal-bca',
      date: formatDate(3),
      time: '10:00',
      note: 'Token Listrik PLN & Tagihan Wifi',
      createdAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'tx-6',
      type: 'expense',
      amount: 75000,
      categoryId: 'cat-entertainment',
      walletId: 'wal-cash',
      date: formatDate(4),
      time: '20:30',
      note: 'Nonton Bioskop Weekend',
      createdAt: Date.now() - 86400000 * 4,
    },
    {
      id: 'tx-7',
      type: 'income',
      amount: 14000000,
      categoryId: 'cat-salary',
      walletId: 'wal-bca',
      date: formatDate(10),
      time: '09:00',
      note: 'Gaji Bulanan PT Maju Bersama',
      createdAt: Date.now() - 86400000 * 10,
    },
    {
      id: 'tx-8',
      type: 'expense',
      amount: 500000,
      categoryId: 'cat-charity',
      walletId: 'wal-bca',
      date: formatDate(11),
      time: '11:20',
      note: 'Kirim uang jajan orang tua',
      createdAt: Date.now() - 86400000 * 11,
    },
    {
      id: 'tx-9',
      type: 'transfer',
      amount: 1000000,
      categoryId: '',
      walletId: 'wal-bca',
      targetWalletId: 'wal-invest',
      date: formatDate(5),
      time: '15:00',
      note: 'Topup rutin Bibit Reksadana',
      createdAt: Date.now() - 86400000 * 5,
    },
  ];
};
