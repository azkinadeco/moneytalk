import React from 'react';
import { TabType } from '../../types';
import { Home, ReceiptText, PieChart, Wallet, Plus, LucideIcon } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface BottomNavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenAddModal: () => void;
}

const TABS: { id: TabType; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Beranda', icon: Home },
  { id: 'transactions', label: 'Riwayat', icon: ReceiptText },
  { id: 'analytics', label: 'Laporan', icon: PieChart },
  { id: 'wallets', label: 'Dompet', icon: Wallet },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onTabChange,
  onOpenAddModal,
}) => {
  const renderTab = (tab: (typeof TABS)[number]) => {
    const active = currentTab === tab.id;
    const Icon = tab.icon;
    return (
      <button
        key={tab.id}
        onClick={() => {
          sounds.playPop();
          sounds.vibrate(10);
          onTabChange(tab.id);
        }}
        aria-current={active ? 'page' : undefined}
        className={`flex-1 h-14 flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 ${
          active ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'
        }`}
      >
        <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.3 : 1.9} />
        <span className={`text-[10px] leading-none ${active ? 'font-bold' : 'font-medium'}`}>
          {tab.label}
        </span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 pointer-events-none">
      <nav className="pointer-events-auto max-w-md mx-auto glass-nav border-t border-zinc-200/80 dark:border-zinc-800/80 pb-safe-bottom">
        <div className="flex items-center px-2">
          {TABS.slice(0, 2).map(renderTab)}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => {
                sounds.playPop();
                sounds.vibrate(20);
                onOpenAddModal();
              }}
              aria-label="Catat transaksi baru"
              className="w-12 h-12 -mt-1 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-90 transition-all"
            >
              <Plus className="w-6 h-6" strokeWidth={2.6} />
            </button>
          </div>
          {TABS.slice(2).map(renderTab)}
        </div>
      </nav>
    </div>
  );
};
