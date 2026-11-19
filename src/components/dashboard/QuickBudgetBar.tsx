import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR } from '../../utils/format';
import { ChevronRight, Target } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const QuickBudgetBar: React.FC<{ onGoToBudgets: () => void }> = ({ onGoToBudgets }) => {
  const { budgets, transactions, selectedMonth } = useFinance();

  const handleBarClick = () => {
    sounds.playPop();
    sounds.vibrate(10);
    onGoToBudgets();
  };

  const totalBudget = budgets
    .filter(b => b.month === selectedMonth)
    .reduce((sum, b) => sum + b.limit, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(selectedMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  if (totalBudget === 0) {
    return (
      <button
        onClick={handleBarClick}
        className="w-full p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm flex items-center justify-between hover:border-emerald-500/40 active:scale-[0.99] transition-all text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Batas Anggaran</p>
            <p className="text-[10px] text-zinc-400">Belum dipasang untuk bulan ini</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-emerald-500 flex items-center gap-0.5">
          Atur
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </button>
    );
  }

  const percentUsed = Math.min(Math.round((totalExpense / totalBudget) * 100), 100);
  const isOverBudget = totalExpense > totalBudget;
  const remaining = totalBudget - totalExpense;

  let progressColor = 'bg-emerald-500';
  let badgeColor = 'text-emerald-500 bg-emerald-500/10';

  if (percentUsed >= 90 || isOverBudget) {
    progressColor = 'bg-rose-500';
    badgeColor = 'text-rose-500 bg-rose-500/10';
  } else if (percentUsed >= 75) {
    progressColor = 'bg-amber-500';
    badgeColor = 'text-amber-500 bg-amber-500/10';
  }

  return (
    <button
      onClick={handleBarClick}
      className="w-full p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm hover:border-zinc-300 dark:hover:border-zinc-700 active:scale-[0.99] transition-all text-left"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            Batas Anggaran
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums ${badgeColor}`}>
            {percentUsed}%
          </span>
        </div>
        <div className="text-xs text-zinc-500 tabular-nums">
          {remaining >= 0 ? (
            <span>Sisa <strong className="text-emerald-500">{formatIDR(remaining, true)}</strong></span>
          ) : (
            <span>Lebih <strong className="text-rose-500">{formatIDR(Math.abs(remaining), true)}</strong></span>
          )}
        </div>
      </div>

      {/* Sleek Progress Track */}
      <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${percentUsed}%` }}
        />
      </div>
    </button>
  );
};
