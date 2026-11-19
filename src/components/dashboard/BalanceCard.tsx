import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR } from '../../utils/format';
import { sounds } from '../../utils/audio';
import {
  Eye,
  EyeOff,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Plus,
  Sparkles,
  TrendingDown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BalanceCardProps {
  onOpenAddModal: () => void;
  onOpenTransferModal: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  onOpenAddModal,
  onOpenTransferModal,
}) => {
  const { totalBalance, hideBalance, toggleHideBalance, monthlyStats, transactions } =
    useFinance();
  const [showSparkline, setShowSparkline] = useState(false);

  const last7DaysData = useMemo(() => {
    const today = new Date();
    const days: { label: string; expense: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayExpense = transactions
        .filter(t => t.type === 'expense' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);
      days.push({
        label: d.toLocaleDateString('id-ID', { weekday: 'narrow' }),
        expense: dayExpense,
      });
    }
    const maxExp = Math.max(...days.map(d => d.expense), 1);
    return { days, maxExp };
  }, [transactions]);

  const handleToggleHide = () => {
    sounds.playPop();
    sounds.vibrate(10);
    toggleHideBalance();
  };

  const handleToggleSparkline = () => {
    sounds.playPop();
    sounds.vibrate(12);
    setShowSparkline(prev => !prev);
  };

  const handleCatatClick = () => {
    sounds.playPop();
    sounds.vibrate(15);
    onOpenAddModal();
  };

  const handleTransferClick = () => {
    sounds.playPop();
    sounds.vibrate(15);
    onOpenTransferModal();
  };

  return (
    <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white shadow-ios-elevated border border-white/10">
      {/* Subtle ambient lighting */}
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

      {/* Header Row: Label & Eye Toggle */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400">Total Saldo</span>
          {monthlyStats.savingsRate > 0 && !hideBalance && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              <Sparkles className="w-3 h-3" />
              {monthlyStats.savingsRate}% Tabungan
            </span>
          )}
        </div>

        <button
          onClick={handleToggleHide}
          aria-label={hideBalance ? 'Tampilkan' : 'Sembunyikan'}
          className="w-10 h-10 -mr-2 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all text-zinc-400 hover:text-white"
        >
          {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Big Balance Number */}
      <div className="my-2.5 relative z-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums">
          {hideBalance ? 'Rp ••••••••' : formatIDR(totalBalance)}
        </h1>
      </div>

      {/* Cashflow Summary Pill Bar (Interactive Tap to inspect 7-day trend) */}
      <div
        onClick={handleToggleSparkline}
        className="cursor-pointer py-2 px-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 active:scale-98 transition-all relative z-10"
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-zinc-400">Pemasukan</p>
              <p className="text-xs font-bold text-emerald-400 truncate tabular-nums">
                {hideBalance ? '••••••' : formatIDR(monthlyStats.income, true)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400 shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-zinc-400">Pengeluaran</p>
              <p className="text-xs font-bold text-rose-400 truncate tabular-nums">
                {hideBalance ? '••••••' : formatIDR(monthlyStats.expense, true)}
              </p>
            </div>
          </div>
        </div>

        {/* Expandable 7-Day Rhythm Sparkline */}
        {showSparkline && (
          <div className="mt-2.5 pt-2.5 border-t border-white/10 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1.5">
              <span className="flex items-center gap-1 font-semibold text-zinc-300">
                <TrendingDown className="w-3 h-3 text-rose-400" />
                Tren Belanja 7 Hari Terakhir
              </span>
              <span>Tap untuk tutup</span>
            </div>
            <div className="flex items-end justify-between gap-1.5 h-12 pt-1">
              {last7DaysData.days.map((d, idx) => {
                const heightPercent = Math.max(12, Math.round((d.expense / last7DaysData.maxExp) * 100));
                const isToday = idx === 6;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-white/10 rounded-full h-8 flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-full transition-all duration-300 ${
                          d.expense > 0
                            ? isToday
                              ? 'bg-emerald-400'
                              : 'bg-rose-400/80'
                            : 'bg-white/5'
                        }`}
                        style={{ height: `${d.expense > 0 ? heightPercent : 10}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-zinc-400">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Capsules */}
      <div className="grid grid-cols-2 gap-2.5 mt-3 relative z-10">
        <button
          onClick={handleCatatClick}
          className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Catat</span>
        </button>

        <button
          onClick={handleTransferClick}
          className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-zinc-100 font-semibold text-xs border border-white/10"
        >
          <ArrowLeftRight className="w-4 h-4 text-zinc-300" />
          <span>Transfer</span>
        </button>
      </div>
    </div>
  );
};
