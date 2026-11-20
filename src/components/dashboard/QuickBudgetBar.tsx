import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR } from '../../utils/format';
import { sounds } from '../../utils/audio';
import { ChevronRight } from 'lucide-react';

const barColor = (pct: number) =>
  pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500';

/** Budget usage this month + the riskiest category. */
export const QuickBudgetBar: React.FC<{ onGoToBudgets: () => void }> = ({ onGoToBudgets }) => {
  const { budgets, transactions, selectedMonth, categories, hideBalance } = useFinance();

  const budget = useMemo(() => {
    const monthBudgets = budgets.filter(b => b.month === selectedMonth && b.limit > 0);
    const spentBy = new Map<string, number>();
    let totalExpense = 0;
    for (const t of transactions) {
      if (t.type !== 'expense' || !t.date.startsWith(selectedMonth)) continue;
      totalExpense += t.amount;
      spentBy.set(t.categoryId, (spentBy.get(t.categoryId) || 0) + t.amount);
    }
    const totalLimit = monthBudgets.reduce((s, b) => s + b.limit, 0);
    const budgetedSpent = monthBudgets.reduce((s, b) => s + (spentBy.get(b.categoryId) || 0), 0);
    const risky = monthBudgets
      .map(b => ({
        name: categories.find(c => c.id === b.categoryId)?.name || 'Kategori',
        pct: Math.round(((spentBy.get(b.categoryId) || 0) / b.limit) * 100),
        left: b.limit - (spentBy.get(b.categoryId) || 0),
      }))
      .sort((a, b) => b.pct - a.pct)[0];
    return { totalLimit, budgetedSpent, totalExpense, risky, count: monthBudgets.length };
  }, [budgets, transactions, selectedMonth, categories]);

  const pct = budget.totalLimit > 0 ? Math.round((budget.budgetedSpent / budget.totalLimit) * 100) : 0;
  const remaining = budget.totalLimit - budget.budgetedSpent;
  const money = (v: number) => (hideBalance ? '••••' : formatIDR(v, true));

  return (
    <section className="card overflow-hidden">
      {/* Budget */}
      <button
        onClick={() => {
          sounds.playPop();
          onGoToBudgets();
        }}
        className="w-full text-left p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
      >
        <div className="flex items-center justify-between">
          <h3 className="section-title">Anggaran bulan ini</h3>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </div>

        {budget.count === 0 ? (
          <p className="text-xs text-muted mt-1">
            Belum ada batas anggaran. Ketuk untuk mengatur supaya pengeluaran terkontrol.
          </p>
        ) : (
          <>
            <div className="flex items-baseline justify-between mt-2">
              <p className="text-xs text-muted">
                <span className="text-base font-bold num text-zinc-900 dark:text-zinc-100">
                  {money(budget.budgetedSpent)}
                </span>{' '}
                / {money(budget.totalLimit)}
              </p>
              <p className={`text-xs font-semibold num ${remaining >= 0 ? 'text-muted' : 'text-rose-500'}`}>
                {remaining >= 0 ? `Sisa ${money(remaining)}` : `Lebih ${money(-remaining)}`}
              </p>
            </div>
            <div className="track mt-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor(pct)}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            {budget.risky && budget.risky.pct >= 70 && (
              <p className="text-[11px] mt-2 text-amber-600 dark:text-amber-400 font-medium">
                {budget.risky.name} sudah {budget.risky.pct}% terpakai
                {budget.risky.left > 0 ? ` · sisa ${money(budget.risky.left)}` : ''}
              </p>
            )}
          </>
        )}
      </button>

    </section>
  );
};
