import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction } from '../../types';
import { formatIDR, formatDateIndonesian, formatFullDate } from '../../utils/format';
import { DynamicIcon } from '../common/DynamicIcon';
import { Search, Trash2, Calendar, Wallet as WalletIcon, Edit2 } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface TransactionListViewProps {
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionListView: React.FC<TransactionListViewProps> = ({
  onOpenAddModal,
  onEditTransaction,
}) => {
  const { transactions, categories, wallets, deleteTransaction, hideBalance, selectedMonth } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'highest' | 'lowest'>('latest');
  const [timeFilter, setTimeFilter] = useState<'month' | '7days' | 'all'>('month');
  const [activeTx, setActiveTx] = useState<Transaction | null>(null);

  // Filtered list
  const filtered = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    return transactions
      .filter(tx => {
        // Time Filter
        if (timeFilter === 'month' && !tx.date.startsWith(selectedMonth)) return false;
        if (timeFilter === '7days' && tx.date < sevenDaysAgoStr) return false;

        // Type filter
        if (selectedType !== 'all' && tx.type !== selectedType) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const noteMatch = (tx.note || '').toLowerCase().includes(q);
          const catName = categories.find(c => c.id === tx.categoryId)?.name.toLowerCase() || '';
          const catMatch = catName.includes(q);
          if (!noteMatch && !catMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'highest') return b.amount - a.amount;
        if (sortBy === 'lowest') return a.amount - b.amount;
        if (sortBy === 'oldest') return a.date.localeCompare(b.date);
        return b.date.localeCompare(a.date); // default latest
      });
  }, [transactions, selectedMonth, selectedType, searchQuery, sortBy, timeFilter, categories]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of filtered) {
      if (!map.has(tx.date)) {
        map.set(tx.date, []);
      }
      map.get(tx.date)!.push(tx);
    }
    return Array.from(map.entries());
  }, [filtered]);

  // Filtered totals
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of filtered) {
      if (tx.type === 'income') income += tx.amount;
      if (tx.type === 'expense') expense += tx.amount;
    }
    return { income, expense };
  }, [filtered]);

  const getCategoryInfo = (catId: string) => {
    return categories.find(c => c.id === catId) || {
      name: 'Lain-lain',
      icon: 'HelpCircle',
      color: '#6B7280',
    };
  };

  const getWalletName = (id: string) => {
    return wallets.find(w => w.id === id)?.name || 'Dompet';
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Search & Filter Header */}
      <div className="space-y-3">
        {/* Search Bar (Anti-Zoom: 16px min on mobile) */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari transaksi atau catatan..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full min-h-[44px] pl-10 pr-16 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-[16px] sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-ios-sm"
          />
          {searchQuery && (
            <button
              onClick={() => {
                sounds.playPop();
                setSearchQuery('');
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400 hover:text-zinc-600 px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <div className="flex gap-1.5 shrink-0">
            {[
              { key: 'all', label: 'Semua' },
              { key: 'expense', label: 'Keluar' },
              { key: 'income', label: 'Masuk' },
              { key: 'transfer', label: 'Transfer' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => {
                  sounds.playPop();
                  sounds.vibrate(10);
                  setSelectedType(f.key);
                }}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center ${
                  selectedType === f.key
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={e => {
              sounds.playPop();
              setSortBy(e.target.value as 'latest' | 'oldest' | 'highest' | 'lowest');
            }}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[16px] sm:text-xs text-zinc-700 dark:text-zinc-300 font-medium shrink-0 focus:outline-none"
          >
            <option value="latest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="highest">Nominal Terbesar</option>
            <option value="lowest">Nominal Terkecil</option>
          </select>
        </div>
      </div>

      {/* Summary Mini Bar */}
      <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm">
        <div>
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Total Masuk</span>
          <p className="text-sm font-bold text-emerald-500 tabular-nums">
            {hideBalance ? '••••••' : formatIDR(totals.income)}
          </p>
        </div>
        <div>
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Total Keluar</span>
          <p className="text-sm font-bold text-rose-500 tabular-nums">
            {hideBalance ? '••••••' : formatIDR(totals.expense)}
          </p>
        </div>
      </div>

      {/* Grouped Transaction List */}
      {groupedByDate.length === 0 ? (
        <div className="py-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
          <p className="text-sm text-zinc-400 font-medium">Tidak ada transaksi ditemukan</p>
          <button
            onClick={onOpenAddModal}
            className="mt-3 text-xs font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            + Tambah Transaksi
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map(([dateStr, items]) => {
            const dayExpense = items
              .filter(i => i.type === 'expense')
              .reduce((sum, i) => sum + i.amount, 0);

            return (
              <div key={dateStr} className="space-y-1.5">
                <div className="flex items-center justify-between px-2 text-xs font-semibold text-zinc-400">
                  <span>{formatDateIndonesian(dateStr)}</span>
                  {dayExpense > 0 && !hideBalance && (
                    <span className="text-zinc-500">Keluar: {formatIDR(dayExpense, true)}</span>
                  )}
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {items.map(tx => {
                    const isExpense = tx.type === 'expense';
                    const isTransfer = tx.type === 'transfer';
                    const cat = isTransfer
                      ? { name: 'Transfer Antar Akun', icon: 'ArrowLeftRight', color: '#6366F1' }
                      : getCategoryInfo(tx.categoryId);
                    const sourceWal = getWalletName(tx.walletId);
                    const targetWal = tx.targetWalletId ? getWalletName(tx.targetWalletId) : null;

                    return (
                      <div
                        key={tx.id}
                        onClick={() => setActiveTx(tx)}
                        className="px-4 py-3 flex items-center justify-between hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 active:bg-zinc-100 dark:active:bg-zinc-800/80 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                            style={{ backgroundColor: `${cat.color}18`, color: cat.color }}
                          >
                            <DynamicIcon name={cat.icon} className="w-5 h-5" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                              {tx.note || cat.name}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5 truncate">
                              <span>{cat.name}</span>
                              <span>•</span>
                              <span>{isTransfer ? `${sourceWal} → ${targetWal}` : sourceWal}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-3">
                          <p
                            className={`text-sm font-bold tabular-nums ${
                              isExpense
                                ? 'text-rose-500'
                                : isTransfer
                                ? 'text-indigo-500'
                                : 'text-emerald-500'
                            }`}
                          >
                            {hideBalance
                              ? '••••••'
                              : `${isExpense ? '-' : isTransfer ? '' : '+'}${formatIDR(tx.amount)}`}
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {tx.time || ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transaction Detail Sheet */}
      {activeTx && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setActiveTx(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl p-6 shadow-ios-elevated animate-slide-up z-10 border-t border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

            <div className="text-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 ${
                  activeTx.type === 'expense'
                    ? 'bg-rose-500/10 text-rose-500'
                    : activeTx.type === 'transfer'
                    ? 'bg-indigo-500/10 text-indigo-500'
                    : 'bg-emerald-500/10 text-emerald-500'
                }`}
              >
                {activeTx.type === 'expense' ? 'Pengeluaran' : activeTx.type === 'transfer' ? 'Transfer' : 'Pemasukan'}
              </span>
              <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {formatIDR(activeTx.amount)}
              </h3>
              <p className="text-sm text-zinc-500 mt-1">
                {activeTx.note || 'Tanpa Catatan'}
              </p>
            </div>

            <div className="py-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  Waktu
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formatFullDate(activeTx.date)} {activeTx.time ? `• ${activeTx.time}` : ''}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-2">
                  <WalletIcon className="w-4 h-4 text-zinc-400" />
                  Rekening / Dompet
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {activeTx.type === 'transfer'
                    ? `${getWalletName(activeTx.walletId)} → ${activeTx.targetWalletId ? getWalletName(activeTx.targetWalletId) : ''}`
                    : getWalletName(activeTx.walletId)}
                </span>
              </div>
            </div>

            <div className="pt-3 space-y-2.5">
              <button
                onClick={() => {
                  const txToEdit = activeTx;
                  setActiveTx(null);
                  onEditTransaction(txToEdit);
                }}
                className="w-full min-h-[44px] py-3 px-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-600 transition-colors active:scale-95"
              >
                <Edit2 className="w-4 h-4" />
                Edit Transaksi
              </button>

              <div className="flex gap-2.5">
                <button
                  onClick={() => {
                    if (
                      confirm(
                        `Hapus transaksi "${activeTx.note || 'ini'}" sebesar ${formatIDR(
                          activeTx.amount
                        )}?`
                      )
                    ) {
                      deleteTransaction(activeTx.id);
                      setActiveTx(null);
                    }
                  }}
                  className="flex-1 min-h-[44px] py-3 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
                <button
                  onClick={() => setActiveTx(null)}
                  className="flex-1 min-h-[44px] py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs hover:bg-zinc-200 transition-colors active:scale-95"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
