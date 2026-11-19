import React, { useState, useEffect, Suspense, lazy } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { TabType, Transaction, TransactionType } from './types';
import { Header } from './components/layout/Header';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { BalanceCard } from './components/dashboard/BalanceCard';
import { QuickShortcutsRow } from './components/dashboard/QuickShortcutsRow';
import { SmartReminderBanner } from './components/dashboard/SmartReminderBanner';
import { QuickBudgetBar } from './components/dashboard/QuickBudgetBar';
import { RecentTransactions } from './components/dashboard/RecentTransactions';
import { TransactionListView } from './components/transactions/TransactionListView';
import { MonthlyReportView } from './components/report/MonthlyReportView';
import { WalletsView } from './components/wallets/WalletsView';
import { GoalsView } from './components/goals/GoalsView';
import { DebtsView } from './components/debts/DebtsView';
import { RecurringView } from './components/recurring/RecurringView';
import { SettingsView } from './components/settings/SettingsView';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { FinancialReportModal } from './components/modals/FinancialReportModal';
import { NotificationModal } from './components/modals/NotificationModal';
import { PersonaModal } from './components/modals/PersonaModal';
import { PinLockModal } from './components/security/PinLockModal';
import { CurrencyConverterModal } from './components/modals/CurrencyConverterModal';
import { BadgesModal } from './components/modals/BadgesModal';
import { IosInstallBanner } from './components/common/IosInstallBanner';

// F-08: Code-split secondary laboratory views so core startup bundle stays light
const SplitBillView = lazy(() =>
  import('./components/splitbill/SplitBillView').then(m => ({ default: m.SplitBillView }))
);
const FinancialCalendarView = lazy(() =>
  import('./components/calendar/FinancialCalendarView').then(m => ({
    default: m.FinancialCalendarView,
  }))
);
const ShoppingListView = lazy(() =>
  import('./components/shopping/ShoppingListView').then(m => ({
    default: m.ShoppingListView,
  }))
);
const InvestmentsView = lazy(() =>
  import('./components/investments/InvestmentsView').then(m => ({
    default: m.InvestmentsView,
  }))
);
const AiAdvisorView = lazy(() =>
  import('./components/advisor/AiAdvisorView').then(m => ({ default: m.AiAdvisorView }))
);
const SimulatorView = lazy(() =>
  import('./components/simulator/SimulatorView').then(m => ({ default: m.SimulatorView }))
);
const ReimbursementView = lazy(() =>
  import('./components/reimburse/ReimbursementView').then(m => ({
    default: m.ReimbursementView,
  }))
);

type AppTab = TabType | 'recurring';

const MAIN_TABS: AppTab[] = ['dashboard', 'transactions', 'analytics', 'wallets'];

const PAGE_TITLES: Record<AppTab, string> = {
  dashboard: 'Beranda',
  transactions: 'Riwayat',
  analytics: 'Laporan',
  wallets: 'Dompet',
  goals: 'Anggaran',
  debts: 'Hutang & Piutang',
  recurring: 'Tagihan Rutin',
  calendar: 'Kalender',
  splitbill: 'Split Bill',
  shopping: 'Daftar Belanja',
  investments: 'Investasi',
  advisor: 'AI Advisor',
  settings: 'Pengaturan',
  reimburse: 'Klaim Kantor',
  simulator: 'Simulasi',
};

const MONTH_SCOPED: AppTab[] = ['dashboard', 'transactions', 'goals'];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
};

