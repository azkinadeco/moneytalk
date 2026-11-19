import React from 'react';
import { TabType } from '../../types';
import { LayoutDashboard, Receipt, BarChart3, WalletCards, Plus } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface BottomNavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenAddModal: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onTabChange,
  onOpenAddModal,
}) => {
  const handleTabClick = (tab: TabType) => {
    sounds.playPop();
    sounds.vibrate(10);
    onTabChange(tab);
  };

  const handleFabClick = () => {
    sounds.playPop();
    sounds.vibrate(20);
    onOpenAddModal();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none pb-safe-bottom">
      <div className="max-w-lg mx-auto px-4 pb-3">
        <nav className="pointer-events-auto glass-nav border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-ios-card flex items-center justify-between px-2.5 py-1.5 transition-all">
          {/* Tab 1: Beranda (Dashboard) */}
          <button
            onClick={() => handleTabClick('dashboard')}
            className={`min-h-[44px] flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all active:scale-90 ${
              currentTab === 'dashboard'
                ? 'text-emerald-500 font-bold'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <LayoutDashboard
              className={`w-5 h-5 transition-transform ${
                currentTab === 'dashboard' ? 'scale-110' : ''
              }`}
            />
            <span className="text-[10px] mt-1 tracking-tight">Beranda</span>
          </button>

          {/* Tab 2: Riwayat (Transaksi) */}
          <button
            onClick={() => handleTabClick('transactions')}
            className={`min-h-[44px] flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all active:scale-90 ${
              currentTab === 'transactions'
                ? 'text-emerald-500 font-bold'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Receipt
              className={`w-5 h-5 transition-transform ${
                currentTab === 'transactions' ? 'scale-110' : ''
              }`}
            />
            <span className="text-[10px] mt-1 tracking-tight">Riwayat</span>
          </button>

          {/* Center Hero Button: + Tambah Transaksi */}
          <div className="flex-1 flex justify-center -mt-5">
            <button
              onClick={handleFabClick}
              aria-label="Catat Transaksi Baru"
              className="w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-90 transition-all border-4 border-zinc-50 dark:border-[#09090b]"
            >
              <Plus className="w-6 h-6 stroke-[2.8]" />
            </button>
          </div>

          {/* Tab 4: Laporan (Monthly Report with Charts) */}
          <button
            onClick={() => handleTabClick('analytics')}
            className={`min-h-[44px] flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all active:scale-90 ${
              currentTab === 'analytics'
                ? 'text-emerald-500 font-bold'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <BarChart3
              className={`w-5 h-5 transition-transform ${
                currentTab === 'analytics' ? 'scale-110' : ''
              }`}
            />
            <span className="text-[10px] mt-1 tracking-tight">Laporan</span>
          </button>

          {/* Tab 5: Dompet & Rekening */}
          <button
            onClick={() => handleTabClick('wallets')}
            className={`min-h-[44px] flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all active:scale-90 ${
              currentTab === 'wallets'
                ? 'text-emerald-500 font-bold'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <WalletCards
              className={`w-5 h-5 transition-transform ${
                currentTab === 'wallets' ? 'scale-110' : ''
              }`}
            />
            <span className="text-[10px] mt-1 tracking-tight">Dompet</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
