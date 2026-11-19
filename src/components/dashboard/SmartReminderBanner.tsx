import React, { useMemo, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR, getCurrentMonthString } from '../../utils/format';
import { sounds } from '../../utils/audio';
import { Repeat, X } from 'lucide-react';
import { TabType } from '../../types';

interface SmartReminderBannerProps {
  onNavigate: (tab: TabType | 'recurring') => void;
}

/** Shows the most urgent unpaid recurring bill (due within 5 days or overdue) with 1-tap pay. */
export const SmartReminderBanner: React.FC<SmartReminderBannerProps> = ({ onNavigate }) => {
  const { recurring, executeRecurring, hideBalance } = useFinance();
  const [dismissed, setDismissed] = useState<string[]>([]);

  const due = useMemo(() => {
    const month = getCurrentMonthString();
    const today = new Date().getDate();
    return recurring
      .filter(r => r.isActive && r.type === 'expense' && !dismissed.includes(r.id))
      .filter(r => !r.lastExecuted?.startsWith(month))
      .map(r => ({ ...r, diff: r.dayOfMonth - today }))
      .filter(r => r.diff <= 5)
      .sort((a, b) => a.diff - b.diff);
  }, [recurring, dismissed]);

  if (due.length === 0) return null;
  const bill = due[0];
  const when =
    bill.diff < 0 ? `Terlewat ${-bill.diff} hari` : bill.diff === 0 ? 'Jatuh tempo hari ini' : `${bill.diff} hari lagi`;

  return (
    <section className="card p-3 flex items-center gap-3 animate-fade-in">
      <button onClick={() => onNavigate('recurring')} className="flex items-center gap-3 min-w-0 flex-1 text-left">
        <span className="icon-tile bg-indigo-500/10 text-indigo-500">
          <Repeat className="w-[18px] h-[18px]" />
        </span>
        <span className="min-w-0">
          <span className={`block text-[11px] font-semibold ${bill.diff < 0 ? 'text-rose-500' : 'text-indigo-500'}`}>
            {when}
            {due.length > 1 ? ` · +${due.length - 1} tagihan lain` : ''}
          </span>
          <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {bill.name} <span className="text-muted font-medium num">{hideBalance ? '••••' : formatIDR(bill.amount)}</span>
          </span>
        </span>
      </button>
      <button
        onClick={() => {
          sounds.playSuccess();
          sounds.vibrate(30);
          executeRecurring(bill.id);
        }}
        className="btn-sm btn bg-indigo-500 text-white hover:bg-indigo-600"
      >
        Bayar
      </button>
      <button
        onClick={() => setDismissed(prev => [...prev, bill.id])}
        aria-label="Sembunyikan pengingat"
        className="w-8 h-8 -mr-1 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        <X className="w-4 h-4" />
      </button>
    </section>
  );
};
