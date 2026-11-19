import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Bell, Check, ChevronDown, ChevronLeft, Lock, Settings } from 'lucide-react';
import { getMonthName, getCurrentMonthString, shiftMonth } from '../../utils/format';
import { sounds } from '../../utils/audio';
import { useAlerts } from '../modals/NotificationModal';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showMonth?: boolean;
  showSettings?: boolean;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  showMonth = false,
  showSettings = true,
  onOpenNotifications,
  onOpenSettings,
}) => {
  const { selectedMonth, setSelectedMonth, pinLockEnabled, lockApp } = useFinance();
  const alerts = useAlerts();
  const [open, setOpen] = useState(false);

  const months = useMemo(() => {
    const current = getCurrentMonthString();
    return Array.from({ length: 12 }, (_, i) => shiftMonth(current, -i));
  }, []);

  const tap = () => {
    sounds.playPop();
    sounds.vibrate(10);
  };

  const [monthLabel, yearLabel] = getMonthName(selectedMonth).split(' ');

  return (
    <header className="sticky top-0 z-30 pt-safe-top glass-header">
      <div className="h-14 px-4 flex items-center gap-2">
        {onBack && (
          <button
            onClick={() => {
              tap();
              onBack();
            }}
            aria-label="Kembali"
            className="icon-btn -ml-2 text-zinc-900 dark:text-zinc-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="min-w-0 flex-1">
          {subtitle && <p className="text-[11px] font-medium text-muted leading-none mb-1">{subtitle}</p>}
          <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 truncate leading-tight">
            {title}
          </h1>
        </div>

        {showMonth && (
          <div className="relative">
            <button
              onClick={() => {
                tap();
                setOpen(o => !o);
              }}
              className="h-9 pl-3 pr-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-1 text-xs font-semibold text-zinc-800 dark:text-zinc-100 active:scale-95 transition-all"
            >
              <span className="capitalize">
                {monthLabel.slice(0, 3)} {yearLabel}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {open && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 max-h-80 overflow-y-auto card shadow-ios-elevated py-1 z-50 animate-pop-in">
                  {months.map(m => (
                    <button
                      key={m}
                      onClick={() => {
                        tap();
                        setSelectedMonth(m);
                        setOpen(false);
                      }}
                      className="w-full min-h-[40px] px-3.5 text-left text-sm flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                    >
                      <span className={selectedMonth === m ? 'font-semibold' : ''}>{getMonthName(m)}</span>
                      {selectedMonth === m && <Check className="w-4 h-4 text-emerald-500" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {pinLockEnabled && (
          <button
            onClick={() => {
              tap();
              lockApp();
            }}
            aria-label="Kunci aplikasi"
            className="icon-btn"
          >
            <Lock className="w-[18px] h-[18px]" />
          </button>
        )}

        <button
          onClick={() => {
            tap();
            onOpenNotifications();
          }}
          aria-label={`Notifikasi${alerts.length ? ` (${alerts.length})` : ''}`}
          className="icon-btn relative"
        >
          <Bell className="w-[18px] h-[18px]" />
          {alerts.length > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-4 text-center ring-2 ring-zinc-100 dark:ring-zinc-950">
              {alerts.length}
            </span>
          )}
        </button>

        {showSettings && (
          <button
            onClick={() => {
              tap();
              onOpenSettings();
            }}
            aria-label="Pengaturan"
            className="icon-btn -mr-2"
          >
            <Settings className="w-[18px] h-[18px]" />
          </button>
        )}
      </div>
    </header>
  );
};
