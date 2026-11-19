import React, { useMemo, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR } from '../../utils/format';
import { sounds } from '../../utils/audio';
import { ChevronDown, ChevronRight, TrendingDown, TrendingUp } from 'lucide-react';

const barColor = (pct: number) =>
  pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500';

/** "Bulan ini" insight card: budget usage, riskiest category and financial health score. */
export const QuickBudgetBar: React.FC<{ onGoToBudgets: () => void }> = ({ onGoToBudgets }) => {
  const { budgets, transactions, selectedMonth, categories, healthScoreData, monthComparison, hideBalance } =
    useFinance();
  const [showHealth, setShowHealth] = useState(false);

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
  const score = healthScoreData.score;
  const scoreCls = score >= 75 ? 'text-emerald-500' : score >= 55 ? 'text-amber-500' : 'text-rose-500';
  const scoreStroke = score >= 75 ? '#10B981' : score >= 55 ? '#F59E0B' : '#F43F5E';
  const lower = monthComparison.expenseDiff <= 0;
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

      {/* Health score */}
      <div className="border-t border-zinc-100 dark:border-zinc-800/70">
        <button
          onClick={() => {
            sounds.playPop();
            setShowHealth(v => !v);
          }}
          className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
          aria-expanded={showHealth}
        >
          <div className="relative w-10 h-10 shrink-0">
            <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3.5" className="stroke-zinc-100 dark:stroke-zinc-800" />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke={scoreStroke}
                strokeDasharray={`${(score / 100) * 94.25} 94.25`}
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold num ${scoreCls}`}>
              {score}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Kesehatan keuangan: {healthScoreData.rating}
            </p>
            {monthComparison.prevExpense > 0 ? (
              <p className={`text-xs mt-0.5 flex items-center gap-1 ${lower ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                {lower ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                Pengeluaran {lower ? 'turun' : 'naik'} {Math.abs(monthComparison.expenseDiffPercent)}% vs bulan lalu
              </p>
            ) : (
              <p className="text-xs text-muted mt-0.5">Ketuk untuk lihat rincian skor</p>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${showHealth ? 'rotate-180' : ''}`} />
        </button>

        {showHealth && (
          <div className="px-4 pb-4 space-y-3 animate-fade-in">
            <div>
              <div className="flex h-2 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 gap-px">
                <div className="bg-sky-500" style={{ width: `${healthScoreData.breakdown.needsPercentage}%` }} />
                <div className="bg-amber-500" style={{ width: `${healthScoreData.breakdown.wantsPercentage}%` }} />
                <div className="bg-emerald-500" style={{ width: `${healthScoreData.breakdown.savingsPercentage}%` }} />
              </div>
              <div className="flex justify-between mt-1.5 text-[11px] text-muted">
                <span><b className="text-sky-500">{healthScoreData.breakdown.needsPercentage}%</b> Kebutuhan</span>
                <span><b className="text-amber-500">{healthScoreData.breakdown.wantsPercentage}%</b> Keinginan</span>
                <span><b className="text-emerald-500">{healthScoreData.breakdown.savingsPercentage}%</b> Sisa</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Ideal: 50% kebutuhan · 30% keinginan · 20% tabungan</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Tabungan', v: healthScoreData.details.savingsRateScore, max: 40 },
                { label: 'Disiplin budget', v: healthScoreData.details.budgetDisciplineScore, max: 35 },
                { label: 'Dana darurat', v: healthScoreData.details.emergencyFundScore, max: 25 },
              ].map(d => (
                <div key={d.label} className="rounded-xl surface-muted py-2">
                  <p className="text-sm font-bold num text-zinc-900 dark:text-zinc-100">
                    {d.v}
                    <span className="text-zinc-400 font-medium">/{d.max}</span>
                  </p>
                  <p className="text-[10px] text-muted">{d.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
