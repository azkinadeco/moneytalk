import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { RecurringTransaction } from '../../types';
import { formatIDR } from '../../utils/format';
import { DynamicIcon } from '../common/DynamicIcon';
import confetti from 'canvas-confetti';
import { Repeat, Plus, Calendar, Check, Trash2, Zap, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const RecurringView: React.FC = () => {
  const { recurring, addRecurring, toggleRecurring, deleteRecurring, executeRecurring, categories, wallets, hideBalance } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('5');

  const filteredCategories = categories.filter(c => c.type === type);

  // Set default category
  React.useEffect(() => {
    if (filteredCategories.length > 0 && (!categoryId || !filteredCategories.some(c => c.id === categoryId))) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [type, filteredCategories, categoryId]);

  React.useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id);
    }
  }, [wallets, walletId]);

  const totalMonthlyCommitment = recurring
    .filter(r => r.isActive && r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const handleCreateRecurring = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addRecurring({
      name: name.trim(),
      amount: parseInt(amount.replace(/\D/g, ''), 10) || 0,
      type,
      categoryId,
      walletId,
      frequency: 'monthly',
      dayOfMonth: parseInt(dayOfMonth, 10) || 1,
      isActive: true,
    });

    setName('');
    setAmount('');
    setShowAddModal(false);
  };

  const handleExecute = (id: string, recName: string) => {
    executeRecurring(id);
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.8 },
    });
    alert(`Transaksi "${recName}" telah otomatis dicatat ke riwayat transaksi bulan ini.`);
  };

  const getCategory = (catId: string) => {
    return categories.find(c => c.id === catId) || { name: 'Lain-lain', icon: 'HelpCircle', color: '#6B7280' };
  };

  const getWallet = (wId: string) => {
    return wallets.find(w => w.id === wId)?.name || 'Dompet';
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Commitment Summary Card */}
      <div className="p-5 rounded-3xl bg-zinc-900 text-white shadow-ios-elevated border border-white/10 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1.5">
            <Repeat className="w-4 h-4 text-indigo-400" />
            <span>Tagihan Rutin</span>
          </span>
          <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-zinc-300">
            Per Bulan
          </span>
        </div>
        <h3 className="text-3xl font-extrabold tracking-tight tabular-nums">
          {hideBalance ? 'Rp ••••••••' : formatIDR(totalMonthlyCommitment)}
        </h3>
      </div>

      {/* Header and Add Button */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          Daftar Langganan
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="min-h-[36px] flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Recurring List */}
      <div className="space-y-3">
        {recurring.map(item => {
          const cat = getCategory(item.categoryId);
          const wal = getWallet(item.walletId);
          const isExpense = item.type === 'expense';

          return (
            <div
              key={item.id}
              className={`p-4 rounded-3xl bg-white dark:bg-zinc-900 border transition-all ${
                item.isActive
                  ? 'border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm'
                  : 'border-zinc-200/40 dark:border-zinc-800/40 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  >
                    <DynamicIcon name={cat.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Tiap tanggal {item.dayOfMonth} • {wal}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-bold ${
                      isExpense ? 'text-rose-500' : 'text-emerald-500'
                    }`}
                  >
                    {hideBalance ? '••••••' : `${isExpense ? '-' : '+'}${formatIDR(item.amount)}`}
                  </span>
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <button
                      onClick={() => toggleRecurring(item.id)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                        item.isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {item.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Actions: Execute / Delete */}
              <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleExecute(item.id, item.name)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-600 active:scale-95 transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Catat Bulan Ini Sekarang
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Hapus langganan "${item.name}"?`)) {
                      deleteRecurring(item.id);
                    }
                  }}
                  className="text-zinc-400 hover:text-rose-500 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Recurring Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] p-5 shadow-ios-elevated animate-slide-up z-10 border-t border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Tambah Tagihan / Langganan Rutin
            </h3>

            <form onSubmit={handleCreateRecurring} className="space-y-3.5">
              <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 rounded-lg transition-all ${
                    type === 'expense' ? 'bg-rose-500 text-white' : 'text-zinc-500'
                  }`}
                >
                  Pengeluaran Rutin
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 rounded-lg transition-all ${
                    type === 'income' ? 'bg-emerald-500 text-white' : 'text-zinc-500'
                  }`}
                >
                  Pemasukan Rutin
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Nama Tagihan / Langganan
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Sewa Kost, Wifi, Gaji"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Nominal
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="0"
                    value={amount ? parseInt(amount, 10).toLocaleString('id-ID') : ''}
                    onChange={e => setAmount(e.target.value.replace(/\D/g, ''))}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Tanggal Jatuh Tempo
                  </label>
                  <select
                    value={dayOfMonth}
                    onChange={e => setDayOfMonth(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>
                        Tanggal {d} tiap bulan
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Kategori
                  </label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    {filteredCategories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Rekening
                  </label>
                  <select
                    value={walletId}
                    onChange={e => setWalletId(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-500/30 active:scale-95 transition-all"
                >
                  Simpan Tagihan Rutin
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-sm active:scale-95"
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