const MainAppContent: React.FC = () => {
  const { isAppLocked, unlockApp, appPin, toast, dismissToast, userProfile } = useFinance();

  const [history, setHistory] = useState<AppTab[]>(['dashboard']);
  const currentTab = history[history.length - 1];
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isCurrencyConverterOpen, setIsCurrencyConverterOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);

  const isSubPage = !MAIN_TABS.includes(currentTab);

  // Main tabs reset the stack; sub pages push so "back" returns to where you came from
  const navigate = (tab: AppTab) => {
    setHistory(prev => {
      if (MAIN_TABS.includes(tab)) return [tab];
      if (prev[prev.length - 1] === tab) return prev;
      return [...prev, tab];
    });
  };
  const goBack = () => setHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : ['dashboard']));

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [currentTab]);

  // A-07: Global Escape key listener for accessible modal dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddModalOpen(false);
        setEditingTransaction(null);
        setIsReportOpen(false);
        setIsNotificationOpen(false);
        setIsPersonaOpen(false);
        setIsCurrencyConverterOpen(false);
        setIsBadgesOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll while the transaction sheet is open
  useEffect(() => {
    document.body.style.overflow = isAddModalOpen ? 'hidden' : '';
  }, [isAddModalOpen]);

  const handleOpenAddModal = (type: TransactionType = 'expense') => {
    setEditingTransaction(null);
    setModalType(type);
    setIsAddModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setModalType(tx.type);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingTransaction(null);
  };

  const firstName = (userProfile.name || '').split(' ')[0];

  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden text-zinc-900 dark:text-zinc-100 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col relative">
        {/* Toast */}
        {toast && (
          <div
            key={toast.id}
            className="fixed top-3 inset-x-0 z-[100] flex justify-center px-4 pointer-events-none pt-safe-top"
          >
            <div
              role="status"
              className={`pointer-events-auto max-w-sm w-full flex items-center gap-3 pl-4 pr-2 py-2 min-h-[48px] rounded-2xl shadow-ios-elevated text-sm font-medium animate-pop-in ${
                toast.type === 'error'
                  ? 'bg-rose-600 text-white'
                  : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  toast.type === 'error' ? 'bg-white' : toast.type === 'info' ? 'bg-sky-400' : 'bg-emerald-400'
                }`}
              />
              <span className="flex-1 min-w-0">{toast.message}</span>
              {toast.action ? (
                <button
                  onClick={() => {
                    toast.action?.onClick();
                    dismissToast();
                  }}
                  className="px-3 h-8 rounded-lg font-bold text-emerald-400 dark:text-emerald-600 hover:bg-white/10 dark:hover:bg-black/5"
                >
                  {toast.action.label}
                </button>
              ) : (
                <span className="w-2" />
              )}
            </div>
          </div>
        )}

        <Header
          title={currentTab === 'dashboard' ? firstName || 'Money Talk' : PAGE_TITLES[currentTab]}
          subtitle={currentTab === 'dashboard' ? greeting() : undefined}
          onBack={isSubPage ? goBack : undefined}
          showMonth={MONTH_SCOPED.includes(currentTab)}
          showSettings={currentTab !== 'settings'}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          onOpenSettings={() => navigate('settings')}
        />

        <main className="flex-1 px-4 pt-2 pb-28">
          {currentTab === 'dashboard' && (
            <div className="space-y-4">
              <IosInstallBanner />
              <BalanceCard
                onOpenAddModal={handleOpenAddModal}
                onNavigate={navigate}
              />
              <SmartReminderBanner onNavigate={navigate} />
              <QuickShortcutsRow onNavigate={navigate} />
              <QuickBudgetBar onGoToBudgets={() => navigate('goals')} />
              <RecentTransactions
                onSeeAll={() => navigate('transactions')}
                onOpenAddModal={() => handleOpenAddModal('expense')}
                onEditTransaction={handleEditTransaction}
              />
            </div>
          )}

          {currentTab === 'transactions' && (
            <TransactionListView
              onOpenAddModal={() => handleOpenAddModal('expense')}
              onEditTransaction={handleEditTransaction}
            />
          )}

          {currentTab === 'analytics' && (
            <MonthlyReportView onOpenReportPdf={() => setIsReportOpen(true)} />
          )}

          {currentTab === 'wallets' && (
            <WalletsView
              onOpenTransferModal={() => handleOpenAddModal('transfer')}
              onNavigate={navigate}
            />
          )}

          {currentTab === 'goals' && <GoalsView />}
          {currentTab === 'debts' && <DebtsView />}
          {currentTab === 'recurring' && <RecurringView />}
          {currentTab === 'settings' && (
            <SettingsView
              onOpenReport={() => setIsReportOpen(true)}
              onOpenPersonas={() => setIsPersonaOpen(true)}
              onOpenCurrencyConverter={() => setIsCurrencyConverterOpen(true)}
              onOpenBadges={() => setIsBadgesOpen(true)}
              onNavigate={navigate}
            />
          )}

          <Suspense
            fallback={
              <div className="py-16 flex justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              </div>
            }
          >
            {currentTab === 'calendar' && <FinancialCalendarView />}
            {currentTab === 'splitbill' && <SplitBillView />}
            {currentTab === 'shopping' && <ShoppingListView />}
            {currentTab === 'investments' && <InvestmentsView />}
            {currentTab === 'advisor' && <AiAdvisorView />}
            {currentTab === 'simulator' && <SimulatorView />}
            {currentTab === 'reimburse' && <ReimbursementView />}
          </Suspense>
        </main>

        <BottomNavigation
          currentTab={isSubPage ? (history.find(t => MAIN_TABS.includes(t)) as TabType) || 'dashboard' : (currentTab as TabType)}
          onTabChange={navigate}
          onOpenAddModal={() => handleOpenAddModal('expense')}
        />

        <AddTransactionModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          defaultType={modalType}
          editingTransaction={editingTransaction}
        />

        <FinancialReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
        <NotificationModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
        <PersonaModal isOpen={isPersonaOpen} onClose={() => setIsPersonaOpen(false)} />
        <CurrencyConverterModal
          isOpen={isCurrencyConverterOpen}
          onClose={() => setIsCurrencyConverterOpen(false)}
        />
        <BadgesModal isOpen={isBadgesOpen} onClose={() => setIsBadgesOpen(false)} />

        <PinLockModal isLocked={isAppLocked} onUnlock={unlockApp} correctPin={appPin} />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainAppContent />
    </FinanceProvider>
  );
}
