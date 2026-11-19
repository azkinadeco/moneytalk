import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR, formatDateIndonesian } from '../../utils/format';
import { FileCheck, Plus, CheckCircle2, Clock, AlertCircle, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReimbursementView: React.FC = () => {
  const { transactions, updateReimburseStatus, addTransaction, wallets, categories, hideBalance } = useFinance();
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'claimed' | 'received'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Reimbursement form
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('');

  const reimburseTxList = transactions.filter(t => t.isReimburse);

  const filtered = reimburseTxList.filter(t => {
    if (activeFilter === 'all') return true;
    return (t.reimburseStatus || 'pending') === activeFilter;
  });

  const totalPending = reimburseTxList
    .filter(t => (t.reimburseStatus || 'pending') !== 'received')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const transportCat =
      categories.find(
        c =>
          c.type === 'expense' &&
          (c.name.toLowerCase().includes('transport') || c.id === 'cat-transport')
      ) ||
      categories.find(c => c.type === 'expense') ||
      categories[0];

    const walletId = selectedWalletId || wallets[0]?.id || 'wal-bca';

    addTransaction({
      type: 'expense',
      amount: parseInt(amount.replace(/\D/g, ''), 10) || 0,
      categoryId: transportCat?.id || 'cat-transport',
      walletId,
      date: new Date().toISOString().split('T')[0],
      note: `[Klaim Kantor] ${title.trim()}`,
      isReimburse: true,
      reimburseStatus: 'pending',
    });

    setTitle('');
    setAmount('');
    setSelectedWalletId('');
    setShowAddModal(false);
  };

  const handleUpdateStatus = (
    id: string,
    newStatus: 'pending' | 'claimed' | 'received',
    targetWalletId?: string
  ) => {
    updateReimburseStatus(id, newStatus, targetWalletId || wallets[0]?.id);
    if (newStatus === 'received') {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Klaim Kantor
          </h2>
          <p className="text-xs text-zinc-400">Tracking pengembalian dana kantor</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="min-h-[36px] flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          + Klaim
        </button>
      </div>

      {/* Summary KPI Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Total Belum Cair</span>
          <p className="text-xl font-black text-blue-500 tabular-nums">
            {hideBalance ? '••••••' : formatIDR(totalPending)}
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <FileCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-bold no-scrollbar">
        {[
          { key: 'all', label: 'Semua' },
          { key: 'pending', label: 'Belum Diajukan' },
          { key: 'claimed', label: 'Diajukan' },
          { key: 'received', label: 'Cair ✓' },
        ].map(chip => (
          <button
            key={chip.key}
            onClick={() => setActiveFilter(chip.key as any)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl shrink-0 transition-all ${
              activeFilter === chip.key
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Reimbursement List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
            <p className="text-xs text-zinc-400">Tidak ada transaksi klaim di filter ini</p>
          </div>
        ) : (
          filtered.map(item => {
            const status = item.reimburseStatus || 'pending';

            return (
              <div
                key={item.id}
                className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {item.note}
                    </h4>
                    <span className="text-[10px] text-zinc-400">{item.date}</span>
                  </div>

                  <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                    {formatIDR(item.amount)}
                  </span>
                </div>

                {/* Status Switcher Pills */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Status Klaim:</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'pending')}
                      className={`px-2 py-0.5 rounded-lg font-semibold ${
                        status === 'pending'
                          ? 'bg-amber-500 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'claimed')}
                      className={`px-2 py-0.5 rounded-lg font-semibold ${
                        status === 'claimed'
                          ? 'bg-blue-500 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      Diajukan
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'received', item.walletId)}
                      className={`px-2 py-0.5 rounded-lg font-semibold ${
                        status === 'received'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      Cair ✓
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Reimburse Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] p-5 shadow-ios-elevated z-10 border-t border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              Catat Pengeluaran Klaim Kantor
            </h3>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Keperluan / Deskripsi
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Taksi meeting klien, Makan siang tamu"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Nominal Klaim
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="0"
                  value={amount ? parseInt(amount, 10).toLocaleString('id-ID') : ''}
                  onChange={e => setAmount(e.target.value.replace(/\D/g, ''))}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Sumber Dompet Terpakai
                </label>
                <select
                  value={selectedWalletId || wallets[0]?.id}
                  onChange={e => setSelectedWalletId(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.icon} {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-xs active:scale-95 transition-all shadow-md"
                >
                  Simpan Klaim
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs active:scale-95"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
