import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { TabType } from '../../types';
import { formatIDR, getTodayDateString } from '../../utils/format';
import { sounds } from '../../utils/audio';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';

interface BalanceCardProps {
  onNavigate: (tab: TabType | 'recurring') => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ onNavigate }) => {
  const { totalBalance, hideBalance, toggleHideBalance, monthlyStats, transactions } =
    useFinance();

  const todayExpense = useMemo(() => {
    const today = getTodayDateString();
    return transactions
      .filter(t => t.type === 'expense' && t.date === today)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const mask = (v: string) => (hideBalance ? 'Rp ••••••' : v);
  const net = monthlyStats.income - monthlyStats.expense;

  return (
    <section className="relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 shadow-ios-card">
      <div className="absolute -top-16 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('wallets')}
            className="flex items-center gap-1 text-xs font-medium text-white/75 hover:text-white"
          >
            Total saldo
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              sounds.playPop();
              toggleHideBalance();
            }}
            aria-label={hideBalance ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
            className="w-9 h-9 -mr-2 rounded-full flex items-center justify-center text-white/75 hover:bg-white/10 active:scale-90 transition-all"
          >
            {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-[32px] leading-tight font-extrabold num mt-0.5">{mask(formatIDR(totalBalance))}</p>
        <p className="text-xs text-white/70 mt-1">
          Hari ini keluar{' '}
          <span className="font-semibold text-white num">{mask(formatIDR(todayExpense))}</span>
        </p>

        {/* Month summary */}
        <div className="mt-4 grid grid-cols-3 rounded-2xl bg-black/15 divide-x divide-white/10">
          {[
            { label: 'Masuk', value: monthlyStats.income, cls: 'text-white' },
            { label: 'Keluar', value: monthlyStats.expense, cls: 'text-white' },
            { label: 'Selisih', value: net, cls: net >= 0 ? 'text-emerald-200' : 'text-rose-200' },
          ].map(s => (
            <div key={s.label} className="px-3 py-2.5 min-w-0">
              <p className="text-[10px] font-medium text-white/60 uppercase tracking-wide">{s.label}</p>
              <p className={`text-sm font-bold num truncate ${s.cls}`}>
                {hideBalance ? '••••' : `${s.label === 'Selisih' && net > 0 ? '+' : ''}${formatIDR(s.value, true)}`}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
