import React from 'react';
import { Transaction } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR, formatFullDate } from '../../utils/format';
import { DynamicIcon } from '../common/DynamicIcon';
import { X, Share2, CheckCircle2, QrCode } from 'lucide-react';

interface ReceiptShareModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptShareModal: React.FC<ReceiptShareModalProps> = ({ transaction, onClose }) => {
  const { categories, wallets } = useFinance();

  if (!transaction) return null;

  const cat = categories.find(c => c.id === transaction.categoryId) || {
    name: 'Lain-lain',
    icon: 'Package',
    color: '#6B7280',
  };
  const wal = wallets.find(w => w.id === transaction.walletId)?.name || 'Dompet';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Bukti Transaksi - ${transaction.note || cat.name}`,
        text: `Bukti Transaksi Money Talk: ${formatIDR(transaction.amount)} pada ${transaction.date}.`,
      }).catch(() => {});
    } else {
      alert('Tangkapan layar struk ini siap dibagikan ke teman!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-ios-elevated z-10 border border-zinc-200 dark:border-zinc-800 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Icon */}
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
          Transaksi Berhasil
        </span>
        <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
          {formatIDR(transaction.amount)}
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">{transaction.note || cat.name}</p>

        {/* Receipt Details Box */}
        <div className="my-5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-dashed border-zinc-200 dark:border-zinc-700 text-left space-y-2.5 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-400">Waktu</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {transaction.date} {transaction.time ? `• ${transaction.time}` : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Kategori</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{cat.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Rekening</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{wal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Ref ID</span>
            <span className="font-mono text-[10px] text-zinc-500">{transaction.id}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleShare}
          className="w-full py-3 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <Share2 className="w-4 h-4" />
          Bagikan Bukti Struk Digital
        </button>
      </div>
    </div>
  );
};
