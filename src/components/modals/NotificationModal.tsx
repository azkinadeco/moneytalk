import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR } from '../../utils/format';
import { Bell, X, AlertTriangle, Calendar, CheckCircle2, HandCoins } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { budgets, transactions, recurring, debts, selectedMonth } = useFinance();

  if (!isOpen) return null;

  // Generate dynamic contextual alerts
  const notifications: {
    id: string;
    title: string;
    desc: string;
    type: 'warning' | 'info' | 'success';
    time: string;
  }[] = [];

  // 1. Budget Alerts
  for (const b of budgets.filter(bg => bg.month === selectedMonth)) {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.categoryId === b.categoryId && t.date.startsWith(selectedMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    const percent = Math.round((spent / b.limit) * 100);
    if (percent >= 100) {
      notifications.push({
        id: `notif-b-over-${b.id}`,
        title: '⚠️ Peringatan: Over Budget!',
        desc: `Pengeluaran kamu telah mencapai ${percent}% (${formatIDR(spent)}) dari pagu yang ditetapkan.`,
        type: 'warning',
        time: 'Hari ini',
      });
    } else if (percent >= 80) {
      notifications.push({
        id: `notif-b-near-${b.id}`,
        title: 'Waspada Pagu Bulanan',
        desc: `Pengeluaran sudah mencapai ${percent}% dari pagu. Sisa batas aman: ${formatIDR(b.limit - spent)}.`,
        type: 'warning',
        time: 'Hari ini',
      });
    }
  }

  // 2. Upcoming Recurring Bills
  const todayDay = new Date().getDate();
  for (const r of recurring.filter(rc => rc.isActive)) {
    const daysUntil = r.dayOfMonth - todayDay;
    if (daysUntil >= 0 && daysUntil <= 3) {
      notifications.push({
        id: `notif-rec-${r.id}`,
        title: `Tagihan Jatuh Tempo: ${r.name}`,
        desc: `Nominal ${formatIDR(r.amount)} dijadwalkan jatuh tempo pada tanggal ${r.dayOfMonth}.`,
        type: 'info',
        time: daysUntil === 0 ? 'Hari ini' : `${daysUntil} hari lagi`,
      });
    }
  }

  // 3. Outstanding Receivables
  const unpaidDebts = debts.filter(d => d.type === 'receivable' && !d.isCompleted);
  if (unpaidDebts.length > 0) {
    const totalUnpaid = unpaidDebts.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
    notifications.push({
      id: 'notif-debts',
      title: 'Piutang Menunggu Ditagih',
      desc: `Ada ${unpaidDebts.length} teman yang belum melunasi pinjaman senilai total ${formatIDR(totalUnpaid)}.`,
      type: 'info',
      time: 'Kemarin',
    });
  }

  // Fallback if none
  if (notifications.length === 0) {
    notifications.push({
      id: 'notif-safe',
      title: 'Arus Kas Terkendali ✓',
      desc: 'Tidak ada tagihan mendesak atau batas anggaran yang terlampaui saat ini.',
      type: 'success',
      time: 'Baru saja',
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] p-5 pb-safe-bottom shadow-ios-elevated animate-slide-up z-10 max-h-[85vh] overflow-y-auto border-t border-zinc-200/80 dark:border-zinc-800">
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Pusat Notifikasi & Pengingat
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                n.type === 'warning'
                  ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                  : n.type === 'info'
                  ? 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40'
                  : 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {n.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                ) : n.type === 'info' ? (
                  <Calendar className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{n.title}</h4>
                    <span className="text-[10px] text-zinc-400">{n.time}</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    {n.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
