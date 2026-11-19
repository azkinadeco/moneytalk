import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR, getMonthName, formatDateIndonesian } from '../../utils/format';
import { DynamicIcon } from '../common/DynamicIcon';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export const FinancialCalendarView: React.FC = () => {
  const { transactions, recurring, categories, selectedMonth, hideBalance } = useFinance();
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());

  const [year, month] = selectedMonth.split('-').map(Number);

  // Calculate days in month and starting day of week
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 is Sunday

  // Map transactions by day
  const dayStatsMap = useMemo(() => {
    const map = new Map<number, { income: number; expense: number; hasRecurring: boolean }>();

    for (let d = 1; d <= daysInMonth; d++) {
      map.set(d, { income: 0, expense: 0, hasRecurring: false });
    }

    // Transactions
    for (const tx of transactions) {
      if (tx.date.startsWith(selectedMonth)) {
        const d = parseInt(tx.date.split('-')[2], 10);
        if (map.has(d)) {
          const cur = map.get(d)!;
          if (tx.type === 'income') cur.income += tx.amount;
          if (tx.type === 'expense') cur.expense += tx.amount;
        }
      }
    }

    // Recurring bills due on day
    for (const r of recurring) {
      if (r.isActive && map.has(r.dayOfMonth)) {
        map.get(r.dayOfMonth)!.hasRecurring = true;
      }
    }

    return map;
  }, [transactions, recurring, selectedMonth, daysInMonth]);

  // Selected date transactions
  const selectedDateStr = `${selectedMonth}-${String(selectedDay).padStart(2, '0')}`;
  const dayTransactions = transactions.filter(t => t.date === selectedDateStr);
  const dayRecurring = recurring.filter(r => r.isActive && r.dayOfMonth === selectedDay);

  const selectedStats = dayStatsMap.get(selectedDay) || { income: 0, expense: 0, hasRecurring: false };

  const getCategory = (catId: string) => {
    return categories.find(c => c.id === catId) || { name: 'Lain-lain', icon: 'HelpCircle', color: '#6B7280' };
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Calendar Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Kalender Arus Kas • {getMonthName(selectedMonth)}
            </h3>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-zinc-400">
          <span>MIN</span>
          <span>SEN</span>
          <span>SEL</span>
          <span>RAB</span>
          <span>KAM</span>
          <span>JUM</span>
          <span>SAB</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Leading empty slots */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const stats = dayStatsMap.get(dayNum);
            const isSelected = selectedDay === dayNum;

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDay(dayNum)}
                className={`h-11 rounded-xl flex flex-col items-center justify-center relative transition-all active:scale-90 ${
                  isSelected
                    ? 'bg-emerald-500 text-white font-extrabold shadow-md shadow-emerald-500/20'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold'
                }`}
              >
                <span className="text-xs">{dayNum}</span>

                {/* Dot Indicators */}
                <div className="flex gap-0.5 mt-0.5">
                  {stats && stats.expense > 0 && (
                    <span
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-rose-500'
                      }`}
                    />
                  )}
                  {stats && stats.income > 0 && (
                    <span
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-emerald-400'
                      }`}
                    />
                  )}
                  {stats && stats.hasRecurring && (
                    <span
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-blue-400'
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Pengeluaran
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Pemasukan
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Tagihan Rutin
          </span>
        </div>
      </div>

      {/* Selected Day Details */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Aktivitas Tanggal</span>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {formatDateIndonesian(selectedDateStr)} ({selectedDateStr})
            </h4>
          </div>

          <div className="text-right text-xs">
            {selectedStats.expense > 0 && (
              <p className="text-rose-500 font-bold">-{formatIDR(selectedStats.expense)}</p>
            )}
            {selectedStats.income > 0 && (
              <p className="text-emerald-500 font-bold">+{formatIDR(selectedStats.income)}</p>
            )}
          </div>
        </div>

        {/* Scheduled bills for today */}
        {dayRecurring.length > 0 && (
          <div className="space-y-1.5 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
              Jatuh Tempo Hari Ini:
            </span>
            {dayRecurring.map(rec => (
              <div
                key={rec.id}
                className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-blue-900 dark:text-blue-200">{rec.name}</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{formatIDR(rec.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Transactions list on this day */}
        {dayTransactions.length === 0 ? (
          <p className="text-xs text-zinc-400 py-3 text-center">
            Tidak ada transaksi tercatat pada tanggal ini
          </p>
        ) : (
          <div className="space-y-2">
            {dayTransactions.map(t => {
              const cat = getCategory(t.categoryId);
              const isExpense = t.type === 'expense';

              return (
                <div
                  key={t.id}
                  className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      <DynamicIcon name={cat.icon} className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">{t.note || cat.name}</p>
                      <span className="text-[10px] text-zinc-400">{cat.name}</span>
                    </div>
                  </div>

                  <span
                    className={`font-bold ${
                      isExpense ? 'text-rose-500' : 'text-emerald-500'
                    }`}
                  >
                    {hideBalance ? '••••••' : `${isExpense ? '-' : '+'}${formatIDR(t.amount)}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
