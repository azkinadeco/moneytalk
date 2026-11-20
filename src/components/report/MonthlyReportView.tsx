import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR, getMonthName } from '../../utils/format';
import { DynamicIcon } from '../common/DynamicIcon';
import { HealthScoreCard } from '../dashboard/HealthScoreCard';
import {
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Share2,
  FileText,
  Sparkles,
  Check,
  Copy,
  X,
  Search,
  Wallet,
  ArrowRight,
  DollarSign,
  Activity,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';

interface MonthlyReportViewProps {
  onOpenReportPdf?: () => void;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({ onOpenReportPdf }) => {
  const {
    transactions,
    categories,
    wallets,
    selectedMonth,
    setSelectedMonth,
    monthlyStats,
    hideBalance,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'trend'>('expense');
  const [selectedCategoryModal, setSelectedCategoryModal] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [hoveredSliceIndex, setHoveredSliceIndex] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Month navigation: Prev & Next month helpers
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const newY = prevDate.getFullYear();
    const newM = String(prevDate.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newY}-${newM}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const newY = nextDate.getFullYear();
    const newM = String(nextDate.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newY}-${newM}`);
  };

  // Month's all transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Expenses breakdown
  const expenseData = useMemo(() => {
    const expenses = monthTransactions.filter(t => t.type === 'expense');
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);

    const catMap = new Map<string, { amount: number; count: number }>();
    for (const t of expenses) {
      const cur = catMap.get(t.categoryId) || { amount: 0, count: 0 };
      catMap.set(t.categoryId, { amount: cur.amount + t.amount, count: cur.count + 1 });
    }

    const items = Array.from(catMap.entries())
      .map(([categoryId, data]) => {
        const cat = categories.find(c => c.id === categoryId) || {
          name: 'Lain-lain',
          icon: 'Package',
          color: '#9CA3AF',
        };
        const percentage = total > 0 ? Math.round((data.amount / total) * 100) : 0;
        return {
          categoryId,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          amount: data.amount,
          count: data.count,
          percentage,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return { total, count: expenses.length, items };
  }, [monthTransactions, categories]);

  // Income breakdown
  const incomeData = useMemo(() => {
    const incomes = monthTransactions.filter(t => t.type === 'income');
    const total = incomes.reduce((sum, t) => sum + t.amount, 0);

    const catMap = new Map<string, { amount: number; count: number }>();
    for (const t of incomes) {
      const cur = catMap.get(t.categoryId) || { amount: 0, count: 0 };
      catMap.set(t.categoryId, { amount: cur.amount + t.amount, count: cur.count + 1 });
    }

    const items = Array.from(catMap.entries())
      .map(([categoryId, data]) => {
        const cat = categories.find(c => c.id === categoryId) || {
          name: 'Sumber Lain',
          icon: 'Coins',
          color: '#10B981',
        };
        const percentage = total > 0 ? Math.round((data.amount / total) * 100) : 0;
        return {
          categoryId,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          amount: data.amount,
          count: data.count,
          percentage,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return { total, count: incomes.length, items };
  }, [monthTransactions, categories]);

  // Daily Cashflow Trend (Days 1 to 31)
  const dailyCashflow = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: { day: number; expense: number; income: number; dateStr: string }[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${selectedMonth}-${dayStr}`;
      const dayTx = monthTransactions.filter(t => t.date === dateStr);
      const exp = dayTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const inc = dayTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      days.push({ day: d, expense: exp, income: inc, dateStr });
    }

    const maxVal = Math.max(
      ...days.map(d => Math.max(d.expense, d.income)),
      100000
    );

    // Highest expense day
    const peakExpenseDay = [...days].sort((a, b) => b.expense - a.expense)[0];

    // Days elapsed or active
    const activeDaysCount = days.filter(d => d.expense > 0 || d.income > 0).length || 1;
    const now = new Date();
    const isCurrent = year === now.getFullYear() && month === now.getMonth() + 1;
    const elapsed = isCurrent ? now.getDate() : daysInMonth;
    const dailyAverage = Math.round(expenseData.total / Math.max(1, elapsed));

    return { days, maxVal, peakExpenseDay, dailyAverage, daysInMonth };
  }, [selectedMonth, monthTransactions, expenseData.total]);

  // Batch 66: 6-Month Historical Cashflow Comparison
  const sixMonthsTrend = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const months: {
      monthStr: string;
      shortLabel: string;
      income: number;
      expense: number;
    }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const mStr = `${y}-${m}`;
      const shortLabel = d.toLocaleDateString('id-ID', { month: 'short' });

      let inc = 0;
      let exp = 0;
      for (const tx of transactions) {
        if (tx.date.startsWith(mStr)) {
          if (tx.type === 'income') inc += tx.amount;
          else if (tx.type === 'expense') exp += tx.amount;
        }
      }
      months.push({ monthStr: mStr, shortLabel, income: inc, expense: exp });
    }

    const maxMonthVal = Math.max(
      ...months.map(m => Math.max(m.income, m.expense)),
      100000
    );

    return { months, maxMonthVal };
  }, [selectedMonth, transactions]);

  // Batch 66: Expense Distribution by Wallet
  const walletExpenseBreakdown = useMemo(() => {
    const expenses = monthTransactions.filter(t => t.type === 'expense');
    const total = expenses.reduce((s, t) => s + t.amount, 0);
    const map = new Map<string, { amount: number; count: number }>();

    for (const t of expenses) {
      const cur = map.get(t.walletId) || { amount: 0, count: 0 };
      map.set(t.walletId, { amount: cur.amount + t.amount, count: cur.count + 1 });
    }

    return Array.from(map.entries())
      .map(([walletId, data]) => {
        const wal = wallets.find(w => w.id === walletId) || {
          name: 'Dompet',
          color: '#64748B',
          icon: 'Wallet',
        };
        const percentage = total > 0 ? Math.round((data.amount / total) * 100) : 0;
        return {
          walletId,
          name: wal.name,
          color: wal.color,
          icon: wal.icon,
          amount: data.amount,
          count: data.count,
          percentage,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [monthTransactions, wallets]);

  // Selected Category Transactions for Drilldown Modal
  const drilldownCategory = useMemo(() => {
    if (!selectedCategoryModal) return null;
    const cat = categories.find(c => c.id === selectedCategoryModal) || {
      id: selectedCategoryModal,
      name: 'Kategori',
      icon: 'Package',
      color: '#10B981',
      type: 'expense' as const,
    };
    const txs = monthTransactions.filter(t => t.categoryId === selectedCategoryModal);
    const total = txs.reduce((sum, t) => sum + t.amount, 0);
    return { cat, txs, total };
  }, [selectedCategoryModal, categories, monthTransactions]);

  // Share text builder
  const shareText = useMemo(() => {
    const net = incomeData.total - expenseData.total;
    const topExp = expenseData.items.slice(0, 3).map((it, idx) => `${idx + 1}. ${it.name}: ${formatIDR(it.amount)} (${it.percentage}%)`).join('\n');
    return `📊 *LAPORAN KEUANGAN ${getMonthName(selectedMonth).toUpperCase()}*
Aplikasi: Money Talk

💰 *Pemasukan*: ${formatIDR(incomeData.total)}
🛒 *Pengeluaran*: ${formatIDR(expenseData.total)}
📈 *Sisa Kas Bersih*: ${formatIDR(net)} (${net >= 0 ? 'Surplus ✅' : 'Defisit ⚠️'})
💡 *Rata-rata Pengeluaran/Hari*: ${formatIDR(dailyCashflow.dailyAverage)}

🔍 *Top 3 Pengeluaran*:
${topExp || '- Belum ada pengeluaran'}

Catat & kontrol keuangan harianmu dengan Money Talk!`;
  }, [selectedMonth, incomeData.total, expenseData.total, expenseData.items, dailyCashflow.dailyAverage]);

  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    confetti({ particleCount: 40, spread: 60 });
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Helper to generate SVG Donut Chart Slices
  const renderDonutChart = (items: typeof expenseData.items, total: number) => {
    if (total === 0 || items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
          <PieChartIcon className="w-12 h-12 stroke-[1.2] mb-2 text-zinc-300 dark:text-zinc-700" />
          <p className="text-xs font-semibold">Belum ada transaksi di periode ini</p>
        </div>
      );
    }

    const radius = 64;
    const strokeWidth = 18;
    const center = 85;
    const circumference = 2 * Math.PI * radius;

    let accumulatedPercentage = 0;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-3">
        {/* SVG Donut Circle */}
        <div className="relative w-[170px] h-[170px] shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 170 170">
            {/* Background base track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-zinc-100 dark:text-zinc-800"
            />

            {/* Colored Category Slices */}
            {items.map((item, idx) => {
              const slicePercentage = item.amount / total;
              const strokeDasharray = `${slicePercentage * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPercentage * circumference;
              accumulatedPercentage += slicePercentage;
              const isHovered = hoveredSliceIndex === idx;

              return (
                <circle
                  key={item.categoryId}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="butt"
                  className="transition-all duration-300 cursor-pointer hover:opacity-90 active:scale-95"
                  onMouseEnter={() => {
                    setHoveredSliceIndex(idx);
                  }}
                  onMouseLeave={() => setHoveredSliceIndex(null)}
                  onTouchStart={() => {
                    sounds.playPop();
                    sounds.vibrate(10);
                    setHoveredSliceIndex(idx);
                  }}
                  onClick={() => {
                    sounds.playPop();
                    sounds.vibrate(15);
                    setSelectedCategoryModal(item.categoryId);
                  }}
                />
              );
            })}
          </svg>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              {hoveredSliceIndex !== null && items[hoveredSliceIndex]
                ? items[hoveredSliceIndex].name
                : 'Total'}
            </span>
            <span className="text-lg font-extrabold num text-zinc-900 dark:text-zinc-100">
              {hideBalance
                ? '••••••'
                : hoveredSliceIndex !== null && items[hoveredSliceIndex]
                ? formatIDR(items[hoveredSliceIndex].amount, true)
                : formatIDR(total, true)}
            </span>
            {hoveredSliceIndex !== null && items[hoveredSliceIndex] && (
              <span className="text-[10px] font-bold text-emerald-500">
                {items[hoveredSliceIndex].percentage}%
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const netCashflow = incomeData.total - expenseData.total;

  return (
    <div className="space-y-4">
      {/* Month stepper + actions */}
      <div className="flex items-center gap-2">
        <div className="card flex-1 h-11 flex items-center justify-between px-1">
          <button onClick={handlePrevMonth} aria-label="Bulan sebelumnya" className="icon-btn w-9 h-9">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 capitalize">
            {getMonthName(selectedMonth)}
          </span>
          <button onClick={handleNextMonth} aria-label="Bulan berikutnya" className="icon-btn w-9 h-9">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => setShowShareModal(true)}
          aria-label="Bagikan ringkasan"
          className="card w-11 h-11 shrink-0 flex items-center justify-center text-zinc-500 active:scale-95"
        >
          <Share2 className="w-[18px] h-[18px]" />
        </button>
        {onOpenReportPdf && (
          <button
            onClick={onOpenReportPdf}
            aria-label="Laporan PDF"
            className="w-11 h-11 shrink-0 rounded-2xl bg-emerald-500 text-white flex items-center justify-center active:scale-95"
          >
            <FileText className="w-[18px] h-[18px]" />
          </button>
        )}
      </div>

      {/* KPI summary */}
      <div className="card grid grid-cols-3 divide-x divide-zinc-100 dark:divide-zinc-800">
        {[
          { l: 'Pemasukan', v: incomeData.total, cls: 'text-emerald-600 dark:text-emerald-400' },
          { l: 'Pengeluaran', v: expenseData.total, cls: 'text-zinc-900 dark:text-zinc-100' },
          {
            l: netCashflow >= 0 ? 'Surplus' : 'Defisit',
            v: netCashflow,
            cls: netCashflow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500',
          },
        ].map(k => (
          <div key={k.l} className="px-3 py-3 min-w-0">
            <p className="text-[11px] text-muted">{k.l}</p>
            <p className={`text-[15px] font-bold num truncate ${k.cls}`}>
              {hideBalance ? '••••' : formatIDR(k.v, true)}
            </p>
          </div>
        ))}
      </div>

      <HealthScoreCard />

      {/* Tabbed Interactive Charts Section (Bagan Donut & Grafik) */}
      <div className="card p-4 space-y-4">
        {/* Segmented Chart Selector (44px min height) */}
        <div className="segmented grid-cols-3">
          {[
            { k: 'expense', l: 'Pengeluaran' },
            { k: 'income', l: 'Pemasukan' },
            { k: 'trend', l: 'Harian' },
          ].map(t => (
            <button
              key={t.k}
              onClick={() => setActiveTab(t.k as typeof activeTab)}
              className={`segment ${activeTab === t.k ? 'segment-active' : ''}`}
            >
              {t.l}
            </button>
          ))}
        </div>

        {(activeTab === 'expense' || activeTab === 'income') &&
          (() => {
            const data = activeTab === 'expense' ? expenseData : incomeData;
            const isExp = activeTab === 'expense';
            if (data.items.length === 0) {
              return (
                <p className="py-10 text-center text-sm text-muted">
                  Belum ada {isExp ? 'pengeluaran' : 'pemasukan'} di bulan ini.
                </p>
              );
            }
            return (
              <div className="space-y-4">
                {renderDonutChart(data.items, data.total)}
                <div className="-mx-4 border-t border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800/70">
                  {data.items.map(item => (
                    <button
                      key={item.categoryId}
                      onClick={() => setSelectedCategoryModal(item.categoryId)}
                      className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <span
                        className="icon-tile w-9 h-9"
                        style={{ backgroundColor: `${item.color}1f`, color: item.color }}
                      >
                        <DynamicIcon name={item.icon} className="w-[18px] h-[18px]" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {item.name}
                          </span>
                          <span className="text-sm font-bold num text-zinc-900 dark:text-zinc-100 shrink-0">
                            {hideBalance ? '••••' : formatIDR(item.amount)}
                          </span>
                        </span>
                        <span className="flex items-center gap-2 mt-1.5">
                          <span className="track flex-1">
                            <span
                              className="block h-full rounded-full"
                              style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                            />
                          </span>
                          <span className="text-[11px] text-muted num w-16 text-right shrink-0">
                            {item.percentage}% · {item.count}x
                          </span>
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

        {/* TAB 3: GRAFIK BATANG ARUS KAS HARIAN (F-06: Touch-First Interactive Chart) */}
        {activeTab === 'trend' && (() => {
          const activeDayNum =
            selectedDay ||
            (dailyCashflow.peakExpenseDay && dailyCashflow.peakExpenseDay.expense > 0
              ? dailyCashflow.peakExpenseDay.day
              : 1);
          const activeDayObj =
            dailyCashflow.days.find(d => d.day === activeDayNum) || dailyCashflow.days[0];
          const activeDayTxs = monthTransactions.filter(
            t => t.date === activeDayObj?.dateStr
          );

          return (
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Fluktuasi Arus Kas Harian
                  </h4>
                  <p className="text-[10px] text-zinc-400">
                    Ketuk batang tanggal untuk melihat rincian hari tersebut
                  </p>
                </div>

                {dailyCashflow.peakExpenseDay && dailyCashflow.peakExpenseDay.expense > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedDay(dailyCashflow.peakExpenseDay.day)}
                    className="text-right px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/15 transition-colors"
                  >
                    <span className="text-[10px] font-bold uppercase text-rose-500 block">
                      Puncak Belanja
                    </span>
                    <span className="text-[11px] font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
                      Tgl {dailyCashflow.peakExpenseDay.day} (
                      {formatIDR(dailyCashflow.peakExpenseDay.expense, true)})
                    </span>
                  </button>
                )}
              </div>

              {/* Interactive Selected Day Summary Banner */}
              {activeDayObj && (
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-750 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      Tanggal Terpilih
                    </span>
                    <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                      {activeDayObj.day} {getMonthName(selectedMonth)} ({activeDayTxs.length}{' '}
                      transaksi)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-right tabular-nums">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Masuk</span>
                      <span className="text-xs font-bold text-emerald-500">
                        +{formatIDR(activeDayObj.income, true)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Keluar</span>
                      <span className="text-xs font-bold text-rose-500">
                        -{formatIDR(activeDayObj.expense, true)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Touch-Friendly Responsive Bar Chart */}
              <div className="relative pt-2 pb-1">
                <div className="w-full h-44 flex items-end gap-[2px] px-0.5 border-b border-zinc-200 dark:border-zinc-800">
                  {dailyCashflow.days.map(d => {
                    const expHeight =
                      dailyCashflow.maxVal > 0
                        ? (d.expense / dailyCashflow.maxVal) * 128
                        : 0;
                    const incHeight =
                      dailyCashflow.maxVal > 0
                        ? (d.income / dailyCashflow.maxVal) * 128
                        : 0;
                    const isSelected = d.day === activeDayNum;
                    const showLabel =
                      d.day === 1 ||
                      d.day % 5 === 0 ||
                      d.day === dailyCashflow.daysInMonth ||
                      isSelected;

                    return (
                      <button
                        key={d.day}
                        type="button"
                        onClick={() => setSelectedDay(d.day)}
                        aria-label={`Tanggal ${d.day}: Masuk ${d.income}, Keluar ${d.expense}`}
                        className={`flex-1 flex flex-col items-center justify-end h-full rounded-t-lg transition-colors py-0.5 ${
                          isSelected
                            ? 'bg-emerald-500/10 dark:bg-emerald-500/15'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        <div className="w-full flex items-end justify-center gap-[1px] px-[1px]">
                          {d.income > 0 && (
                            <div
                              className="flex-1 max-w-[6px] rounded-t-sm bg-emerald-500 transition-all duration-300"
                              style={{ height: `${Math.max(incHeight, 6)}px` }}
                            />
                          )}
                          {d.expense > 0 && (
                            <div
                              className="flex-1 max-w-[6px] rounded-t-sm bg-rose-500 transition-all duration-300"
                              style={{ height: `${Math.max(expHeight, 6)}px` }}
                            />
                          )}
                          {d.income === 0 && d.expense === 0 && (
                            <div className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                          )}
                        </div>

                        <span
                          className={`text-[10px] mt-1.5 leading-none tabular-nums ${
                            isSelected
                              ? 'font-extrabold text-emerald-500'
                              : showLabel
                              ? 'font-semibold text-zinc-500 dark:text-zinc-400'
                              : 'opacity-0 pointer-events-none'
                          }`}
                        >
                          {d.day}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Chart Legend */}
                <div className="flex items-center justify-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-semibold text-zinc-500">Pemasukan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-[10px] font-semibold text-zinc-500">Pengeluaran</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* BATCH 66: 6-MONTH HISTORICAL COMPARISON & WALLET BREAKDOWN */}
      <div className="grid grid-cols-1 gap-4">
        {/* 6-Month Cashflow Trajectory Card */}
        <div className="p-4 card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                Perbandingan 6 Bulan Terakhir
              </h3>
              <p className="text-[10px] text-zinc-400">
                Ketuk bulan untuk berpindah periode laporan
              </p>
            </div>
            <BarChart3 className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="grid grid-cols-6 gap-2 pt-2 items-end h-36 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            {sixMonthsTrend.months.map(m => {
              const incH = Math.round((m.income / sixMonthsTrend.maxMonthVal) * 90);
              const expH = Math.round((m.expense / sixMonthsTrend.maxMonthVal) * 90);
              const isCurrent = m.monthStr === selectedMonth;

              return (
                <button
                  key={m.monthStr}
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    sounds.vibrate(10);
                    setSelectedMonth(m.monthStr);
                  }}
                  className={`flex flex-col items-center justify-end h-full rounded-xl p-1 transition-all active:scale-95 ${
                    isCurrent
                      ? 'bg-emerald-500/10 ring-1 ring-emerald-500/30'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-end justify-center gap-1 w-full h-24">
                    <div
                      className="w-2.5 rounded-t-md bg-emerald-500 transition-all duration-500"
                      style={{ height: `${m.income > 0 ? Math.max(incH, 6) : 3}px` }}
                      title={`Masuk: ${formatIDR(m.income)}`}
                    />
                    <div
                      className="w-2.5 rounded-t-md bg-rose-500 transition-all duration-500"
                      style={{ height: `${m.expense > 0 ? Math.max(expH, 6) : 3}px` }}
                      title={`Keluar: ${formatIDR(m.expense)}`}
                    />
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 tabular-nums ${
                      isCurrent
                        ? 'font-extrabold text-emerald-500'
                        : 'font-semibold text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {m.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
            <span>Rata-rata Pengeluaran Harian Bulan Ini:</span>
            <span className="font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {hideBalance ? '••••••' : `${formatIDR(dailyCashflow.dailyAverage, true)} / hari`}
            </span>
          </div>
        </div>

        {/* Wallet Spending Distribution Card */}
        {walletExpenseBreakdown.length > 0 && (
          <div className="p-4 card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                Pengeluaran per Sumber Dompet
              </h3>
              <span className="text-[10px] font-bold text-zinc-400">
                {walletExpenseBreakdown.length} Akun Aktif
              </span>
            </div>

            <div className="space-y-2.5">
              {walletExpenseBreakdown.map(w => (
                <div key={w.walletId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: w.color }}
                      />
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {w.name}
                      </span>
                      <span className="text-[10px] text-zinc-400">({w.count}x)</span>
                    </div>
                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                        {hideBalance ? '••••••' : formatIDR(w.amount, true)}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400 w-8 text-right">
                        {w.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${w.percentage}%`, backgroundColor: w.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CATEGORY DRILLDOWN MODAL (BATCH 34) */}
      {drilldownCategory && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setSelectedCategoryModal(null)} />

          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] p-5 pb-safe-bottom shadow-ios-elevated animate-slide-up z-10 max-h-[85vh] overflow-y-auto border-t border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-3" />

            {/* Category Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: drilldownCategory.cat.color }}
                >
                  <DynamicIcon name={drilldownCategory.cat.icon} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {drilldownCategory.cat.name}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Total {formatIDR(drilldownCategory.total)} • {drilldownCategory.txs.length} transaksi
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCategoryModal(null)}
                aria-label="Tutup"
                className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Transaction List */}
            <div className="space-y-2">
              {drilldownCategory.txs.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 text-xs">
                  Tidak ada transaksi tercatat pada periode ini
                </div>
              ) : (
                drilldownCategory.txs.map(t => {
                  const wal = wallets.find(w => w.id === t.walletId);
                  return (
                    <div
                      key={t.id}
                      className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {t.note || drilldownCategory.cat.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                          <span>{t.date}</span>
                          {t.time && <span>• {t.time}</span>}
                          {wal && <span>• {wal.name}</span>}
                        </div>
                      </div>

                      <span
                        className={`text-xs font-extrabold ${
                          t.type === 'expense'
                            ? 'text-rose-500'
                            : 'text-emerald-500'
                        }`}
                      >
                        {t.type === 'expense' ? '-' : '+'}
                        {formatIDR(t.amount)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* SHARE SUMMARY MODAL (BATCH 35) */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowShareModal(false)} />

          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] p-5 pb-safe-bottom shadow-ios-elevated z-10 border-t border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-500" />
                <span>Bagikan Ringkasan Laporan</span>
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-3">
              Salin ringkasan ini untuk dikirim ke chat WhatsApp atau catatan pribadi
            </p>

            {/* Preview Box */}
            <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700 font-mono text-[11px] text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {shareText}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCopyShare}
                className="flex-1 min-h-[46px] py-2.5 px-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Format WhatsApp</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowShareModal(false)}
                className="min-h-[46px] px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs active:scale-95"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
