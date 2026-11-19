import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction } from '../../types';
import { formatIDR, formatDateIndonesian, getMonthName, toDateKey } from '../../utils/format';
import { TransactionRow } from '../common/TransactionRow';
import { TransactionDetailSheet } from '../common/TransactionDetailSheet';
import { Search, X, SlidersHorizontal, Plus, ReceiptText } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface TransactionListViewProps {
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

type SortKey = 'latest' | 'oldest' | 'highest' | 'lowest';
type Period = 'month' | '7days' | 'all';

export const TransactionListView: React.FC<TransactionListViewProps> = ({
  onOpenAddModal,
  onEditTransaction,
}) => {
  const { transactions, categories, wallets, hideBalance, selectedMonth } = useFinance();

  const [query, setQuery] = useState('');
  const [type, setType] = useState<'all' | 'expense' | 'income' | 'transfer'>('all');
  const [walletFilter, setWalletFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortKey>('latest');
  const [period, setPeriod] = useState<Period>('month');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTx, setActiveTx] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    const since = new Date();
    since.setDate(since.getDate() - 6);
    const sinceStr = toDateKey(since);
    const q = query.trim().toLowerCase();

    const list = transactions.filter(tx => {
      if (period === 'month' && !tx.date.startsWith(selectedMonth)) return false;
      if (period === '7days' && tx.date < sinceStr) return false;
      if (type !== 'all' && tx.type !== type) return false;
      if (walletFilter !== 'all' && tx.walletId !== walletFilter && tx.targetWalletId !== walletFilter)
        return false;
      if (q) {
        const cat = categories.find(c => c.id === tx.categoryId)?.name.toLowerCase() || '';
        const hit =
          (tx.note || '').toLowerCase().includes(q) ||
          cat.includes(q) ||
          (tx.tags || []).some(t => t.toLowerCase().includes(q)) ||
          String(tx.amount).includes(q.replace(/\D/g, '') || '¤');
        if (!hit) return false;
      }
      return true;
    });

    if (sortBy === 'highest') return [...list].sort((a, b) => b.amount - a.amount);
    if (sortBy === 'lowest') return [...list].sort((a, b) => a.amount - b.amount);
    if (sortBy === 'oldest') return [...list].reverse();
    return list; // context already sorts newest-first
  }, [transactions, period, selectedMonth, type, walletFilter, query, sortBy, categories]);

  const grouped = useMemo(() => {
    if (sortBy === 'highest' || sortBy === 'lowest') return [['', filtered] as [string, Transaction[]]];
    const map = new Map<string, Transaction[]>();
    for (const tx of filtered) {
      if (!map.has(tx.date)) map.set(tx.date, []);
      map.get(tx.date)!.push(tx);
    }
    return Array.from(map.entries());
  }, [filtered, sortBy]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of filtered) {
      if (tx.type === 'income') income += tx.amount;
      if (tx.type === 'expense') expense += tx.amount;
    }
    return { income, expense };
  }, [filtered]);

  const activeFilterCount =
    (period !== 'month' ? 1 : 0) + (walletFilter !== 'all' ? 1 : 0) + (sortBy !== 'latest' ? 1 : 0);
  const money = (v: number) => (hideBalance ? '••••' : formatIDR(v));
  const periodLabel =
    period === 'month' ? getMonthName(selectedMonth) : period === '7days' ? '7 hari terakhir' : 'Semua waktu';

  const tap = () => sounds.playPop();

  return (
    <div className="space-y-3">
      {/* Search + filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            placeholder="Cari catatan, kategori, #tag"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="field !bg-white dark:!bg-zinc-900 !border-zinc-200/70 dark:!border-zinc-800 pl-10 pr-9"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Hapus pencarian"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => {
            tap();
            setShowFilters(v => !v);
          }}
          aria-label="Filter"
          aria-expanded={showFilters}
          className={`relative w-11 h-11 shrink-0 rounded-xl border flex items-center justify-center transition-colors ${
            showFilters || activeFilterCount
              ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
              : 'bg-white dark:bg-zinc-900 border-zinc-200/70 dark:border-zinc-800 text-zinc-500'
          }`}
        >
          <SlidersHorizontal className="w-[18px] h-[18px]" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Type segmented */}
      <div className="segmented grid-cols-4">
        {[
          { k: 'all', l: 'Semua' },
          { k: 'expense', l: 'Keluar' },
          { k: 'income', l: 'Masuk' },
          { k: 'transfer', l: 'Transfer' },
        ].map(t => (
          <button
            key={t.k}
            onClick={() => {
              tap();
              setType(t.k as typeof type);
            }}
            className={`segment ${type === t.k ? 'segment-active' : ''}`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="card p-3 space-y-3 animate-fade-in">
          <div>
            <p className="label mb-1.5">Periode</p>
            <div className="flex gap-1.5">
              {[
                { k: 'month', l: 'Bulan dipilih' },
                { k: '7days', l: '7 hari' },
                { k: 'all', l: 'Semua' },
              ].map(p => (
                <button
                  key={p.k}
                  onClick={() => {
                    tap();
                    setPeriod(p.k as Period);
                  }}
                  className={`chip ${period === p.k ? 'chip-active' : ''}`}
                >
                  {p.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="label mb-1.5">Dompet</p>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-3 px-3">
              <button
                onClick={() => setWalletFilter('all')}
                className={`chip ${walletFilter === 'all' ? 'chip-active' : ''}`}
              >
                Semua
              </button>
              {wallets.map(w => (
                <button
                  key={w.id}
                  onClick={() => setWalletFilter(w.id)}
                  className={`chip ${walletFilter === w.id ? 'chip-active' : ''}`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: w.color }} />
                  {w.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="label mb-1.5">Urutkan</p>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { k: 'latest', l: 'Terbaru' },
                { k: 'oldest', l: 'Terlama' },
                { k: 'highest', l: 'Terbesar' },
                { k: 'lowest', l: 'Terkecil' },
              ].map(s => (
                <button
                  key={s.k}
                  onClick={() => setSortBy(s.k as SortKey)}
                  className={`chip ${sortBy === s.k ? 'chip-active' : ''}`}
                >
                  {s.l}
                </button>
              ))}
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setPeriod('month');
                setWalletFilter('all');
                setSortBy('latest');
              }}
              className="link"
            >
              Reset filter
            </button>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="card px-4 py-3">
        <p className="text-[11px] text-muted capitalize">
          {periodLabel} · {filtered.length} transaksi
        </p>
        <div className="grid grid-cols-2 gap-3 mt-1">
          <div>
            <p className="text-[11px] text-muted">Masuk</p>
            <p className="text-sm font-bold num text-emerald-600 dark:text-emerald-400">{money(totals.income)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted">Keluar</p>
            <p className="text-sm font-bold num text-zinc-900 dark:text-zinc-100">{money(totals.expense)}</p>
          </div>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card py-12 px-6 flex flex-col items-center text-center">
          <span className="w-12 h-12 rounded-2xl surface-muted flex items-center justify-center text-zinc-400 mb-3">
            <ReceiptText className="w-6 h-6" />
          </span>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Tidak ada transaksi</p>
          <p className="text-xs text-muted mt-1">
            {query || activeFilterCount || type !== 'all'
              ? 'Coba ubah kata kunci atau filter.'
              : 'Belum ada catatan di periode ini.'}
          </p>
          <button onClick={onOpenAddModal} className="btn-primary mt-4">
            <Plus className="w-4 h-4" />
            Catat transaksi
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([dateStr, items]) => {
            const dayExpense = items.filter(i => i.type === 'expense').reduce((s, i) => s + i.amount, 0);
            return (
              <div key={dateStr || 'sorted'}>
                {dateStr && (
                  <div className="flex items-center justify-between px-1 mb-1.5 text-xs">
                    <span className="font-semibold text-zinc-600 dark:text-zinc-300">
                      {formatDateIndonesian(dateStr)}
                    </span>
                    {dayExpense > 0 && <span className="text-zinc-400 num">−{money(dayExpense)}</span>}
                  </div>
                )}
                <div className="card-list">
                  {items.map(tx => (
                    <TransactionRow key={tx.id} tx={tx} onClick={setActiveTx} meta={dateStr ? 'time' : 'date'} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TransactionDetailSheet tx={activeTx} onClose={() => setActiveTx(null)} onEdit={onEditTransaction} />
    </div>
  );
};
