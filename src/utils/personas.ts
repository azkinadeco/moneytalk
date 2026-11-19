import { Category, Wallet, FinancialGoal, Budget, Transaction, RecurringTransaction } from '../types';
import { getTodayDateString, getCurrentMonthString } from './format';

export interface PersonaData {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  categories: Category[];
  wallets: Wallet[];
  goals: FinancialGoal[];
  budgets: Budget[];
  recurring: RecurringTransaction[];
  transactions: Transaction[];
}

const today = getTodayDateString();

export const PERSONA_PRESETS: PersonaData[] = [
  {
    id: 'student',
    name: 'Rian (Anak Kost / Mahasiswa)',
    role: 'Mahasiswa Tingkat Akhir',
    description: 'Fokus pada hemat uang bulanan kost, jajan kopi hemat, dan nabung beli laptop.',
    avatar: '🎓',
    wallets: [
      { id: 'wal-bca-s', name: 'BCA Mahasiswa', type: 'bank', initialBalance: 1850000, color: '#00529B', icon: 'Landmark', accountNumber: '••• 1092' },
      { id: 'wal-cash-s', name: 'Uang Saku Tunai', type: 'cash', initialBalance: 250000, color: '#10B981', icon: 'Wallet' },
      { id: 'wal-gopay-s', name: 'GoPay Jajan', type: 'ewallet', initialBalance: 120000, color: '#00AED6', icon: 'Smartphone' },
    ],
    categories: [
      { id: 'cat-s-food', name: 'Makan Kost & Warteg', icon: 'Utensils', color: '#F97316', type: 'expense' },
      { id: 'cat-s-transport', name: 'Bensin Motor & Ojol', icon: 'Car', color: '#3B82F6', type: 'expense' },
      { id: 'cat-s-college', name: 'Print & Buku Kuliah', icon: 'GraduationCap', color: '#06B6D4', type: 'expense' },
      { id: 'cat-s-bills', name: 'Sewa Kost & Wifi', icon: 'Zap', color: '#EAB308', type: 'expense' },
      { id: 'cat-s-hangout', name: 'Nongkrong & Kopi', icon: 'Coffee', color: '#8B5CF6', type: 'expense' },
      { id: 'cat-s-allowance', name: 'Kiriman Orang Tua', icon: 'Gift', color: '#10B981', type: 'income' },
      { id: 'cat-s-sidejob', name: 'Jaga Booth / Side Job', icon: 'Laptop', color: '#3B82F6', type: 'income' },
    ],
    budgets: [
      { id: 'b-s-1', categoryId: 'cat-s-food', limit: 1200000, month: getCurrentMonthString() },
      { id: 'b-s-2', categoryId: 'cat-s-hangout', limit: 350000, month: getCurrentMonthString() },
    ],
    goals: [
      { id: 'g-s-1', title: 'Beli Laptop Skripsi', targetAmount: 8500000, currentAmount: 5200000, icon: 'Laptop', color: '#3B82F6' },
      { id: 'g-s-2', title: 'Liburan Akhir Semester', targetAmount: 2500000, currentAmount: 1800000, icon: 'Plane', color: '#10B981' },
    ],
    recurring: [
      { id: 'rec-s-1', name: 'Sewa Kamar Kost', amount: 850000, type: 'expense', categoryId: 'cat-s-bills', walletId: 'wal-bca-s', frequency: 'monthly', dayOfMonth: 1, isActive: true },
      { id: 'rec-s-2', name: 'Paket Data Internet', amount: 95000, type: 'expense', categoryId: 'cat-s-bills', walletId: 'wal-gopay-s', frequency: 'monthly', dayOfMonth: 10, isActive: true },
    ],
    transactions: [
      { id: 'tx-s-1', type: 'income', amount: 2500000, categoryId: 'cat-s-allowance', walletId: 'wal-bca-s', date: today, time: '09:00', note: 'Kiriman bulanan orang tua', createdAt: Date.now() },
      { id: 'tx-s-2', type: 'expense', amount: 18000, categoryId: 'cat-s-food', walletId: 'wal-cash-s', date: today, time: '12:30', note: 'Makan nasi ayam warteg', createdAt: Date.now() - 3600000 },
      { id: 'tx-s-3', type: 'expense', amount: 25000, categoryId: 'cat-s-transport', walletId: 'wal-gopay-s', date: today, time: '15:00', note: 'Isi pertalite motor', createdAt: Date.now() - 7200000 },
    ],
  },
  {
    id: 'freelancer',
    name: 'Maya (Digital Nomad / Freelancer)',
    role: 'UI/UX Designer & Remote Worker',
    description: 'Banyak pemasukan proyek klien, belanja gadget, dan investasi saham & kripto.',
    avatar: '💻',
    wallets: [
      { id: 'wal-m-bca', name: 'BCA Bisnis', type: 'bank', initialBalance: 24500000, color: '#00529B', icon: 'Landmark', accountNumber: '••• 9912' },
      { id: 'wal-m-bibit', name: 'Portofolio Bibit', type: 'investment', initialBalance: 35000000, color: '#059669', icon: 'TrendingUp' },
      { id: 'wal-m-gopay', name: 'GoPay Daily', type: 'ewallet', initialBalance: 850000, color: '#00AED6', icon: 'Smartphone' },
    ],
    categories: [
      { id: 'cat-m-food', name: 'Cafe & Co-working', icon: 'Coffee', color: '#F97316', type: 'expense' },
      { id: 'cat-m-soft', name: 'SaaS & Adobe Figma', icon: 'Laptop', color: '#8B5CF6', type: 'expense' },
      { id: 'cat-m-travel', name: 'Workation & Travel', icon: 'Plane', color: '#3B82F6', type: 'expense' },
      { id: 'cat-m-gadget', name: 'Hardware & Gadget', icon: 'Smartphone', color: '#EC4899', type: 'expense' },
      { id: 'cat-m-client', name: 'Klien Project Remotely', icon: 'Briefcase', color: '#10B981', type: 'income' },
      { id: 'cat-m-invest', name: 'Dividen Saham', icon: 'TrendingUp', color: '#06B6D4', type: 'income' },
    ],
    budgets: [
      { id: 'b-m-1', categoryId: 'cat-m-food', limit: 2500000, month: getCurrentMonthString() },
      { id: 'b-m-2', categoryId: 'cat-m-soft', limit: 800000, month: getCurrentMonthString() },
    ],
    goals: [
      { id: 'g-m-1', title: 'Dana Darurat 12 Bulan', targetAmount: 60000000, currentAmount: 42000000, icon: 'ShieldCheck', color: '#10B981' },
      { id: 'g-m-2', title: 'Setup Studio Display', targetAmount: 28000000, currentAmount: 20000000, icon: 'Smartphone', color: '#8B5CF6' },
    ],
    recurring: [
      { id: 'rec-m-1', name: 'Adobe Creative Cloud', amount: 450000, type: 'expense', categoryId: 'cat-m-soft', walletId: 'wal-m-bca', frequency: 'monthly', dayOfMonth: 12, isActive: true },
      { id: 'rec-m-2', name: 'Figma Pro Team', amount: 180000, type: 'expense', categoryId: 'cat-m-soft', walletId: 'wal-m-bca', frequency: 'monthly', dayOfMonth: 15, isActive: true },
    ],
    transactions: [
      { id: 'tx-m-1', type: 'income', amount: 18500000, categoryId: 'cat-m-client', walletId: 'wal-m-bca', date: today, time: '10:00', note: 'Invoice selesai Client FinTech SG', createdAt: Date.now() },
      { id: 'tx-m-2', type: 'expense', amount: 65000, categoryId: 'cat-m-food', walletId: 'wal-m-gopay', date: today, time: '13:00', note: 'Iced Latte di Workstation Cafe', createdAt: Date.now() - 3600000 },
    ],
  },
];
