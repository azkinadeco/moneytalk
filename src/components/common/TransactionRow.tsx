import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction } from '../../types';
import { formatIDR, formatDateIndonesian } from '../../utils/format';
import { DynamicIcon } from './DynamicIcon';

export const TRANSFER_META = { name: 'Transfer', icon: 'ArrowLeftRight', color: '#6366F1' };
const FALLBACK_CAT = { name: 'Lain-lain', icon: 'HelpCircle', color: '#71717A' };

export const useTxMeta = () => {
  const { categories, wallets } = useFinance();
  const getCategory = (tx: Transaction) =>
    tx.type === 'transfer'
      ? TRANSFER_META
      : categories.find(c => c.id === tx.categoryId) || FALLBACK_CAT;
  const getWalletName = (id?: string) => wallets.find(w => w.id === id)?.name || 'Dompet';
  return { getCategory, getWalletName };
};

interface TransactionRowProps {
  tx: Transaction;
  onClick: (tx: Transaction) => void;
  /** Right-bottom meta: show relative date (dashboard) or time (grouped history) */
  meta?: 'date' | 'time';
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ tx, onClick, meta = 'date' }) => {
  const { hideBalance } = useFinance();
  const { getCategory, getWalletName } = useTxMeta();

  const cat = getCategory(tx);
  const isExpense = tx.type === 'expense';
  const isTransfer = tx.type === 'transfer';
  const walletLabel = isTransfer
    ? `${getWalletName(tx.walletId)} → ${getWalletName(tx.targetWalletId)}`
    : getWalletName(tx.walletId);

  const amountColor = isExpense
    ? 'text-zinc-900 dark:text-zinc-100'
    : isTransfer
    ? 'text-indigo-500'
    : 'text-emerald-600 dark:text-emerald-400';

  return (
    <button
      type="button"
      onClick={() => onClick(tx)}
      className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/40 active:bg-zinc-100 dark:active:bg-zinc-800/70 transition-colors"
    >
      <div
        className="icon-tile"
        style={{ backgroundColor: `${cat.color}1f`, color: cat.color }}
      >
        <DynamicIcon name={cat.icon} className="w-[18px] h-[18px]" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {tx.note || cat.name}
          </p>
          {tx.isReimburse && (
            <span className="px-1.5 py-px rounded bg-blue-500/10 text-blue-500 text-[9px] font-bold shrink-0">
              KLAIM
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-400 mt-0.5 truncate">
          {tx.note ? `${cat.name} · ` : ''}
          {walletLabel}
          {tx.tags && tx.tags.length > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400"> {tx.tags.join(' ')}</span>
          )}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className={`text-sm font-bold num ${amountColor}`}>
          {hideBalance
            ? '••••'
            : `${isExpense ? '−' : isTransfer ? '' : '+'}${formatIDR(tx.amount)}`}
        </p>
        <p className="text-[11px] text-zinc-400 mt-0.5">
          {meta === 'time' ? tx.time || '' : formatDateIndonesian(tx.date)}
        </p>
      </div>
    </button>
  );
};
