import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR, getCurrentMonthString } from '../../utils/format';
import { AlertTriangle, Calendar, CheckCircle2, HandCoins, X } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AppAlert {
  id: string;
  title: string;
  desc: string;
  type: 'warning' | 'info';
  icon: 'budget' | 'bill' | 'debt';
  time: string;
}

/** Live, derived alerts (budgets near limit, bills due soon, unpaid receivables). */
export const useAlerts = (): AppAlert[] => {
  const { budgets, transactions, recurring, debts, categories } = useFinance();

  return useMemo(() => {
    const list: AppAlert[] = [];
    const month = getCurrentMonthString();

    for (const b of budgets.filter(bg => bg.month === month && bg.limit > 0)) {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.categoryId === b.categoryId && t.date.startsWith(month))
        .reduce((sum, t) => sum + t.amount, 0);
      const percent = Math.round((spent / b.limit) * 100);
      const catName = categories.find(c => c.id === b.categoryId)?.name || 'Kategori';
      if (percent >= 100) {
        list.push({
          id: `b-over-${b.id}`,
          title: `${catName} melebihi anggaran`,
          desc: `Terpakai ${formatIDR(spent)} dari ${formatIDR(b.limit)} (${percent}%).`,
          type: 'warning',
          icon: 'budget',
          time: 'Bulan ini',
        });
      } else if (percent >= 80) {
        list.push({
          id: `b-near-${b.id}`,
          title: `${catName} hampir habis`,
          desc: `Sudah ${percent}% terpakai. Sisa ${formatIDR(b.limit - spent)}.`,
          type: 'warning',
          icon: 'budget',
          time: 'Bulan ini',
        });
      }
    }

    const todayDay = new Date().getDate();
    for (const r of recurring.filter(rc => rc.isActive)) {
      if (r.lastExecuted?.startsWith(month)) continue;
      const daysUntil = r.dayOfMonth - todayDay;
      if (daysUntil <= 3) {
        list.push({
          id: `rec-${r.id}`,
          title: `Tagihan ${r.name}`,
          desc: `${formatIDR(r.amount)} jatuh tempo tanggal ${r.dayOfMonth}.`,
          type: daysUntil < 0 ? 'warning' : 'info',
          icon: 'bill',
          time: daysUntil < 0 ? 'Terlewat' : daysUntil === 0 ? 'Hari ini' : `${daysUntil} hari lagi`,
        });
      }
    }

    const unpaid = debts.filter(d => d.type === 'receivable' && !d.isCompleted);
    if (unpaid.length > 0) {
      const total = unpaid.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
      list.push({
        id: 'debts',
        title: 'Piutang belum ditagih',
        desc: `${unpaid.length} orang belum melunasi, total ${formatIDR(total)}.`,
        type: 'info',
        icon: 'debt',
        time: '',
      });
    }
    return list;
  }, [budgets, transactions, recurring, debts, categories]);
};

const ICONS = { budget: AlertTriangle, bill: Calendar, debt: HandCoins };

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const alerts = useAlerts();
  if (!isOpen) return null;

  return (
    <div className="sheet-backdrop" role="dialog" aria-modal="true">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="sheet px-5">
        <div className="sheet-handle" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title text-base">Notifikasi</h3>
          <button onClick={onClose} aria-label="Tutup" className="icon-btn -mr-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {alerts.length === 0 ? (
          <div className="py-10 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Semua aman</p>
            <p className="text-xs text-muted mt-1">
              Tidak ada tagihan mendesak atau anggaran yang terlampaui.
            </p>
          </div>
        ) : (
          <div className="card-list">
            {alerts.map(n => {
              const Icon = ICONS[n.icon];
              return (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      n.type === 'warning'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-sky-500/10 text-sky-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {n.title}
                      </h4>
                      {n.time && <span className="text-[11px] text-zinc-400 shrink-0">{n.time}</span>}
                    </div>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">{n.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
