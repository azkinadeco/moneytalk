import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction } from '../../types';
import { TransactionRow } from '../common/TransactionRow';
import { TransactionDetailSheet } from '../common/TransactionDetailSheet';
import { ChevronRight, Plus, ReceiptText } from 'lucide-react';

interface RecentTransactionsProps {
  onSeeAll: () => void;
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  onSeeAll,
  onOpenAddModal,
  onEditTransaction,
}) => {
  const { transactions, selectedMonth } = useFinance();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const recent = transactions.filter(t => t.date.startsWith(selectedMonth)).slice(0, 5);

  return (
    <section>
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="section-title">Transaksi terakhir</h2>
        {recent.length > 0 && (
          <button onClick={onSeeAll} className="link min-h-[32px]">
            Lihat semua
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="card py-10 px-6 flex flex-col items-center text-center">
          <span className="w-12 h-12 rounded-2xl surface-muted flex items-center justify-center text-zinc-400 mb-3">
            <ReceiptText className="w-6 h-6" />
          </span>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Belum ada transaksi bulan ini</p>
          <p className="text-xs text-muted mt-1">Catat pengeluaran pertamamu, cuma butuh 5 detik.</p>
          <button onClick={onOpenAddModal} className="btn-primary mt-4">
            <Plus className="w-4 h-4" />
            Catat transaksi
          </button>
        </div>
      ) : (
        <div className="card-list">
          {recent.map(tx => (
            <TransactionRow key={tx.id} tx={tx} onClick={setSelectedTx} />
          ))}
        </div>
      )}

      <TransactionDetailSheet tx={selectedTx} onClose={() => setSelectedTx(null)} onEdit={onEditTransaction} />
    </section>
  );
};
