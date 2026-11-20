import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { sounds } from '../../utils/audio';
import { ChevronDown, TrendingDown, TrendingUp } from 'lucide-react';

/** Financial health score (savings, budget discipline, emergency fund) with 50/30/20 breakdown. */
export const HealthScoreCard: React.FC = () => {
  const { healthScoreData, monthComparison } = useFinance();
  const [showHealth, setShowHealth] = useState(false);
  const score = healthScoreData.score;
  const scoreCls = score >= 75 ? 'text-emerald-500' : score >= 55 ? 'text-amber-500' : 'text-rose-500';
  const scoreStroke = score >= 75 ? '#10B981' : score >= 55 ? '#F59E0B' : '#F43F5E';
  const lower = monthComparison.expenseDiff <= 0;

  return (
      <section className="card overflow-hidden">
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
      </section>
  );
};
