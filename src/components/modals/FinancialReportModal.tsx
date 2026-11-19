import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR, getMonthName, formatDateIndonesian } from '../../utils/format';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';

interface FinancialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinancialReportModal: React.FC<FinancialReportModalProps> = ({ isOpen, onClose }) => {
  const { transactions, categories, selectedMonth, monthlyStats, wallets, healthScoreData } = useFinance();

  if (!isOpen) return null;

  const monthExpenses = transactions.filter(
    t => t.type === 'expense' && t.date.startsWith(selectedMonth)
  );

  const monthIncomes = transactions.filter(
    t => t.type === 'income' && t.date.startsWith(selectedMonth)
  );

  // Category breakdown
  const categoryMap = new Map<string, number>();
  for (const t of monthExpenses) {
    categoryMap.set(t.categoryId, (categoryMap.get(t.categoryId) || 0) + t.amount);
  }

  const categoryList = Array.from(categoryMap.entries()).map(([catId, amount]) => {
    const cat = categories.find(c => c.id === catId);
    return {
      name: cat?.name || 'Lain-lain',
      amount,
      percentage: monthlyStats.expense > 0 ? Math.round((amount / monthlyStats.expense) * 100) : 0,
    };
  }).sort((a, b) => b.amount - a.amount);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-ios-elevated z-10 max-h-[90vh] overflow-y-auto border border-zinc-200 dark:border-zinc-800">
        {/* Header Action */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Laporan Keuangan Bulanan
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-emerald-600 transition-all active:scale-95 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div id="printable-report" className="py-5 space-y-5 text-zinc-800 dark:text-zinc-200">
          {/* Header Banner */}
          <div className="text-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
              MONEY TALK FINANCIAL REPORT
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Periode Pembukuan: {getMonthName(selectedMonth)}
            </p>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase">Pemasukan</span>
              <p className="text-xs sm:text-sm font-bold text-emerald-500 mt-0.5">
                {formatIDR(monthlyStats.income)}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase">Pengeluaran</span>
              <p className="text-xs sm:text-sm font-bold text-rose-500 mt-0.5">
                {formatIDR(monthlyStats.expense)}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase">Sisa Bersih</span>
              <p className="text-xs sm:text-sm font-bold text-indigo-500 mt-0.5">
                {formatIDR(monthlyStats.netSavings)}
              </p>
            </div>
          </div>

          {/* Health Summary */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-emerald-950 dark:text-emerald-200">
                Skor Finansial: {healthScoreData.score}/100 ({healthScoreData.rating})
              </span>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                Rasio Tabungan: {monthlyStats.savingsRate}% dari total pemasukan.
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          </div>

          {/* Table: Breakdown Kategori */}
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-2">
              Rincian Pengeluaran per Kategori
            </h4>
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              {categoryList.map((c, i) => (
                <div key={i} className="px-3.5 py-2 flex items-center justify-between">
                  <span className="font-medium">{c.name}</span>
                  <div className="space-x-2 text-right">
                    <span className="text-zinc-400">({c.percentage}%)</span>
                    <span className="font-bold">{formatIDR(c.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Major Transactions */}
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-2">
              10 Transaksi Terakhir Bulan Ini
            </h4>
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              {transactions
                .filter(t => t.date.startsWith(selectedMonth))
                .slice(0, 10)
                .map(t => (
                  <div key={t.id} className="px-3.5 py-2 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{t.note || 'Transaksi'}</p>
                      <p className="text-[10px] text-zinc-400">{t.date}</p>
                    </div>
                    <span
                      className={`font-bold ${
                        t.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'
                      }`}
                    >
                      {t.type === 'expense' ? '-' : '+'}{formatIDR(t.amount)}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="text-center pt-2 text-[10px] text-zinc-400">
            Dicetak otomatis dari Money Talk App • Data tersimpan aman di perangkat lokal
          </div>
        </div>
      </div>
    </div>
  );
};
