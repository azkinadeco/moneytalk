export type TransactionType = 'expense' | 'income' | 'transfer';
export type CurrencyCode = 'IDR' | 'USD' | 'SGD' | 'JPY' | 'EUR' | 'MYR';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // stored in base IDR
  originalAmount?: number; // if foreign currency used
  currency?: CurrencyCode;
  categoryId: string;
  walletId: string;
  targetWalletId?: string; // used when type === 'transfer'
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  note: string;
  createdAt: number;
  tags?: string[]; // Batch 21: Tags e.g. ['#kantor', '#liburan']
  isReimburse?: boolean; // Batch 23: Reimbursement flag
  reimburseStatus?: 'pending' | 'claimed' | 'received';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
}

export type WalletType = 'bank' | 'cash' | 'ewallet' | 'investment';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  initialBalance: number;
  color: string;
  icon: string;
  accountNumber?: string;
  currency?: CurrencyCode;
}

export interface Budget {
  id: string;
  categoryId: string;
  limit: number;
  month: string; // YYYY-MM
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon: string;
  color: string;
}

export interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  type: 'expense' | 'income';
  categoryId: string;
  walletId: string;
  frequency: 'monthly' | 'weekly' | 'yearly';
  dayOfMonth: number; // 1 - 31
  isActive: boolean;
  lastExecuted?: string;
}

export interface DebtItem {
  id: string;
  type: 'payable' | 'receivable';
  personName: string;
  amount: number;
  paidAmount: number;
  dueDate?: string;
  note: string;
  createdAt: number;
  isCompleted: boolean;
}

export interface SplitBillMember {
  id: string;
  name: string;
  amount: number;
  isPaid: boolean;
}

export interface SplitBill {
  id: string;
  title: string;
  totalAmount: number;
  taxPercent: number;
  servicePercent: number;
  members: SplitBillMember[];
  createdAt: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  estimatedPrice: number;
  isBought: boolean;
}

export interface InvestmentAsset {
  id: string;
  name: string;
  type: 'stocks' | 'mutual_fund' | 'crypto' | 'gold' | 'property';
  investedValue: number;
  currentValue: number;
  institution: string;
  color: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success';
  timestamp: number;
  isRead: boolean;
}

export interface UserProfile {
  name: string;
  title: string;
  avatar: string;
  monthlyIncomeTarget?: number;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export type AppTheme = 'dark' | 'light' | 'oled' | 'indigo' | 'emerald';

export type TabType =
  | 'dashboard'
  | 'transactions'
  | 'analytics'
  | 'wallets'
  | 'goals'
  | 'debts'
  | 'calendar'
  | 'splitbill'
  | 'shopping'
  | 'investments'
  | 'advisor'
  | 'settings'
  | 'reimburse'
  | 'simulator';
