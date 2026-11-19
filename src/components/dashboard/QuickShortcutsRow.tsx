import React from 'react';
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
} from 'lucide-react';

interface QuickShortcutsRowProps {
  onNavigate: (tab: TabType | 'recurring') => void;
}

const SHORTCUTS: {
  id: TabType | 'recurring';
  label: string;
  icon: React.FC<{ className?: string }>;
  cls: string;
}[] = [
  { id: 'goals', label: 'Anggaran', icon: Target, cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { id: 'recurring', label: 'Tagihan', icon: Repeat, cls: 'bg-indigo-500/10 text-indigo-500' },
  { id: 'debts', label: 'Hutang', icon: HandCoins, cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { id: 'calendar', label: 'Kalender', icon: CalendarDays, cls: 'bg-sky-500/10 text-sky-500' },
  { id: 'splitbill', label: 'Split Bill', icon: Users, cls: 'bg-pink-500/10 text-pink-500' },
  { id: 'shopping', label: 'Belanja', icon: ShoppingCart, cls: 'bg-orange-500/10 text-orange-500' },
  { id: 'investments', label: 'Investasi', icon: LineChart, cls: 'bg-teal-500/10 text-teal-500' },
  { id: 'reimburse', label: 'Klaim', icon: FileCheck, cls: 'bg-blue-500/10 text-blue-500' },
  { id: 'simulator', label: 'Simulasi', icon: Calculator, cls: 'bg-violet-500/10 text-violet-500' },
  { id: 'advisor', label: 'AI Advisor', icon: Bot, cls: 'bg-fuchsia-500/10 text-fuchsia-500' },
];

export const QuickShortcutsRow: React.FC<QuickShortcutsRowProps> = ({ onNavigate }) => (
  <section className="card px-2 py-3">
    <div className="grid grid-cols-5 gap-y-3">
      {SHORTCUTS.map(item => (
        <button
          key={item.id}
          onClick={() => {
            sounds.playPop();
            sounds.vibrate(10);
            onNavigate(item.id);
          }}
          className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
        >
          <span className={`w-11 h-11 rounded-2xl flex items-center justify-center ${item.cls}`}>
            <item.icon className="w-5 h-5" />
          </span>
          <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 leading-none">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  </section>
);
