import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { TabType } from '../../types';
import { sounds } from '../../utils/audio';
import {
  Users,
  Repeat,
  Calendar,
  Bot,
  HeartPulse,
  TrendingDown,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Target,
  PiggyBank,
} from 'lucide-react';

interface QuickShortcutsRowProps {
  onNavigate: (tab: TabType | 'recurring') => void;
}

export const QuickShortcutsRow: React.FC<QuickShortcutsRowProps> = ({ onNavigate }) => {
  const { healthScoreData, monthComparison, hideBalance } = useFinance();
  const [showHealthDetail, setShowHealthDetail] = useState(false);

  const shortcuts: {
    id: TabType | 'recurring';
    label: string;
    icon: React.FC<{ className?: string }>;
    color: string;
    bg: string;
  }[] = [
    {
      id: 'splitbill',
      label: 'Split Bill',
      icon: Users,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      id: 'recurring',
      label: 'Tagihan',
      icon: Repeat,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
    {
      id: 'calendar',
      label: 'Kalender',
      icon: Calendar,
      color: 'text-teal-500',
      bg: 'bg-teal-500/10',
    },
    {
      id: 'advisor',
      label: 'AI Advisor',
      icon: Bot,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  const handleShortcutClick = (tab: TabType | 'recurring') => {
    sounds.playPop();
    sounds.vibrate(10);
    onNavigate(tab);
  };

  const handleToggleHealth = () => {
    sounds.playPop();
    sounds.vibrate(10);
    setShowHealthDetail(prev => !prev);
  };

  const isExpenseLower = monthComparison.expenseDiff <= 0;
  const scoreColor =
    healthScoreData.score >= 75
      ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
      : healthScoreData.score >= 55
      ? 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      : 'text-rose-500 bg-rose-500/10 border-rose-500/20';

  return (
    <div className="space-y-2.5">
      {/* 4-Pill Quick Launcher Row */}
      <div className="grid grid-cols-4 gap-2">
        {shortcuts.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleShortcutClick(item.id)}
              className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm flex flex-col items-center justify-center gap-1.5 hover:border-emerald-500/40 active:scale-95 transition-all"
            >
              <div
                className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 truncate w-full text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Financial Health & Month-over-Month Insight Pill */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm overflow-hidden">
        <button
          type="button"
          onClick={handleToggleHealth}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`px-2 py-0.5 rounded-lg border text-xs font-extrabold tabular-nums flex items-center gap-1 shrink-0 ${scoreColor}`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>{healthScoreData.score}</span>
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                Kesehatan: {healthScoreData.rating}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {monthComparison.prevExpense > 0 && !hideBalance && (
              <span
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${
                  isExpenseLower
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-rose-500/10 text-rose-500'
                }`}
              >
                {isExpenseLower ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <TrendingUp className="w-3 h-3" />
                )}
                {isExpenseLower
                  ? `Hemat ${Math.abs(monthComparison.expenseDiffPercent)}%`
                  : `+${monthComparison.expenseDiffPercent}% vs bln lalu`}
              </span>
            )}
            {showHealthDetail ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </div>
        </button>

        {/* Expandable 50/30/20 & Sub-scores Breakdown */}
        {showHealthDetail && (
          <div className="px-3.5 pb-3.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3 animate-in fade-in duration-200">
            {/* 50 / 30 / 20 Rule Bar */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                <span>Rasio 50/30/20 Bulan Ini</span>
                <span>Kebutuhan • Keinginan • Tabungan</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex gap-0.5">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${healthScoreData.breakdown.needsPercentage}%` }}
                />
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${healthScoreData.breakdown.wantsPercentage}%` }}
                />
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${healthScoreData.breakdown.savingsPercentage}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                <div className="p-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                  <span className="text-[10px] text-zinc-400 block">Kebutuhan</span>
                  <span className="text-xs font-extrabold text-blue-500 tabular-nums">
                    {healthScoreData.breakdown.needsPercentage}%
                  </span>
                </div>
                <div className="p-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                  <span className="text-[10px] text-zinc-400 block">Keinginan</span>
                  <span className="text-xs font-extrabold text-amber-500 tabular-nums">
                    {healthScoreData.breakdown.wantsPercentage}%
                  </span>
                </div>
                <div className="p-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                  <span className="text-[10px] text-zinc-400 block">Tabungan</span>
                  <span className="text-xs font-extrabold text-emerald-500 tabular-nums">
                    {healthScoreData.breakdown.savingsPercentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Score Pillars */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <PiggyBank className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-[9px] text-zinc-400 block">Skor Tabungan</span>
                  <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">
                    {healthScoreData.details.savingsRateScore}/40
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <div>
                  <span className="text-[9px] text-zinc-400 block">Disiplin Budget</span>
                  <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">
                    {healthScoreData.details.budgetDisciplineScore}/35
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                <div>
                  <span className="text-[9px] text-zinc-400 block">Dana Darurat</span>
                  <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">
                    {healthScoreData.details.emergencyFundScore}/25
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
