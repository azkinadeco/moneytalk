import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  Transaction,
  Category,
  Wallet,
  Budget,
  FinancialGoal,
  RecurringTransaction,
  DebtItem,
  AppTheme,
  UserProfile,
  AchievementBadge,
  TransactionType,
  InvestmentAsset,
  ShoppingItem,
  ToastNotification,
  ToastAction,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_WALLETS,
  INITIAL_GOALS,
  INITIAL_BUDGETS,
  INITIAL_RECURRING,
  INITIAL_DEBTS,
  getInitialTransactions,
} from '../utils/initialData';
import { getCurrentMonthString, getTodayDateString, formatIDR } from '../utils/format';
import { sounds } from '../utils/audio';

interface HealthScoreData {
  score: number;
  rating: 'Sempurna' | 'Sangat Baik' | 'Cukup Sehat' | 'Perlu Perhatian' | 'Kritis';
  breakdown: {
    needsPercentage: number;
    wantsPercentage: number;
    savingsPercentage: number;
  };
  details: {
    savingsRateScore: number;
    budgetDisciplineScore: number;
    emergencyFundScore: number;
  };
}

interface MonthComparisonData {
  prevMonth: string;
  currentExpense: number;
  prevExpense: number;
  expenseDiff: number;
  expenseDiffPercent: number;
  currentIncome: number;
  prevIncome: number;
  incomeDiff: number;
  incomeDiffPercent: number;
}

interface FinanceContextType {
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
  budgets: Budget[];
  goals: FinancialGoal[];
  recurring: RecurringTransaction[];
  debts: DebtItem[];
  badges: AchievementBadge[];
  investments: InvestmentAsset[];
  shoppingItems: ShoppingItem[];

  toast: ToastNotification | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error', action?: ToastAction) => void;
  dismissToast: () => void;

  theme: 'dark' | 'light';
  appTheme: AppTheme;
  setAppTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;

  hideBalance: boolean;
  toggleHideBalance: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;

  isAppLocked: boolean;
  pinLockEnabled: boolean;
  appPin: string;
  setAppPin: (pin: string) => void;
  togglePinLock: () => void;
  unlockApp: () => void;
  lockApp: () => void;

  selectedMonth: string;
  setSelectedMonth: (month: string) => void;

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  duplicateTransaction: (tx: Transaction) => void;
  updateReimburseStatus: (id: string, status: 'pending' | 'claimed' | 'received', walletId?: string) => void;

