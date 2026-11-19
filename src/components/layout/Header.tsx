import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  ChevronDown,
  Check,
  Bell,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { getMonthName } from '../../utils/format';
import { sounds } from '../../utils/audio';

interface HeaderProps {
  onOpenNotifications: () => void;
  onNavigate: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onNavigate,
}) => {
  const {
    userProfile,
    soundEnabled,
    toggleSound,
    selectedMonth,
    setSelectedMonth,
  } = useFinance();

  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  // Generate last 6 months list
  const months = useMemo(() => {
    const list: string[] = [];
    const date = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      list.push(`${y}-${m}`);
    }
    return list;
  }, []);

  return (
    <header className="sticky top-0 z-30 pt-safe-top glass-header border-b border-zinc-200/50 dark:border-zinc-800/50 transition-colors">
      <div className="px-4 py-2 flex items-center justify-between max-w-lg mx-auto">
        {/* App Icon + Month Selector Capsule */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs border border-amber-500/30 flex-shrink-0 bg-zinc-900">
            <img src="/favicon.png" alt="Logo" className="w-full h-full object-cover" />
          </div>

          <div className="relative">
            <button
              onClick={() => {
                sounds.playPop();
                sounds.vibrate(10);
                setShowMonthDropdown(!showMonthDropdown);
              }}
              className="min-h-[38px] px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 transition-all active:scale-95"
            >
              <span>{getMonthName(selectedMonth)}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                  showMonthDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Month Dropdown Menu */}
            {showMonthDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMonthDropdown(false)}
                />
                <div className="absolute left-0 mt-1.5 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-ios-elevated border border-zinc-200 dark:border-zinc-800 py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {months.map(m => (
                    <button
                      key={m}
                      onClick={() => {
                        sounds.playPop();
                        sounds.vibrate(12);
                        setSelectedMonth(m);
                        setShowMonthDropdown(false);
                      }}
                      className="w-full min-h-[40px] px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors text-zinc-800 dark:text-zinc-200"
                    >
                      <span>{getMonthName(m)}</span>
                      {selectedMonth === m && (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              toggleSound();
              sounds.vibrate(10);
            }}
            aria-label={soundEnabled ? 'Mute' : 'Unmute'}
            className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 active:scale-90 transition-all"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              sounds.vibrate(10);
              onOpenNotifications();
            }}
            aria-label="Notifikasi"
            className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 active:scale-90 transition-all relative"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2.5 right-2.5 ring-2 ring-white dark:ring-zinc-900" />
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              sounds.vibrate(10);
              onNavigate('settings');
            }}
            aria-label="Pengaturan"
            className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 active:scale-90 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
