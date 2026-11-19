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
import { ChevronLeft } from 'lucide-react';

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

const MainAppContent: React.FC = () => {
  const { isAppLocked, unlockApp, appPin, toast } = useFinance();

  const [currentTab, setCurrentTab] = useState<TabType | 'recurring'>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isCurrencyConverterOpen, setIsCurrencyConverterOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);

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

  const isSubPage =
    currentTab === 'goals' ||
    currentTab === 'debts' ||
    currentTab === 'recurring' ||
    currentTab === 'calendar' ||
    currentTab === 'splitbill' ||
    currentTab === 'shopping' ||
    currentTab === 'investments' ||
    currentTab === 'advisor' ||
    currentTab === 'settings' ||
    currentTab === 'reimburse' ||
    currentTab === 'simulator';

  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden bg-zinc-100 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Mobile Shell Container */}
      <div className="w-full max-w-md mx-auto min-h-[100dvh] overflow-x-hidden flex flex-col bg-zinc-50 dark:bg-zinc-950 shadow-2xl relative">
        {/* Floating iOS Native Toast Pill (A-06) */}
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-[90%] pointer-events-none animate-in fade-in slide-in-from-top-3 duration-200">
            <div
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl backdrop-blur-xl border text-xs font-semibold ${
                toast.type === 'error'
                  ? 'bg-rose-500/90 text-white border-rose-400/30'
                  : toast.type === 'info'
                  ? 'bg-blue-500/90 text-white border-blue-400/30'
                  : 'bg-zinc-900/90 dark:bg-zinc-800/90 text-emerald-400 border-zinc-700/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Clean Sticky iOS Header */}
        <Header
          onOpenNotifications={() => setIsNotificationOpen(true)}
          onNavigate={tab => setCurrentTab(tab)}
        />

        {/* Back navigation pill if in subview */}
        {isSubPage && (
          <div className="px-4 pt-2">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="min-h-[36px] flex items-center gap-1 text-xs font-bold text-emerald-500 hover:text-emerald-400 active:scale-95 transition-all py-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Kembali ke Beranda
            </button>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 px-4 py-3 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <div className="space-y-3.5 pb-24">
              <IosInstallBanner />
              <BalanceCard
                onOpenAddModal={() => handleOpenAddModal('expense')}
                onOpenTransferModal={() => handleOpenAddModal('transfer')}
              />
              <QuickShortcutsRow onNavigate={tab => setCurrentTab(tab)} />
              <SmartReminderBanner onNavigate={tab => setCurrentTab(tab)} />
              <QuickBudgetBar onGoToBudgets={() => setCurrentTab('goals')} />
              <RecentTransactions
                onSeeAll={() => setCurrentTab('transactions')}
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
              onNavigate={tab => setCurrentTab(tab)}
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
              onNavigate={tab => setCurrentTab(tab)}
            />
          )}

          <Suspense
            fallback={
              <div className="py-12 text-center text-xs text-zinc-400 animate-pulse">
                Memuat modul...
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

        {/* Floating iOS Dock */}
        <BottomNavigation
          currentTab={isSubPage ? 'dashboard' : (currentTab as TabType)}
          onTabChange={tab => setCurrentTab(tab)}
          onOpenAddModal={() => handleOpenAddModal('expense')}
        />

        {/* Single Unified Transaction Modal (Create + Edit + Smart NLP + Voice) */}
        <AddTransactionModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          defaultType={modalType}
          editingTransaction={editingTransaction}
        />

        <FinancialReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
        />

        <NotificationModal
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
        />

        <PersonaModal
          isOpen={isPersonaOpen}
          onClose={() => setIsPersonaOpen(false)}
        />

        <CurrencyConverterModal
          isOpen={isCurrencyConverterOpen}
          onClose={() => setIsCurrencyConverterOpen(false)}
        />

        <BadgesModal
          isOpen={isBadgesOpen}
          onClose={() => setIsBadgesOpen(false)}
        />

        {/* Security PIN Lock Screen */}
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