  // Wallets
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  updateWallet: (id: string, wallet: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;

  // Categories (Ubah Kategori & Sumber Pendapatan)
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Goals
  addGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  updateGoal: (id: string, updated: Partial<FinancialGoal>) => void;
  updateGoalAmount: (id: string, amountToAdd: number, walletId?: string) => void;
  deleteGoal: (id: string) => void;

  // Budgets
  setBudgetLimit: (categoryId: string, limit: number) => void;

  // Recurring
  addRecurring: (rec: Omit<RecurringTransaction, 'id'>) => void;
  updateRecurring: (id: string, rec: Partial<RecurringTransaction>) => void;
  toggleRecurring: (id: string) => void;
  deleteRecurring: (id: string) => void;
  executeRecurring: (id: string) => void;

  // Debts
  addDebt: (debt: Omit<DebtItem, 'id' | 'createdAt' | 'isCompleted'>) => void;
  payDebt: (id: string, paymentAmount: number, walletId?: string) => void;
  deleteDebt: (id: string) => void;

  // Investments (Batch 71 Persistence)
  addInvestment: (asset: Omit<InvestmentAsset, 'id'>) => void;
  updateInvestment: (id: string, asset: Partial<InvestmentAsset>) => void;
  deleteInvestment: (id: string) => void;

  // Shopping List (Batch 71 Persistence)
  addShoppingItem: (item: Omit<ShoppingItem, 'id'>) => void;
  toggleShoppingItem: (id: string) => void;
  deleteShoppingItem: (id: string) => void;
  clearBoughtShoppingItems: () => void;

  // Computed
  getWalletBalance: (walletId: string) => number;
  totalBalance: number;
  monthlyStats: {
    income: number;
    expense: number;
    netSavings: number;
    savingsRate: number;
  };
  healthScoreData: HealthScoreData;
  monthComparison: MonthComparisonData;

  // System
  resetData: () => void;
  clearAllData: () => void;
  exportJSON: () => void;
  importJSON: (jsonString: string) => boolean;
  exportCSV: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'moneytalk_profile_v3',
  TRANSACTIONS: 'moneytalk_tx_v3',
  CATEGORIES: 'moneytalk_cat_v3',
  WALLETS: 'moneytalk_wal_v3',
  BUDGETS: 'moneytalk_bud_v3',
  GOALS: 'moneytalk_goal_v3',
  RECURRING: 'moneytalk_rec_v3',
  DEBTS: 'moneytalk_debts_v3',
  INVESTMENTS: 'moneytalk_inv_v3',
  SHOPPING: 'moneytalk_shop_v3',
  THEME: 'moneytalk_theme_v3',
  APP_THEME: 'moneytalk_app_theme_v3',
  HIDE_BALANCE: 'moneytalk_hide_bal_v3',
  SOUND: 'moneytalk_sound_v3',
  PIN_LOCK_ENABLED: 'moneytalk_pin_enabled_v3',
  APP_PIN: 'moneytalk_app_pin_v3',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Budi Pratama',
  title: 'Pengatur Keuangan Cerdas',
  avatar: '💼',
  monthlyIncomeTarget: 15000000,
};

const INITIAL_INVESTMENTS: InvestmentAsset[] = [
  {
    id: 'inv-1',
    name: 'Reksadana Pasar Uang & Obligasi',
    type: 'mutual_fund',
    investedValue: 15000000,
    currentValue: 16120000,
    institution: 'Bibit (Robo)',
    color: '#059669',
  },
  {
    id: 'inv-2',
    name: 'Saham Bluechip BBCA & BBRI',
    type: 'stocks',
    investedValue: 12000000,
    currentValue: 13450000,
    institution: 'Ajaib Sekuritas',
    color: '#3B82F6',
  },
  {
    id: 'inv-3',
    name: 'Emas Logam Mulia Antam (10g)',
    type: 'gold',
    investedValue: 13500000,
    currentValue: 15200000,
    institution: 'Brankas Antam',
    color: '#F59E0B',
  },
];

const INITIAL_SHOPPING: ShoppingItem[] = [
  { id: '1', name: 'Beras Premium 5kg', estimatedPrice: 78000, isBought: true },
  { id: '2', name: 'Minyak Goreng Sania 2L', estimatedPrice: 34500, isBought: true },
  { id: '3', name: 'Daging Ayam Fillet 1kg', estimatedPrice: 48000, isBought: false },
  { id: '4', name: 'Telur Ayam 1 Tray (10 butir)', estimatedPrice: 28000, isBought: false },
  { id: '5', name: 'Kopi Arabika Ground 250g', estimatedPrice: 55000, isBought: false },
];

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [appTheme, setAppThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APP_THEME) as AppTheme;
    return saved || 'dark';
  });

  const [hideBalance, setHideBalance] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.HIDE_BALANCE) === 'true';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
    return saved !== null ? saved === 'true' : true;
  });

  const [pinLockEnabled, setPinLockEnabled] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.PIN_LOCK_ENABLED) === 'true';
  });

  const [appPin, setAppPinState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.APP_PIN) || '1234';
  });

  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.PIN_LOCK_ENABLED) === 'true';
  });
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());

  const [toast, setToast] = useState<ToastNotification | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissToast = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  };
  const showToast = (
    message: string,
    type: 'success' | 'info' | 'error' = 'success',
    action?: ToastAction
  ) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: String(Date.now()), message, type, action });
    if (type === 'error') sounds.playPop();
    sounds.vibrate(type === 'error' ? 30 : 15);
    toastTimer.current = setTimeout(() => setToast(null), action ? 5000 : 2800);
  };

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WALLETS);
    return saved ? JSON.parse(saved) : INITIAL_WALLETS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [recurring, setRecurring] = useState<RecurringTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECURRING);
    return saved ? JSON.parse(saved) : INITIAL_RECURRING;
  });

  const [debts, setDebts] = useState<DebtItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEBTS);
    return saved ? JSON.parse(saved) : INITIAL_DEBTS;
  });

  const [investments, setInvestments] = useState<InvestmentAsset[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVESTMENTS);
    return saved ? JSON.parse(saved) : INITIAL_INVESTMENTS;
  });

  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHOPPING);
    return saved ? JSON.parse(saved) : INITIAL_SHOPPING;
  });

  const [rawTransactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : getInitialTransactions();
  });

  // Always expose transactions newest-first (date, then time, then creation order)
  const transactions = useMemo(
    () =>
      [...rawTransactions].sort((a, b) => {
        const byDate = b.date.localeCompare(a.date);
        if (byDate !== 0) return byDate;
        const byTime = (b.time || '').localeCompare(a.time || '');
        if (byTime !== 0) return byTime;
        return (b.createdAt || 0) - (a.createdAt || 0);
      }),
    [rawTransactions]
  );

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(rawTransactions));
  }, [rawTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }, [budgets]);

  // Budgets roll over: when a new month starts with no limits, copy the latest month's limits
  useEffect(() => {
    if (selectedMonth < getCurrentMonthString()) return;
    if (budgets.some(b => b.month === selectedMonth)) return;
    const previousMonths = budgets.map(b => b.month).filter(m => m < selectedMonth).sort();
    const latest = previousMonths[previousMonths.length - 1];
    if (!latest) return;
    const carried = budgets
      .filter(b => b.month === latest)
      .map((b, i) => ({ ...b, id: `b-${Date.now()}-${i}`, month: selectedMonth }));
    setBudgets(prev => [...prev, ...carried]);
  }, [selectedMonth, budgets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurring));
  }, [recurring]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(shoppingItems));
  }, [shoppingItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APP_THEME, appTheme);
    const root = document.documentElement;
    if (appTheme === 'light') {
      root.classList.remove('dark');
      root.classList.remove('theme-oled');
    } else {
      root.classList.add('dark');
      if (appTheme === 'oled') {
        root.classList.add('theme-oled');
      } else {
        root.classList.remove('theme-oled');
      }
    }
  }, [appTheme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HIDE_BALANCE, String(hideBalance));
  }, [hideBalance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND, String(soundEnabled));
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PIN_LOCK_ENABLED, String(pinLockEnabled));
  }, [pinLockEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APP_PIN, appPin);
  }, [appPin]);

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...profile }));
    sounds.playPop();
  };

  const toggleTheme = () => {
    setAppThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setAppTheme = (t: AppTheme) => {
    setAppThemeState(t);
  };

  const setAppPin = (newPin: string) => {
    setAppPinState(newPin);
    sounds.playSuccess();
  };

  const toggleHideBalance = () => setHideBalance(prev => !prev);
  const toggleSound = () => setSoundEnabled(prev => !prev);
  const togglePinLock = () => setPinLockEnabled(prev => !prev);
  const unlockApp = () => setIsAppLocked(false);
  const lockApp = () => setIsAppLocked(true);

  // Live balance
  const getWalletBalance = (walletId: string): number => {
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return 0;

    let balance = wallet.initialBalance;
    for (const tx of transactions) {
      if (tx.type === 'income' && tx.walletId === walletId) {
        balance += tx.amount;
      } else if (tx.type === 'expense' && tx.walletId === walletId) {
        balance -= tx.amount;
      } else if (tx.type === 'transfer') {
        if (tx.walletId === walletId) balance -= tx.amount;
        if (tx.targetWalletId === walletId) balance += tx.amount;
      }
    }
    return balance;
  };

  const totalBalance = wallets.reduce((acc, w) => acc + getWalletBalance(w.id), 0);

  // Monthly stats
  const monthlyStats = useMemo(() => {
    let income = 0;
    let expense = 0;

    for (const tx of transactions) {
      if (tx.date.startsWith(selectedMonth)) {
        if (tx.type === 'income') income += tx.amount;
        else if (tx.type === 'expense') expense += tx.amount;
      }
    }

    const netSavings = income - expense;
    const savingsRate = income > 0 ? Math.round((netSavings / income) * 100) : 0;
    return { income, expense, netSavings, savingsRate };
  }, [transactions, selectedMonth]);

  // Month over Month (MoM) Comparison Engine
  const monthComparison = useMemo<MonthComparisonData>(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonthStr = `${prevYear}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    let prevIncome = 0;
    let prevExpense = 0;

    for (const tx of transactions) {
      if (tx.date.startsWith(prevMonthStr)) {
        if (tx.type === 'income') prevIncome += tx.amount;
        else if (tx.type === 'expense') prevExpense += tx.amount;
      }
    }

    const currentExpense = monthlyStats.expense;
    const currentIncome = monthlyStats.income;

    const expenseDiff = currentExpense - prevExpense;
    const expenseDiffPercent = prevExpense > 0 ? Math.round((expenseDiff / prevExpense) * 100) : 0;

    const incomeDiff = currentIncome - prevIncome;
    const incomeDiffPercent = prevIncome > 0 ? Math.round((incomeDiff / prevIncome) * 100) : 0;

    return {
      prevMonth: prevMonthStr,
      currentExpense,
      prevExpense,
      expenseDiff,
      expenseDiffPercent,
      currentIncome,
      prevIncome,
      incomeDiff,
      incomeDiffPercent,
    };
  }, [transactions, selectedMonth, monthlyStats]);

  // Financial Health Score
  const healthScoreData = useMemo<HealthScoreData>(() => {
    const { income, expense, savingsRate } = monthlyStats;

    const monthExpenses = transactions.filter(
      t => t.type === 'expense' && t.date.startsWith(selectedMonth)
    );

    let needs = 0;
    let wants = 0;
    const needsIds = ['cat-food', 'cat-transport', 'cat-bills', 'cat-health', 'cat-charity'];

    for (const tx of monthExpenses) {
      if (needsIds.includes(tx.categoryId)) {
        needs += tx.amount;
      } else {
        wants += tx.amount;
      }
    }

    const baseIncome = Math.max(income, expense);
    const needsPercentage = baseIncome > 0 ? Math.round((needs / baseIncome) * 100) : 0;
    const wantsPercentage = baseIncome > 0 ? Math.round((wants / baseIncome) * 100) : 0;
    const savingsPercentage = Math.max(0, 100 - needsPercentage - wantsPercentage);

    const savingsRateScore = Math.min(40, Math.max(0, Math.round((savingsRate / 20) * 40)));

    const totalBudget = budgets
      .filter(b => b.month === selectedMonth)
      .reduce((sum, b) => sum + b.limit, 0);
    const budgetDisciplineScore =
      totalBudget > 0
        ? expense <= totalBudget
          ? 35
          : Math.max(0, Math.round(35 - ((expense - totalBudget) / totalBudget) * 35))
        : 25;

    const emergencyGoal = goals.find(g => g.id === 'goal-emergency');
    const emergencyProgress =
      emergencyGoal && emergencyGoal.targetAmount > 0
        ? emergencyGoal.currentAmount / emergencyGoal.targetAmount
        : 0.5;
    const emergencyFundScore = Math.min(25, Math.round(emergencyProgress * 25));

    const totalScore = Math.min(100, Math.max(10, savingsRateScore + budgetDisciplineScore + emergencyFundScore));

    let rating: HealthScoreData['rating'] = 'Cukup Sehat';
    if (totalScore >= 90) rating = 'Sempurna';
    else if (totalScore >= 75) rating = 'Sangat Baik';
    else if (totalScore >= 60) rating = 'Cukup Sehat';
    else if (totalScore >= 45) rating = 'Perlu Perhatian';
    else rating = 'Kritis';

    return {
      score: totalScore,
      rating,
      breakdown: { needsPercentage, wantsPercentage, savingsPercentage },
      details: { savingsRateScore, budgetDisciplineScore, emergencyFundScore },
    };
  }, [monthlyStats, transactions, selectedMonth, budgets, goals]);

  // Dynamic Reactive Achievements & Badges (A-06)
  const badges = useMemo<AchievementBadge[]>(() => {
    const hasTx = transactions.length > 0;
    const isSavingsMaster = monthlyStats.savingsRate >= 30;
    const totalBudgetsLimit = budgets
      .filter(b => b.month === selectedMonth)
      .reduce((sum, b) => sum + b.limit, 0);
    const isBudgetGuard = totalBudgetsLimit > 0 && monthlyStats.expense <= totalBudgetsLimit;
    const isInvestor = investments.length > 0;
    const isDebtFree = debts.length > 0 && debts.every(d => d.isCompleted);

    return [
      {
        id: 'b-first-tx',
        title: 'Langkah Pertama',
        description: 'Mencatat transaksi pertamamu di Money Talk',
        icon: '🌟',
        isUnlocked: hasTx,
        unlockedAt: hasTx ? 'Aktif' : undefined,
      },
      {
        id: 'b-savings-master',
        title: 'Sultan Menabung',
        description: 'Rasio tabungan di atas 30% dalam sebulan',
        icon: '🏆',
        isUnlocked: isSavingsMaster,
        unlockedAt: isSavingsMaster ? `${monthlyStats.savingsRate}% tabungan` : undefined,
      },
      {
        id: 'b-budget-guard',
        title: 'Penjaga Anggaran',
        description: 'Disiplin tidak overbudget sepanjang bulan',
        icon: '🛡️',
        isUnlocked: isBudgetGuard,
        unlockedAt: isBudgetGuard ? 'Bulan ini' : undefined,
      },
      {
        id: 'b-investor',
        title: 'Investor Cerdas',
        description: 'Memiliki instrumen investasi aktif',
        icon: '📈',
        isUnlocked: isInvestor,
        unlockedAt: isInvestor ? `${investments.length} portofolio` : undefined,
      },
      {
        id: 'b-debt-free',
        title: 'Bebas Hutang',
        description: 'Melunasi seluruh catatan hutang',
        icon: '🕊️',
        isUnlocked: isDebtFree,
        unlockedAt: isDebtFree ? 'Semua lunas' : undefined,
      },
    ];
  }, [transactions, monthlyStats, budgets, selectedMonth, investments, debts]);

  // Transaction CRUD
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setTransactions(prev => [newTx, ...prev]);
    sounds.playSuccess();
    sounds.vibrate(30);
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
    sounds.playPop();
  };

  const deleteTransaction = (id: string) => {
    const removed = rawTransactions.find(t => t.id === id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    sounds.vibrate(40);
    if (removed) {
      showToast('Transaksi dihapus', 'info', {
        label: 'Urungkan',
        onClick: () => setTransactions(prev => [removed, ...prev]),
      });
    }
  };

  const duplicateTransaction = (tx: Transaction) => {
    const now = new Date();
    addTransaction({
      type: tx.type,
      amount: tx.amount,
      originalAmount: tx.originalAmount,
      currency: tx.currency,
      categoryId: tx.categoryId,
      walletId: tx.walletId,
      targetWalletId: tx.targetWalletId,
      date: getTodayDateString(),
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      note: tx.note,
      tags: tx.tags,
      isReimburse: tx.isReimburse,
      reimburseStatus: tx.isReimburse ? 'pending' : undefined,
    });
    showToast('Transaksi diduplikat ke hari ini');
  };

  const updateReimburseStatus = (
    id: string,
    status: 'pending' | 'claimed' | 'received',
    walletId?: string
  ) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    const prevStatus = tx.reimburseStatus || 'pending';
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, reimburseStatus: status } : t))
    );

    // If status moved to 'received' and wasn't already 'received', record reimbursement payout into wallet (A-03)
    if (status === 'received' && prevStatus !== 'received') {
      const walletToUse = walletId || tx.walletId || wallets[0]?.id;
      const incCat =
        categories.find(c => c.name.toLowerCase().includes('kantor') || c.type === 'income')?.id ||
        categories.find(c => c.type === 'income')?.id ||
        '';
      const today = getTodayDateString();
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      addTransaction({
        type: 'income',
        amount: tx.amount,
        categoryId: incCat,
        walletId: walletToUse,
        date: today,
        time,
        note: `[Pencairan Klaim Kantor] ${tx.note || 'Reimbursement'}`,
      });
      showToast(`Dana reimburse ${formatIDR(tx.amount)} berhasil dicairkan ke saldo!`, 'success');
    }

    sounds.playPop();
  };

  // Wallet CRUD (Edit & Ubah Rekening)
  const addWallet = (wallet: Omit<Wallet, 'id'>) => {
    const newWallet: Wallet = { ...wallet, id: `wal-${Date.now()}` };
    setWallets(prev => [...prev, newWallet]);
    sounds.playSuccess();
    showToast(`Dompet "${wallet.name}" berhasil ditambahkan`);
  };

  const updateWallet = (id: string, updated: Partial<Wallet>) => {
    setWallets(prev => prev.map(w => (w.id === id ? { ...w, ...updated } : w)));
    sounds.playSuccess();
    showToast('Dompet berhasil diperbarui');
  };

  const deleteWallet = (id: string) => {
    const remaining = wallets.filter(w => w.id !== id);
    if (remaining.length === 0) {
      showToast('Minimal harus ada 1 dompet aktif', 'error');
      return;
    }
    const fallbackWallet = remaining[0];
    // Reassign transactions to fallbackWallet so balance and history aren't broken (A-04)
    setTransactions(prev =>
      prev.map(t => {
        let updated = { ...t };
        if (updated.walletId === id) updated.walletId = fallbackWallet.id;
        if (updated.targetWalletId === id) updated.targetWalletId = fallbackWallet.id;
        return updated;
      })
    );
    setWallets(remaining);
    showToast(`Dompet dihapus. Transaksi dialihkan ke ${fallbackWallet.name}`);
  };

  // Category CRUD (Ubah Kategori & Sumber Pendapatan)
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = { ...cat, id: `cat-${Date.now()}` };
    setCategories(prev => [...prev, newCat]);
    sounds.playSuccess();
    showToast(`Kategori "${cat.name}" berhasil dibuat`);
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updated } : c)));
    sounds.playSuccess();
    showToast('Kategori berhasil diperbarui');
  };

  const deleteCategory = (id: string) => {
    const catToDelete = categories.find(c => c.id === id);
    if (!catToDelete) return;
    const remaining = categories.filter(c => c.id !== id);
    const fallbackCat = remaining.find(c => c.type === catToDelete.type) || remaining[0];
    if (fallbackCat) {
      setTransactions(prev =>
        prev.map(t => (t.categoryId === id ? { ...t, categoryId: fallbackCat.id } : t))
      );
    }
    setCategories(remaining);
    showToast(`Kategori dihapus. Transaksi dialihkan ke ${fallbackCat?.name || 'Kategori'}`);
  };

  // Goals CRUD (Edit & Ubah Target)
  const addGoal = (goal: Omit<FinancialGoal, 'id'>) => {
    const newGoal: FinancialGoal = { ...goal, id: `goal-${Date.now()}` };
    setGoals(prev => [...prev, newGoal]);
    sounds.playSuccess();
    showToast(`Target "${goal.title}" dibuat`);
  };

  const updateGoal = (id: string, updated: Partial<FinancialGoal>) => {
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, ...updated } : g)));
    sounds.playSuccess();
    showToast('Target impian diperbarui');
  };

  const updateGoalAmount = (id: string, amountToAdd: number, walletId?: string) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    setGoals(prev =>
      prev.map(g =>
        g.id === id ? { ...g, currentAmount: Math.max(0, g.currentAmount + amountToAdd) } : g
      )
    );

    // Ledger Movement: sync to wallet balance (A-03)
    const targetWalletId = walletId || wallets[0]?.id;
    if (targetWalletId && amountToAdd !== 0) {
      const today = getTodayDateString();
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (amountToAdd > 0) {
        // Setor tabungan: Money deducted from wallet
        const expCat = categories.find(c => c.type === 'expense')?.id || '';
        addTransaction({
          type: 'expense',
          amount: amountToAdd,
          categoryId: expCat,
          walletId: targetWalletId,
          date: today,
          time,
          note: `[Tabungan Impian] ${goal.title}`,
        });
        showToast(`Disetor ${formatIDR(amountToAdd)} ke tabungan "${goal.title}"`);
      } else {
        // Tarik tabungan: Money returned to wallet
        const incCat = categories.find(c => c.type === 'income')?.id || '';
        addTransaction({
          type: 'income',
          amount: Math.abs(amountToAdd),
          categoryId: incCat,
          walletId: targetWalletId,
          date: today,
          time,
          note: `[Tarik Tabungan] ${goal.title}`,
        });
        showToast(`Ditarik ${formatIDR(Math.abs(amountToAdd))} dari tabungan "${goal.title}"`);
      }
    }

    sounds.playSuccess();
    sounds.vibrate(30);
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    showToast('Target tabungan dihapus');
  };

  // Budgets
  const setBudgetLimit = (categoryId: string, limit: number) => {
    setBudgets(prev => {
      const existing = prev.find(b => b.categoryId === categoryId && b.month === selectedMonth);
      if (existing) {
        return prev.map(b => (b.id === existing.id ? { ...b, limit } : b));
      }
      return [...prev, { id: `b-${Date.now()}`, categoryId, limit, month: selectedMonth }];
    });
    sounds.playPop();
  };

  // Recurring Transactions (Edit & Ubah Langganan)
  const addRecurring = (rec: Omit<RecurringTransaction, 'id'>) => {
    const newRec: RecurringTransaction = { ...rec, id: `rec-${Date.now()}` };
    setRecurring(prev => [...prev, newRec]);
    sounds.playSuccess();
    showToast(`Tagihan "${rec.name}" berhasil dibuat`);
  };

  const updateRecurring = (id: string, updated: Partial<RecurringTransaction>) => {
    setRecurring(prev => prev.map(r => (r.id === id ? { ...r, ...updated } : r)));
    sounds.playSuccess();
  };

  const toggleRecurring = (id: string) => {
    setRecurring(prev => prev.map(r => (r.id === id ? { ...r, isActive: !r.isActive } : r)));
    sounds.playPop();
  };

  const deleteRecurring = (id: string) => {
    setRecurring(prev => prev.filter(r => r.id !== id));
    showToast('Tagihan rutin dihapus');
  };

  const executeRecurring = (id: string) => {
    const rec = recurring.find(r => r.id === id);
    if (!rec) return;

    const today = getTodayDateString();
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    addTransaction({
      type: rec.type,
      amount: rec.amount,
      categoryId: rec.categoryId,
      walletId: rec.walletId,
      date: today,
      time,
      note: `[Otomatis] ${rec.name}`,
    });

    setRecurring(prev => prev.map(r => (r.id === id ? { ...r, lastExecuted: today } : r)));
    showToast(`Tagihan "${rec.name}" berhasil dicatat`);
  };

  // Debts CRUD
  const addDebt = (debt: Omit<DebtItem, 'id' | 'createdAt' | 'isCompleted'>) => {
    const newDebt: DebtItem = {
      ...debt,
      id: `debt-${Date.now()}`,
      createdAt: Date.now(),
      isCompleted: debt.paidAmount >= debt.amount,
    };
    setDebts(prev => [newDebt, ...prev]);
    sounds.playSuccess();
    showToast(`Catatan ${debt.type === 'receivable' ? 'piutang' : 'hutang'} berhasil disimpan`);
  };

  const payDebt = (id: string, paymentAmount: number, walletId?: string) => {
    const debt = debts.find(d => d.id === id);
    if (!debt || paymentAmount <= 0) return;

    const newPaid = Math.min(debt.amount, debt.paidAmount + paymentAmount);
    setDebts(prev =>
      prev.map(d => (d.id === id ? { ...d, paidAmount: newPaid, isCompleted: newPaid >= d.amount } : d))
    );

    // Auto ledger transaction if wallet provided (A-03)
    const targetWalletId = walletId || wallets[0]?.id;
    if (targetWalletId) {
      const today = getTodayDateString();
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (debt.type === 'payable') {
        const expCat = categories.find(c => c.type === 'expense')?.id || '';
        addTransaction({
          type: 'expense',
          amount: paymentAmount,
          categoryId: expCat,
          walletId: targetWalletId,
          date: today,
          time,
          note: `[Cicilan Hutang] ke ${debt.personName}`,
        });
        showToast(`Cicilan ${formatIDR(paymentAmount)} ke ${debt.personName} dibukukan!`);
      } else {
        const incCat = categories.find(c => c.type === 'income')?.id || '';
        addTransaction({
          type: 'income',
          amount: paymentAmount,
          categoryId: incCat,
          walletId: targetWalletId,
          date: today,
          time,
          note: `[Terima Piutang] dari ${debt.personName}`,
        });
        showToast(`Pelunasan ${formatIDR(paymentAmount)} dari ${debt.personName} masuk ke kas!`);
      }
    }

    sounds.playSuccess();
  };

  const deleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
    showToast('Catatan hutang/piutang dihapus');
  };

  // Investments CRUD (A-02)
  const addInvestment = (asset: Omit<InvestmentAsset, 'id'>) => {
    const newAsset: InvestmentAsset = { ...asset, id: `inv-${Date.now()}` };
    setInvestments(prev => [...prev, newAsset]);
    sounds.playSuccess();
    showToast(`Aset "${asset.name}" berhasil ditambahkan`);
  };

  const updateInvestment = (id: string, asset: Partial<InvestmentAsset>) => {
    setInvestments(prev => prev.map(a => (a.id === id ? { ...a, ...asset } : a)));
    sounds.playSuccess();
    showToast('Aset investasi diperbarui');
  };

  const deleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(a => a.id !== id));
    showToast('Aset investasi dihapus');
  };

  // Shopping List CRUD (A-02)
  const addShoppingItem = (item: Omit<ShoppingItem, 'id'>) => {
    const newItem: ShoppingItem = { ...item, id: String(Date.now()) };
    setShoppingItems(prev => [...prev, newItem]);
    sounds.playPop();
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingItems(prev =>
      prev.map(it => (it.id === id ? { ...it, isBought: !it.isBought } : it))
    );
    sounds.playPop();
  };

  const deleteShoppingItem = (id: string) => {
    setShoppingItems(prev => prev.filter(it => it.id !== id));
  };

  const clearBoughtShoppingItems = () => {
    setShoppingItems(prev => prev.filter(it => !it.isBought));
    showToast('Barang terbeli dibersihkan');
  };

  // Reset
  const resetData = () => {
    setTransactions(getInitialTransactions());
    setCategories(INITIAL_CATEGORIES);
    setWallets(INITIAL_WALLETS);
    setBudgets(INITIAL_BUDGETS);
    setGoals(INITIAL_GOALS);
    setRecurring(INITIAL_RECURRING);
    setDebts(INITIAL_DEBTS);
    setInvestments(INITIAL_INVESTMENTS);
    setShoppingItems(INITIAL_SHOPPING);
    setUserProfile(DEFAULT_PROFILE);
    sounds.playPop();
  };

  // Start fresh: keep categories & wallets (balances zeroed), wipe all records
  const clearAllData = () => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setRecurring([]);
    setDebts([]);
    setInvestments([]);
    setShoppingItems([]);
    setWallets(prev => prev.map(w => ({ ...w, initialBalance: 0 })));
    showToast('Semua data dikosongkan. Selamat mulai dari nol!');
  };

  // Export JSON
  const exportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      userProfile,
      transactions,
      categories,
      wallets,
      budgets,
      goals,
      recurring,
      debts,
      investments,
      shoppingItems,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneytalk_backup_${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup (F-07 Data Protection)
  const importJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        throw new Error('Format file tidak valid');
      }

      if (data.transactions && Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      }
      if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
      if (data.wallets && Array.isArray(data.wallets)) {
        setWallets(data.wallets);
      }
      if (data.budgets && Array.isArray(data.budgets)) {
        setBudgets(data.budgets);
      }
      if (data.goals && Array.isArray(data.goals)) {
        setGoals(data.goals);
      }
      if (data.recurring && Array.isArray(data.recurring)) {
        setRecurring(data.recurring);
      }
      if (data.debts && Array.isArray(data.debts)) {
        setDebts(data.debts);
      }
      if (data.investments && Array.isArray(data.investments)) {
        setInvestments(data.investments);
      }
      if (data.shoppingItems && Array.isArray(data.shoppingItems)) {
        setShoppingItems(data.shoppingItems);
      }
      if (data.userProfile && typeof data.userProfile === 'object') {
        setUserProfile(data.userProfile);
      }

      sounds.playSuccess();
      return true;
    } catch (err) {
      console.error('Import backup failed:', err);
      return false;
    }
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['Tanggal', 'Waktu', 'Tipe', 'Kategori', 'Dompet', 'Nominal (IDR)', 'Catatan'];
    const rows = transactions.map(t => {
      const cat = categories.find(c => c.id === t.categoryId)?.name || (t.type === 'transfer' ? 'Transfer' : '-');
      const wal = wallets.find(w => w.id === t.walletId)?.name || '-';
      const targetWal = t.targetWalletId ? wallets.find(w => w.id === t.targetWalletId)?.name : '';
      const walStr = targetWal ? `${wal} -> ${targetWal}` : wal;
      return [
        t.date,
        t.time || '',
        t.type === 'expense' ? 'Pengeluaran' : t.type === 'income' ? 'Pemasukan' : 'Transfer',
        `"${cat}"`,
        `"${walStr}"`,
        t.amount,
        `"${(t.note || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneytalk_transaksi_${getTodayDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <FinanceContext.Provider
      value={{
        userProfile,
        updateUserProfile,
        transactions,
        categories,
        wallets,
        budgets,
        goals,
        recurring,
        debts,
        badges,
        investments,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        shoppingItems,
        addShoppingItem,
        toggleShoppingItem,
        deleteShoppingItem,
        clearBoughtShoppingItems,
        toast,
        showToast,
        dismissToast,
        theme: appTheme === 'light' ? 'light' : 'dark',
        appTheme,
        setAppTheme,
        toggleTheme,
        hideBalance,
        toggleHideBalance,
        soundEnabled,
        toggleSound,
        isAppLocked,
        pinLockEnabled,
        appPin,
        setAppPin,
        togglePinLock,
        unlockApp,
        lockApp,
        selectedMonth,
        setSelectedMonth,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        duplicateTransaction,
        updateReimburseStatus,
        addWallet,
        updateWallet,
        deleteWallet,
        addCategory,
        updateCategory,
        deleteCategory,
        addGoal,
        updateGoal,
        updateGoalAmount,
        deleteGoal,
        setBudgetLimit,
        addRecurring,
        updateRecurring,
        toggleRecurring,
        deleteRecurring,
        executeRecurring,
        addDebt,
        payDebt,
        deleteDebt,
        getWalletBalance,
        totalBalance,
        monthlyStats,
        healthScoreData,
        monthComparison,
        resetData,
        clearAllData,
        exportJSON,
        importJSON,
        exportCSV,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
