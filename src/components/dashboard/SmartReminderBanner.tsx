import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR } from '../../utils/format';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { BellRing, Check, ChevronRight, X, Repeat } from 'lucide-react';
import { TabType } from '../../types';

interface SmartReminderBannerProps {
  onNavigate: (tab: TabType | 'recurring') => void;
}

export const SmartReminderBanner: React.FC<SmartReminderBannerProps> = ({ onNavigate }) => {
  const { recurring, executeRecurring, selectedMonth, hideBalance } = useFinance();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [justPaidName, setJustPaidName] = useState<string | null>(null);

  const dueRecurring = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();

    return recurring.filter(rec => {
      if (!rec.isActive) return false;
      if (dismissedIds.includes(rec.id)) return false;
      const alreadyExecutedThisMonth =
        rec.lastExecuted && rec.lastExecuted.startsWith(selectedMonth);
      if (alreadyExecutedThisMonth) return false;

      // Show if due within 5 days or past due day in current month
      const dayDiff = rec.dayOfMonth - currentDay;
      return dayDiff <= 5;
    });
  }, [recurring, dismissedIds, selectedMonth]);

  if (justPaidName) {
    return (
      <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>Tagihan "{justPaidName}" berhasil dicatat otomatis!</span>
        </div>
      </div>
    );
  }

  if (dueRecurring.length === 0) return null;

  const topBill = dueRecurring[0];

  const handlePayNow = () => {
    sounds.playSuccess();
    sounds.vibrate(35);
    executeRecurring(topBill.id);
    setJustPaidName(topBill.name);
    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.7 },
    });
    setTimeout(() => {
      setJustPaidName(null);
    }, 3500);
  };

  const handleDismiss = () => {
    sounds.playPop();
    setDismissedIds(prev => [...prev, topBill.id]);
  };

  return (
    <div className="p-3.5 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-between gap-2.5 animate-in fade-in duration-200">
      <div
        onClick={() => onNavigate('recurring')}
        className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
      >
        <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Repeat className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-500">
              Pengingat Tagihan • Tgl {topBill.dayOfMonth}
            </span>
          </div>
          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {topBill.name} •{' '}
            <span className="text-indigo-600 dark:text-indigo-400 tabular-nums">
              {hideBalance ? '••••••' : formatIDR(topBill.amount, true)}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handlePayNow}
          className="min-h-[36px] px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold active:scale-95 transition-all shadow-xs"
        >
          Catat 1-Tap
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Sembunyikan pengingat"
          className="w-8 h-8 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center justify-center active:scale-90"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
