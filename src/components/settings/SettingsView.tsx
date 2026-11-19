import React, { useState, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Category, Wallet, FinancialGoal } from '../../types';
import { DynamicIcon } from '../common/DynamicIcon';
import { formatIDR } from '../../utils/format';
import {
  User,
  Tags,
  Wallet as WalletIcon,
  Target,
  Lock,
  Edit2,
  Trash2,
  Plus,
  Shield,
  Palette,
  Volume2,
  Download,
  Upload,
  FileText,
  RefreshCw,
  Calculator,
  FileCheck,
  Calendar,
  Users,
  Coins,
  Trophy,
  Bot,
  UserCircle2,
  ShoppingBag,
  TrendingUp,
  Database,
  Sliders,
  Check,
  HandCoins,
  Repeat,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';

interface SettingsViewProps {
  onOpenReport?: () => void;
  onOpenPersonas?: () => void;
  onOpenCurrencyConverter?: () => void;
  onOpenBadges?: () => void;
  onNavigate?: (tab: any) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenReport,
  onOpenPersonas,
  onOpenCurrencyConverter,
  onOpenBadges,
  onNavigate,
}) => {
  const {
    userProfile,
    updateUserProfile,
    transactions,
    categories,
    updateCategory,
    addCategory,
    deleteCategory,
    wallets,
    updateWallet,
    goals,
    updateGoal,
    pinLockEnabled,
    togglePinLock,
    appPin,
    setAppPin,
    appTheme,
    setAppTheme,
    soundEnabled,
    toggleSound,
    exportCSV,
    exportJSON,
    importJSON,
    resetData,
  } = useFinance();

  const [activeSection, setActiveSection] = useState<
    'categories' | 'wallets' | 'data' | 'extra' | 'profile' | 'security'
  >('categories');
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<'income' | 'expense'>('income');

  // Edit Category State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState('');
  const [catIcon, setCatIcon] = useState('');

  // Edit Wallet State
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [walName, setWalName] = useState('');
  const [walNumber, setWalNumber] = useState('');

  // Edit Goal State
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');

  // Edit Profile State
  const [profileName, setProfileName] = useState(userProfile.name);
  const [profileTitle, setProfileTitle] = useState(userProfile.title);

  // Edit PIN State
  const [newPin, setNewPin] = useState('');

  // Restore file input ref (F-07)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const colorPalette = [
    '#10B981',
    '#3B82F6',
    '#8B5CF6',
    '#F59E0B',
    '#EF4444',
    '#EC4899',
    '#06B6D4',
    '#F97316',
    '#64748B',
  ];
  const iconPalette = [
    'Briefcase',
    'Laptop',
    'TrendingUp',
    'Gift',
    'Coins',
    'Store',
    'Building',
    'Landmark',
    'Utensils',
    'Car',
    'ShoppingBag',
    'Zap',
    'Gamepad2',
    'HeartPulse',
    'Package',
  ];

  // Handle Edit Category Save
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !catName.trim()) return;

    updateCategory(editingCategory.id, {
      name: catName.trim(),
      color: catColor || editingCategory.color,
      icon: catIcon || editingCategory.icon,
    });

    setEditingCategory(null);
  };

  // Handle Add New Category
  const handleAddNewCategory = () => {
    const promptText =
      categoryTypeFilter === 'income'
        ? 'Masukkan nama sumber pemasukan baru (misal: Toko Online, Dividen Saham, Bonus):'
        : 'Masukkan nama kategori pengeluaran baru (misal: Hewan Peliharaan, Streaming, Kursus):';

    const name = prompt(promptText);
    if (name && name.trim()) {
      addCategory({
        name: name.trim(),
        color: categoryTypeFilter === 'income' ? '#10B981' : '#F97316',
        icon: categoryTypeFilter === 'income' ? 'Coins' : 'ShoppingBag',
        type: categoryTypeFilter,
      });
      confetti({ particleCount: 30, spread: 50 });
    }
  };

  // Handle Edit Wallet Save
  const handleSaveWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWallet || !walName.trim()) return;

    updateWallet(editingWallet.id, {
      name: walName.trim(),
      accountNumber: walNumber.trim() || undefined,
    });

    setEditingWallet(null);
  };

  // Handle Edit Goal Save
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !goalTitle.trim()) return;

    const val = parseInt(goalTarget, 10);
    if (isNaN(val) || val <= 0) return;

    updateGoal(editingGoal.id, {
      title: goalTitle.trim(),
      targetAmount: val,
    });

    setEditingGoal(null);
  };

  // Handle Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    updateUserProfile({
      name: profileName.trim(),
      title: profileTitle.trim() || 'Pengelola Keuangan Bijak',
    });

    alert('Profil berhasil diperbarui!');
  };

  // Handle PIN Save
  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4) {
      alert('PIN harus terdiri dari 4 digit angka');
      return;
    }
    setAppPin(newPin);
    setNewPin('');
    alert('PIN keamanan berhasil diperbarui!');
  };

  // Handle File Import (F-07)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const success = importJSON(content);
        if (success) {
          setImportStatus('✅ Data backup berhasil dipulihkan!');
          confetti({ particleCount: 50, spread: 70 });
        } else {
          setImportStatus('❌ File backup tidak valid atau rusak');
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Title & Navigation Pill Menu */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Pengaturan
        </h2>
      </div>

      {/* Segmented Section Bar (Apple HIG 44px min touch target) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'categories', label: 'Kategori', icon: Tags },
          { id: 'wallets', label: 'Dompet', icon: WalletIcon },
          { id: 'data', label: 'Data', icon: Database },
          { id: 'extra', label: 'Ekstra', icon: Sliders },
          { id: 'profile', label: 'Profil', icon: User },
          { id: 'security', label: 'Keamanan', icon: Lock },
        ].map(s => {
          const Icon = s.icon;
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                sounds.playPop();
                sounds.vibrate(10);
                setActiveSection(s.id as any);
              }}
              className={`min-h-[44px] px-3.5 py-2 rounded-2xl flex items-center gap-1.5 text-xs font-bold transition-all shrink-0 active:scale-95 ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: UBAH KATEGORI & SUMBER PENDAPATAN (F-03 Canon) */}
      {activeSection === 'categories' && (
        <div className="space-y-3">
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Kelola Kategori
              </h3>

              <button
                onClick={handleAddNewCategory}
                className="min-h-[36px] flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs active:scale-95 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Baru</span>
              </button>
            </div>

            {/* Income vs Expense Filter Switch */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 gap-1 mb-4">
              <button
                type="button"
                onClick={() => setCategoryTypeFilter('income')}
                className={`min-h-[40px] text-xs font-bold rounded-xl transition-all ${
                  categoryTypeFilter === 'income'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Pemasukan ({categories.filter(c => c.type === 'income').length})
              </button>

              <button
                type="button"
                onClick={() => setCategoryTypeFilter('expense')}
                className={`min-h-[40px] text-xs font-bold rounded-xl transition-all ${
                  categoryTypeFilter === 'expense'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Pengeluaran ({categories.filter(c => c.type === 'expense').length})
              </button>
            </div>

            {/* Category Cards List */}
            <div className="space-y-2">
              {categories
                .filter(c => c.type === categoryTypeFilter)
                .map(cat => (
                  <div
                    key={cat.id}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
                        style={{ backgroundColor: cat.color }}
                      >
                        <DynamicIcon name={cat.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {cat.name}
                        </h4>
                        <span className="text-[10px] text-zinc-400 capitalize">
                          {cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCatName(cat.name);
                          setCatColor(cat.color);
                          setCatIcon(cat.icon);
                        }}
                        className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 flex items-center justify-center active:scale-95 transition-all"
                        title="Edit Kategori"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {categories.filter(c => c.type === categoryTypeFilter).length > 2 && (
                        <button
                          onClick={() => {
                            if (confirm(`Hapus kategori "${cat.name}"?`)) {
                              deleteCategory(cat.id);
                            }
                          }}
                          className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-rose-500 flex items-center justify-center active:scale-95 transition-all"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: UBAH AKUN & DOMPET */}
      {activeSection === 'wallets' && (
        <div className="space-y-3">
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              Daftar Dompet
            </h3>

            <div className="space-y-2">
              {wallets.map(w => (
                <div
                  key={w.id}
                  className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: w.color }}
                    >
                      <DynamicIcon name={w.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {w.name}
                      </h4>
                      <p className="text-[10px] text-zinc-400">
                        {w.accountNumber || 'Akun Aktif'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingWallet(w);
                      setWalName(w.name);
                      setWalNumber(w.accountNumber || '');
                    }}
                    className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 flex items-center justify-center active:scale-95 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: DATA & CADANGAN (F-07) */}
      {activeSection === 'data' && (
        <div className="space-y-3">
          {/* Storage Diagnostic Card */}
          <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Penyimpanan Lokal
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {transactions.length} Transaksi tersimpan aman di Safari
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full">
              Aktif
            </span>
          </div>

          {importStatus && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <span>{importStatus}</span>
            </div>
          )}

          {/* Action List */}
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Cadangan & Ekspor
            </h3>

            {/* Export JSON */}
            <button
              onClick={exportJSON}
              className="w-full min-h-[48px] px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-750 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-98 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Cadangkan ke File (JSON)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                Utama
              </span>
            </button>

            {/* Restore JSON */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-750 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-98 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <Upload className="w-4 h-4 text-blue-500" />
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Pulihkan Cadangan (Restore JSON)
                  </h4>
                </div>
              </button>
            </div>

            {/* Export CSV */}
            <button
              onClick={exportCSV}
              className="w-full min-h-[48px] px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-750 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-98 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-teal-500" />
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Unduh Excel / CSV
                </h4>
              </div>
            </button>

            {/* Financial Report PDF */}
            {onOpenReport && (
              <button
                onClick={onOpenReport}
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-750 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-98 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Laporan Cetak PDF
                  </h4>
                </div>
              </button>
            )}

            <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

            {/* Reset Data Demo */}
            <button
              onClick={() => {
                if (confirm('Yakin ingin mereset data kembali ke pengaturan demo awal? Semua transaksi saat ini akan digantikan.')) {
                  resetData();
                  alert('Data berhasil direset ke demo!');
                }
              }}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Ulang ke Data Demo</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 4: FITUR EKSTRA & LABORATORIUM (F-05) */}
      {activeSection === 'extra' && (
        <div className="space-y-3">
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              Fitur Tambahan
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {/* Target & Anggaran */}
              <button
                onClick={() => onNavigate && onNavigate('goals')}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-left hover:border-emerald-500 active:scale-95 transition-all flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    Target & Anggaran
                  </h4>
                </div>
              </button>

              {/* Catatan Hutang & Piutang */}
              <button
                onClick={() => onNavigate && onNavigate('debts')}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-left hover:border-emerald-500 active:scale-95 transition-all flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <HandCoins className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    Hutang Piutang
                  </h4>
                </div>
              </button>

              {/* Tagihan & Langganan Rutin */}
              <button
                onClick={() => onNavigate && onNavigate('recurring')}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-left hover:border-emerald-500 active:scale-95 transition-all flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <Repeat className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    Tagihan Rutin
                  </h4>
                </div>
              </button>

              {/* Simulator PPh 21 & Bunga */}
              <button
                onClick={() => onNavigate && onNavigate('simulator')}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-left hover:border-emerald-500 active:scale-95 transition-all flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <Calculator className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    Simulasi Pajak
                  </h4>
                </div>
              </button>

              {/* Klaim Kantor (Reimbursement) */}
              <button
                onClick={() => onNavigate && onNavigate('reimburse')}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-left hover:border-emerald-500 active:scale-95 transition-all flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    Klaim Kantor
                  </h4>
                </div>
              </button>

              {/* Kalender Arus Kas */}
              <button
                onClick={() => onNavigate && onNavigate('calendar')}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-left hover:border-emerald-500 active:scale-95 transition-all flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    Kalender Kas
                  </h4>
                </div>
              </button>

              {/* Split Bill */}
              <button
                onClick={() => onNavigate && onNavigate('splitbill')}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-left hover:border-emerald-500 active:scale-95 transition-all flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    Split Bill
                  </h4>
                </div>
              </button>

              {/* Daftar Belanja */}
              <button
                onClick={() => onNavigate && onNavigate('shopping')}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-left hover:border-emerald-500 active:scale-95 transition-all flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    Daftar Belanja
                  </h4>
                </div>
              </button>

              {/* Portofolio Investasi */}
              <button
                onClick={() => onNavigate && onNavigate('investments')}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-left hover:border-emerald-500 active:scale-95 transition-all flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    Portofolio Aset
                  </h4>
                </div>
              </button>

              {/* Aura AI Advisor */}
              <button
                onClick={() => onNavigate && onNavigate('advisor')}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-left hover:border-emerald-500 active:scale-95 transition-all flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    AI Advisor
                  </h4>
                </div>
              </button>

              {/* Kalkulator Valas / Kurs */}
              {onOpenCurrencyConverter && (
                <button
                  onClick={onOpenCurrencyConverter}
                  className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-left hover:border-emerald-500 active:scale-95 transition-all flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      Kurs Valas
                    </h4>
                  </div>
                </button>
              )}

              {/* Badges / Pencapaian */}
              {onOpenBadges && (
                <button
                  onClick={onOpenBadges}
                  className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-left hover:border-emerald-500 active:scale-95 transition-all flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      Pencapaian
                    </h4>
                  </div>
                </button>
              )}

              {/* Preset Persona */}
              {onOpenPersonas && (
                <button
                  onClick={onOpenPersonas}
                  className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-left hover:border-emerald-500 active:scale-95 transition-all flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                    <UserCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      Persona
                    </h4>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: PROFIL & TAMPILAN */}
      {activeSection === 'profile' && (
        <div className="space-y-3">
          {/* Theme Selector */}
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Tema Tampilan
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dark', label: 'Dark iOS', icon: '🌙' },
                { id: 'oled', label: 'Midnight OLED', icon: '🖤' },
                { id: 'light', label: 'Cupertino Light', icon: '☀️' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setAppTheme(t.id as any)}
                  className={`min-h-[44px] py-2 px-2 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center justify-center ${
                    appTheme === t.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                  }`}
                >
                  <span className="text-base mb-0.5">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              Ubah Profil Pengguna
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Nama Panggilan
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-xs text-zinc-900 dark:text-zinc-100 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Status Finansial
                </label>
                <input
                  type="text"
                  value={profileTitle}
                  onChange={e => setProfileTitle(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[44px] py-2.5 rounded-2xl bg-emerald-500 text-white font-bold text-xs active:scale-95 transition-all shadow-md"
              >
                Simpan Profil
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 6: KEAMANAN & PIN */}
      {activeSection === 'security' && (
        <div className="space-y-3">
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Kunci Aplikasi (PIN 4-Digit)
                </h3>
              </div>

              <button
                onClick={togglePinLock}
                className={`min-w-[48px] h-7 rounded-full p-1 transition-colors ${
                  pinLockEnabled ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    pinLockEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {pinLockEnabled && (
              <form onSubmit={handleSavePin} className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <label className="text-[11px] font-semibold text-zinc-400 block">
                  Ubah 4 Digit PIN Keamanan
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={4}
                    inputMode="numeric"
                    placeholder="••••"
                    value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-center text-lg font-bold tracking-widest text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="min-h-[44px] px-4 rounded-xl bg-emerald-500 text-white font-bold text-xs active:scale-95 transition-all"
                  >
                    Set PIN
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setEditingCategory(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] p-5 shadow-ios-elevated z-10 border-t border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              Edit Kategori: {editingCategory.name}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Nama Kategori / Sumber
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Pilih Warna Ikon
                </label>
                <div className="flex gap-2 flex-wrap">
                  {colorPalette.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCatColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform active:scale-90 ${
                        catColor === c ? 'ring-2 ring-emerald-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Pilih Ikon
                </label>
                <div className="flex gap-2 flex-wrap max-h-28 overflow-y-auto p-1">
                  {iconPalette.map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setCatIcon(ic)}
                      className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                        catIcon === ic
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <DynamicIcon name={ic} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 min-h-[48px] py-3 rounded-2xl bg-emerald-500 text-white font-bold text-xs active:scale-95 transition-all shadow-md"
                >
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="min-h-[48px] py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs active:scale-95"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT WALLET MODAL */}
      {editingWallet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setEditingWallet(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] p-5 shadow-ios-elevated z-10 border-t border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              Edit Dompet: {editingWallet.name}
            </h3>

            <form onSubmit={handleSaveWallet} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Nama Dompet / Bank
                </label>
                <input
                  type="text"
                  required
                  value={walName}
                  onChange={e => setWalName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Keterangan / Nomor Akun
                </label>
                <input
                  type="text"
                  value={walNumber}
                  onChange={e => setWalNumber(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 min-h-[48px] py-3 rounded-2xl bg-emerald-500 text-white font-bold text-xs active:scale-95 transition-all shadow-md"
                >
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => setEditingWallet(null)}
                  className="min-h-[48px] py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs active:scale-95"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
