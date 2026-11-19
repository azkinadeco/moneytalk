import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction } from '../../types';
import { formatIDR, formatFullDate } from '../../utils/format';
import { DynamicIcon } from './DynamicIcon';
import { formatCurrency } from '../../utils/currency';
import { useTxMeta } from './TransactionRow';
import { ReceiptShareModal } from '../modals/ReceiptShareModal';
import { Copy, Pencil, Share2, Trash2, X } from 'lucide-react';

interface TransactionDetailSheetProps {
  tx: Transaction | null;
  onClose: () => void;
  onEdit: (tx: Transaction) => void;
}

const TYPE_LABEL = {
  expense: { label: 'Pengeluaran', cls: 'bg-rose-500/10 text-rose-500' },
  income: { label: 'Pemasukan', cls: 'bg-emerald-500/10 text-emerald-500' },
  transfer: { label: 'Transfer', cls: 'bg-indigo-500/10 text-indigo-500' },
};

export const TransactionDetailSheet: React.FC<TransactionDetailSheetProps> = ({
  tx,
  onClose,
  onEdit,
}) => {
  const { deleteTransaction, duplicateTransaction } = useFinance();
  const { getCategory, getWalletName } = useTxMeta();
  const [shareTx, setShareTx] = useState<Transaction | null>(null);

  if (!tx && !shareTx) return null;

  if (!tx) {
    return <ReceiptShareModal transaction={shareTx} onClose={() => setShareTx(null)} />;
  }

  const cat = getCategory(tx);
  const typeMeta = TYPE_LABEL[tx.type];

  const rows: { label: string; value: string }[] = [
    { label: 'Kategori', value: cat.name },
    {
      label: tx.type === 'transfer' ? 'Dari → Ke' : 'Dompet',
      value:
        tx.type === 'transfer'
          ? `${getWalletName(tx.walletId)} → ${getWalletName(tx.targetWalletId)}`
          : getWalletName(tx.walletId),
    },
    { label: 'Waktu', value: `${formatFullDate(tx.date)}${tx.time ? `, ${tx.time}` : ''}` },
  ];
  if (tx.currency && tx.originalAmount) {
    rows.push({ label: 'Nominal asli', value: formatCurrency(tx.originalAmount, tx.currency) });
  }
  if (tx.tags?.length) rows.push({ label: 'Tag', value: tx.tags.join(' ') });
  if (tx.isReimburse) {
    const s = tx.reimburseStatus || 'pending';
    rows.push({
      label: 'Klaim kantor',
      value: s === 'received' ? 'Sudah cair' : s === 'claimed' ? 'Sudah diajukan' : 'Belum diajukan',
    });
  }

  return (
    <div className="sheet-backdrop" role="dialog" aria-modal="true">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="sheet px-5">
        <div className="sheet-handle" />
        <button onClick={onClose} aria-label="Tutup" className="icon-btn absolute top-3 right-3">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center pt-2 pb-5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
            style={{ backgroundColor: `${cat.color}1f`, color: cat.color }}
          >
            <DynamicIcon name={cat.icon} className="w-6 h-6" />
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${typeMeta.cls}`}>
            {typeMeta.label}
          </span>
          <h3 className="mt-2 text-3xl font-extrabold num text-zinc-900 dark:text-zinc-50">
            {formatIDR(tx.amount)}
          </h3>
          <p className="text-sm text-muted mt-1 max-w-[90%] break-words">
            {tx.note || 'Tanpa catatan'}
          </p>
        </div>

        <div className="card-list mb-4 !bg-zinc-50 dark:!bg-zinc-800/40">
          {rows.map(r => (
            <div key={r.label} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
              <span className="text-muted shrink-0">{r.label}</span>
              <span className="font-medium text-right text-zinc-900 dark:text-zinc-100">
                {r.value}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            {
              label: 'Edit',
              icon: Pencil,
              cls: 'text-emerald-600 dark:text-emerald-400',
              onClick: () => {
                onClose();
                onEdit(tx);
              },
            },
            {
              label: 'Duplikat',
              icon: Copy,
              cls: 'text-indigo-500',
              onClick: () => {
                duplicateTransaction(tx);
                onClose();
              },
            },
            {
              label: 'Struk',
              icon: Share2,
              cls: 'text-sky-500',
              onClick: () => {
                setShareTx(tx);
                onClose();
              },
            },
            {
              label: 'Hapus',
              icon: Trash2,
              cls: 'text-rose-500',
              onClick: () => {
                deleteTransaction(tx.id);
                onClose();
              },
            },
          ].map(a => (
            <button
              key={a.label}
              onClick={a.onClick}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl surface-muted hover:opacity-90 active:scale-95 transition-all"
            >
              <a.icon className={`w-5 h-5 ${a.cls}`} />
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
