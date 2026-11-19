import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { DebtItem } from '../../types';
import { formatIDR, formatDateIndonesian } from '../../utils/format';
import confetti from 'canvas-confetti';
import { HandCoins, Plus, CheckCircle2, Clock, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const DebtsView: React.FC = () => {
  const { debts, addDebt, payDebt, deleteDebt, hideBalance, wallets, getWalletBalance } = useFinance();
  const [activeTab, setActiveTab] = useState<'receivable' | 'payable'>('receivable');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeDebtForPay, setActiveDebtForPay] = useState<DebtItem | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payWalletId, setPayWalletId] = useState('');

  // Form State
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  const filteredDebts = debts.filter(d => d.type === activeTab);

  // Totals
  const totalReceivable = debts
    .filter(d => d.type === 'receivable' && !d.isCompleted)
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const totalPayable = debts
    .filter(d => d.type === 'payable' && !d.isCompleted)
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) return;

    addDebt({
      type: activeTab,
      personName: personName.trim(),
      amount: parseInt(amount.replace(/\D/g, ''), 10) || 0,
      paidAmount: parseInt(paidAmount.replace(/\D/g, ''), 10) || 0,
      dueDate: dueDate || undefined,
      note: note.trim(),
    });

    setPersonName('');
    setAmount('');
    setPaidAmount('');
    setDueDate('');
    setNote('');
    setShowAddModal(false);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDebtForPay) return;
    const payment = parseInt(payAmount.replace(/\D/g, ''), 10) || 0;
    if (payment <= 0) return;

    payDebt(activeDebtForPay.id, payment, payWalletId || wallets[0]?.id);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
    });

    setPayAmount('');
    setPayWalletId('');
    setActiveDebtForPay(null);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setActiveTab('receivable')}
          className={`p-3.5 rounded-3xl border transition-all text-left ${
            activeTab === 'receivable'
              ? 'bg-emerald-500/10 border-emerald-500/40 shadow-ios-sm'
              : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Piutang</span>
          </div>
          <p className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {hideBalance ? '••••••' : formatIDR(totalReceivable)}
          </p>
        </button>

        <button
          onClick={() => setActiveTab('payable')}
          className={`p-3.5 rounded-3xl border transition-all text-left ${
            activeTab === 'payable'
              ? 'bg-rose-500/10 border-rose-500/40 shadow-ios-sm'
              : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Hutang Saya</span>
          </div>
          <p className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {hideBalance ? '••••••' : formatIDR(totalPayable)}
          </p>
        </button>
      </div>

      {/* Header and Add Button */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {activeTab === 'receivable' ? 'Daftar Piutang' : 'Daftar Hutang'}
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="min-h-[36px] flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Tambah</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredDebts.length === 0 ? (
          <div className="p-8 text-center card">
            <p className="text-xs text-zinc-400">
              Tidak ada catatan {activeTab === 'receivable' ? 'piutang' : 'hutang'}
            </p>
          </div>
        ) : (
          filteredDebts.map(debt => {
            const remaining = Math.max(0, debt.amount - debt.paidAmount);
            const percentPaid = Math.min(100, Math.round((debt.paidAmount / debt.amount) * 100));

            return (
              <div
                key={debt.id}
                className="p-4 card space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {debt.personName}
                      </h4>
                      {debt.isCompleted ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Lunas
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Belum Lunas
                        </span>
                      )}
                    </div>
                    {debt.note && (
                      <p className="text-xs text-zinc-500 mt-0.5">{debt.note}</p>
                    )}
                    {debt.dueDate && (
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Jatuh tempo: {formatDateIndonesian(debt.dueDate)}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                      {hideBalance ? '••••••' : formatIDR(debt.amount)}
                    </p>
                    {!debt.isCompleted && (
                      <p className="text-[11px] font-semibold text-rose-500 mt-0.5">
                        Sisa: {formatIDR(remaining)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${percentPaid}%` }}
                  />
                </div>

                {/* Actions */}
                <div className="pt-1 flex items-center justify-between text-xs">
                  {!debt.isCompleted ? (
                    <button
                      onClick={() => setActiveDebtForPay(debt)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 active:scale-95 transition-all"
                    >
                      + Catat Cicilan / Pelunasan
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-500 font-semibold">
                      Selesai Dibayarkan ✓
                    </span>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`Hapus catatan ${debt.personName}?`)) {
                        deleteDebt(debt.id);
                      }
                    }}
                    className="text-zinc-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pay / Settle Modal */}
      {activeDebtForPay && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setActiveDebtForPay(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] p-5 shadow-ios-elevated animate-slide-up z-10 border-t border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              Bayar Cicilan: {activeDebtForPay.personName}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Sisa tagihan: {formatIDR(activeDebtForPay.amount - activeDebtForPay.paidAmount)}
            </p>

            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Nominal Pembayaran
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  placeholder="0"
                  value={payAmount ? parseInt(payAmount, 10).toLocaleString('id-ID') : ''}
                  onChange={e => setPayAmount(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-lg font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPayAmount(String(activeDebtForPay.amount - activeDebtForPay.paidAmount))}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500"
                >
                  Lunasi Sekaligus ({formatIDR(activeDebtForPay.amount - activeDebtForPay.paidAmount)})
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  {activeDebtForPay.type === 'payable' ? 'Sumber Dompet (Keluar)' : 'Dompet Penerima (Masuk)'}
                </label>
                <select
                  value={payWalletId || wallets[0]?.id}
                  onChange={e => setPayWalletId(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} · {formatIDR(getWalletBalance(w.id), true)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-500/30 active:scale-95 transition-all"
                >
                  Simpan Pembayaran
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDebtForPay(null)}
                  className="py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-sm active:scale-95"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Debt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] p-5 shadow-ios-elevated animate-slide-up z-10 border-t border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              {activeTab === 'receivable' ? 'Catat Piutang (Orang Pinjam ke Saya)' : 'Catat Hutang (Saya Pinjam ke Orang)'}
            </h3>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Nama Kontak / Teman
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Budi, Rian, Bos Kantor"
                  value={personName}
                  onChange={e => setPersonName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Total Nominal
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
                    Jatuh Tempo (Opsional)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Catatan / Keperluan
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pinjam buat servis motor"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-500/30 active:scale-95 transition-all"
                >
                  Simpan Catatan
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
