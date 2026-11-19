import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction } from '../../types';
import { formatIDR, formatDateIndonesian } from '../../utils/format';
import { DynamicIcon } from '../common/DynamicIcon';
import { ReceiptShareModal } from '../modals/ReceiptShareModal';
import { Trash2, ChevronRight, Calendar, Wallet, Share2, Edit2 } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface RecentTransactionsProps {
  onSeeAll: () => void;
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  onSeeAll,
  onOpenAddModal,
  onEditTransaction,
}) => {
  const { transactions, categories, wallets, deleteTransaction, hideBalance, selectedMonth } =
    useFinance();
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [shareTx, setShareTx] = useState<Transaction | null>(null);

  // F-05: Filter by selectedMonth so dashboard stays consistent with Header month selector
  const filtered = transactions.filter(t => {
    if (!t.date.startsWith(selectedMonth)) return false;
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const recentList = filtered.slice(0, 6);

  const getCategoryInfo = (catId: string) => {
    return (
      categories.find(c => c.id === catId) || {
        name: 'Lain-lain',
        icon: 'HelpCircle',
        color: '#6B7280',
      }
    );
  };

  const getWalletName = (walId: string) => {
    return wallets.find(w => w.id === walId)?.name || 'Dompet';
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          Transaksi Terkini
        </h2>
        <button
          onClick={onSeeAll}
          className="min-h-[36px] px-2 text-xs font-semibold text-emerald-500 hover:text-emerald-400 flex items-center gap-0.5 active:scale-95 transition-transform"
        >
          Lihat Semua
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 pb-1">
        {[
          { key: 'all', label: 'Semua' },
          { key: 'expense', label: 'Pengeluaran' },
          { key: 'income', label: 'Pemasukan' },
        ].map(chip => (
          <button
            key={chip.key}
            onClick={() => {
              sounds.playPop();
              sounds.vibrate(10);
              setFilterType(chip.key as 'all' | 'expense' | 'income');
            }}
            className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 flex items-center justify-center ${
              filterType === chip.key
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-850 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      {recentList.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
          <p className="text-sm text-zinc-400">Belum ada transaksi di periode/filter ini</p>
          <button
            onClick={onOpenAddModal}
            className="mt-3 min-h-[40px] text-xs font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            + Tambah Transaksi Sekarang
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {recentList.map(tx => {
            const isExpense = tx.type === 'expense';
            const isTransfer = tx.type === 'transfer';
            const cat = isTransfer
              ? { name: 'Transfer Antar Akun', icon: 'ArrowLeftRight', color: '#6366F1' }
              : getCategoryInfo(tx.categoryId);
            const sourceWallet = getWalletName(tx.walletId);
            const targetWallet = tx.targetWalletId ? getWalletName(tx.targetWalletId) : null;

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
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
                      <span>
                        {isTransfer ? `${sourceWallet} → ${targetWallet}` : sourceWallet}
                      </span>
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
                    {formatDateIndonesian(tx.date)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transaction Detail Bottom Sheet (F-02: Edit + Confirmed Delete) */}
      {selectedTx && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed inset-0" onClick={() => setSelectedTx(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl p-6 shadow-ios-elevated animate-slide-up z-10 border-t border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-5" />

            <div className="text-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 ${
                  selectedTx.type === 'expense'
                    ? 'bg-rose-500/10 text-rose-500'
                    : selectedTx.type === 'transfer'
                    ? 'bg-indigo-500/10 text-indigo-500'
                    : 'bg-emerald-500/10 text-emerald-500'
                }`}
              >
                {selectedTx.type === 'expense'
                  ? 'Pengeluaran'
                  : selectedTx.type === 'transfer'
                  ? 'Transfer'
                  : 'Pemasukan'}
              </span>
              <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {formatIDR(selectedTx.amount)}
              </h3>
              <p className="text-sm text-zinc-500 mt-1">
                {selectedTx.note || 'Tanpa Catatan'}
              </p>
            </div>

            <div className="py-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  Tanggal
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {selectedTx.date} {selectedTx.time ? `• ${selectedTx.time}` : ''}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-zinc-400" />
                  Rekening / Dompet
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {selectedTx.type === 'transfer'
                    ? `${getWalletName(selectedTx.walletId)} → ${
                        selectedTx.targetWalletId
                          ? getWalletName(selectedTx.targetWalletId)
                          : ''
                      }`
                    : getWalletName(selectedTx.walletId)}
                </span>
              </div>
            </div>

            {/* Actions (F-02: Edit + E-Receipt + Safe Delete) */}
            <div className="pt-2 space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    const txToEdit = selectedTx;
                    setSelectedTx(null);
                    onEditTransaction(txToEdit);
                  }}
                  className="min-h-[44px] py-3 px-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-600 transition-colors active:scale-95"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Transaksi
                </button>

                <button
                  onClick={() => {
                    setShareTx(selectedTx);
                    setSelectedTx(null);
                  }}
                  className="min-h-[44px] py-3 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  Struk Digital
                </button>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={() => {
                    if (
                      confirm(
                        `Hapus transaksi "${selectedTx.note || 'ini'}" sebesar ${formatIDR(
                          selectedTx.amount
                        )}?`
                      )
                    ) {
                      deleteTransaction(selectedTx.id);
                      setSelectedTx(null);
                    }
                  }}
                  className="flex-1 min-h-[44px] py-3 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="flex-1 min-h-[44px] py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs hover:bg-zinc-200 transition-colors active:scale-95"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ReceiptShareModal transaction={shareTx} onClose={() => setShareTx(null)} />
    </div>
  );
};
