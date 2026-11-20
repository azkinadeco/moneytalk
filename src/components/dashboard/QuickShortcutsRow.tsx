import React, { useState } from 'react';
import { TabType } from '../../types';
import { sounds } from '../../utils/audio';
import {
  Target,
  Repeat,
  HandCoins,
  CalendarDays,
  Users,
  ShoppingCart,
  LineChart,
  FileCheck,
  Calculator,
  Bot,
  LayoutGrid,
  X,
  LucideIcon,
} from 'lucide-react';

type NavTarget = TabType | 'recurring';

interface QuickShortcutsRowProps {
  onNavigate: (tab: NavTarget) => void;
}

interface Feature {
  id: NavTarget;
  label: string;
  desc: string;
  icon: LucideIcon;
  cls: string;
}

const FEATURES: Record<string, Feature> = {
  goals: { id: 'goals', label: 'Anggaran', desc: 'Batas belanja & target tabungan', icon: Target, cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  recurring: { id: 'recurring', label: 'Tagihan', desc: 'Langganan & tagihan bulanan', icon: Repeat, cls: 'bg-indigo-500/10 text-indigo-500' },
  debts: { id: 'debts', label: 'Hutang', desc: 'Hutang & piutang teman', icon: HandCoins, cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  calendar: { id: 'calendar', label: 'Kalender', desc: 'Pengeluaran per tanggal', icon: CalendarDays, cls: 'bg-sky-500/10 text-sky-500' },
  investments: { id: 'investments', label: 'Investasi', desc: 'Portofolio & kekayaan bersih', icon: LineChart, cls: 'bg-teal-500/10 text-teal-500' },
  reimburse: { id: 'reimburse', label: 'Klaim kantor', desc: 'Lacak uang reimburse', icon: FileCheck, cls: 'bg-blue-500/10 text-blue-500' },
  splitbill: { id: 'splitbill', label: 'Split bill', desc: 'Hitung patungan', icon: Users, cls: 'bg-pink-500/10 text-pink-500' },
  shopping: { id: 'shopping', label: 'Daftar belanja', desc: 'Checklist belanja', icon: ShoppingCart, cls: 'bg-orange-500/10 text-orange-500' },
  simulator: { id: 'simulator', label: 'Simulasi', desc: 'Bunga majemuk & pajak', icon: Calculator, cls: 'bg-violet-500/10 text-violet-500' },
  advisor: { id: 'advisor', label: 'AI Advisor', desc: 'Tanya soal keuanganmu', icon: Bot, cls: 'bg-fuchsia-500/10 text-fuchsia-500' },
};

const PINNED = ['goals', 'recurring', 'debts'];
const GROUPS: { title: string; ids: string[] }[] = [
  { title: 'Kelola uang', ids: ['goals', 'recurring', 'debts', 'investments', 'reimburse'] },
  { title: 'Alat bantu', ids: ['calendar', 'splitbill', 'shopping', 'simulator', 'advisor'] },
];

export const QuickShortcutsRow: React.FC<QuickShortcutsRowProps> = ({ onNavigate }) => {
  const [showAll, setShowAll] = useState(false);

  const go = (id: NavTarget) => {
    sounds.playPop();
    sounds.vibrate(10);
    setShowAll(false);
    onNavigate(id);
  };

  const tile = (icon: LucideIcon, cls: string) => {
    const Icon = icon;
    return (
      <span className={`w-11 h-11 rounded-2xl flex items-center justify-center ${cls}`}>
        <Icon className="w-5 h-5" />
      </span>
    );
  };

  return (
    <>
      <section className="grid grid-cols-4 gap-2">
        {PINNED.map(key => {
          const f = FEATURES[key];
          return (
            <button
              key={f.id}
              onClick={() => go(f.id)}
              className="flex flex-col items-center gap-1.5 py-1 active:scale-90 transition-transform"
            >
              {tile(f.icon, f.cls)}
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{f.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => {
            sounds.playPop();
            setShowAll(true);
          }}
          className="flex flex-col items-center gap-1.5 py-1 active:scale-90 transition-transform"
        >
          {tile(LayoutGrid, 'bg-zinc-200/70 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300')}
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Lainnya</span>
        </button>
      </section>

      {showAll && (
        <div className="sheet-backdrop" role="dialog" aria-modal="true" aria-label="Semua fitur">
          <div className="fixed inset-0" onClick={() => setShowAll(false)} />
          <div className="sheet px-5">
            <div className="sheet-handle" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title text-base">Semua fitur</h3>
              <button onClick={() => setShowAll(false)} aria-label="Tutup" className="icon-btn -mr-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {GROUPS.map(g => (
                <div key={g.title}>
                  <p className="label mb-2 px-1">{g.title}</p>
                  <div className="card-list">
                    {g.ids.map(key => {
                      const f = FEATURES[key];
                      const Icon = f.icon;
                      return (
                        <button
                          key={f.id}
                          onClick={() => go(f.id)}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <span className={`icon-tile w-9 h-9 ${f.cls}`}>
                            <Icon className="w-[18px] h-[18px]" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                              {f.label}
                            </span>
                            <span className="block text-xs text-muted">{f.desc}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
