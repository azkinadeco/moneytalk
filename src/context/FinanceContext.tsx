import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
import { getCurrentMonthString, getTodayDateString } from '../utils/format';
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
  updateReimburseStatus: (id: string, status: 'pending' | 'claimed' | 'received') => void;

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
  updateGoalAmount: (id: string, amountToAdd: number) => void;
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
  payDebt: (id: string, paymentAmount: number) => void;
  deleteDebt: (id: string) => void;

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

const INITIAL_BADGES: AchievementBadge[] = [
  { id: 'b-first-tx', title: 'Langkah Pertama', description: 'Mencatat transaksi pertamamu di Money Talk', icon: '🌟', isUnlocked: true, unlockedAt: 'Hari ini' },
  { id: 'b-savings-master', title: 'Sultan Menabung', description: 'Rasio tabungan di atas 30% dalam sebulan', icon: '🏆', isUnlocked: true, unlockedAt: 'Bulan ini' },
  { id: 'b-budget-guard', title: 'Penjaga Anggaran', description: 'Disiplin tidak overbudget sepanjang bulan', icon: '🛡️', isUnlocked: true, unlockedAt: 'Bulan ini' },
  { id: 'b-investor', title: 'Investor Cerdas', description: 'Memiliki instrumen investasi aktif', icon: '📈', isUnlocked: true, unlockedAt: 'Aktif' },
  { id: 'b-debt-free', title: 'Bebas Hutang', description: 'Melunasi seluruh catatan hutang', icon: '🕊️', isUnlocked: false },
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

  const [isAppLocked, setIsAppLocked] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());

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

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : getInitialTransactions();
  });

  const [badges, setBadges] = useState<AchievementBadge[]>(INITIAL_BADGES);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }, [budgets]);

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
    setTransactions(prev => prev.filter(t => t.id !== id));
    sounds.vibrate(40);
  };

  const updateReimburseStatus = (id: string, status: 'pending' | 'claimed' | 'received') => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, reimburseStatus: status } : t))
    );
    sounds.playPop();
  };

  // Wallet CRUD (Edit & Ubah Rekening)
  const addWallet = (wallet: Omit<Wallet, 'id'>) => {
    const newWallet: Wallet = { ...wallet, id: `wal-${Date.now()}` };
    setWallets(prev => [...prev, newWallet]);
    sounds.playSuccess();
  };

  const updateWallet = (id: string, updated: Partial<Wallet>) => {
    setWallets(prev => prev.map(w => (w.id === id ? { ...w, ...updated } : w)));
    sounds.playSuccess();
  };

  const deleteWallet = (id: string) => {
    setWallets(prev => prev.filter(w => w.id !== id));
  };

  // Category CRUD (Ubah Kategori & Sumber Pendapatan)
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = { ...cat, id: `cat-${Date.now()}` };
    setCategories(prev => [...prev, newCat]);
    sounds.playSuccess();
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updated } : c)));
    sounds.playSuccess();
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Goals CRUD (Edit & Ubah Target)
  const addGoal = (goal: Omit<FinancialGoal, 'id'>) => {
    const newGoal: FinancialGoal = { ...goal, id: `goal-${Date.now()}` };
    setGoals(prev => [...prev, newGoal]);
    sounds.playSuccess();
  };

  const updateGoal = (id: string, updated: Partial<FinancialGoal>) => {
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, ...updated } : g)));
    sounds.playSuccess();
  };

  const updateGoalAmount = (id: string, amountToAdd: number) => {
    setGoals(prev =>
      prev.map(g => (g.id === id ? { ...g, currentAmount: Math.max(0, g.currentAmount + amountToAdd) } : g))
    );
    sounds.playSuccess();
    sounds.vibrate(30);
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
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
  };

  const payDebt = (id: string, paymentAmount: number) => {
    setDebts(prev =>
      prev.map(d => {
        if (d.id !== id) return d;
        const newPaid = Math.min(d.amount, d.paidAmount + paymentAmount);
        return {
          ...d,
          paidAmount: newPaid,
          isCompleted: newPaid >= d.amount,
        };
      })
    );
    sounds.playSuccess();
  };

  const deleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
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
    setUserProfile(DEFAULT_PROFILE);
    sounds.playPop();
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
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneytalk_backup_${new Date().toISOString().split('T')[0]}.json`;
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
    a.download = `moneytalk_transaksi_${new Date().toISOString().split('T')[0]}.csv`;
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
