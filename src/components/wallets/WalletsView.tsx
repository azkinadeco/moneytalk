import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Wallet, WalletType } from '../../types';
import { formatIDR } from '../../utils/format';
import { DynamicIcon } from '../common/DynamicIcon';
import { Plus, ArrowLeftRight, Trash2, Target, HandCoins, Repeat, ChevronRight, CreditCard, Shield } from 'lucide-react';

interface WalletsViewProps {
  onOpenTransferModal: () => void;
  onNavigate?: (tab: any) => void;
}

export const WalletsView: React.FC<WalletsViewProps> = ({ onOpenTransferModal, onNavigate }) => {
  const { wallets, getWalletBalance, totalBalance, hideBalance, addWallet, deleteWallet, goals, debts, recurring } = useFinance();
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);

  // New Wallet Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('bank');
  const [initialBalance, setInitialBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('Landmark');

  const colorOptions = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#64748B'];

  const iconOptions = [
    { label: 'Bank', icon: 'Landmark', type: 'bank' as WalletType },
    { label: 'Cash', icon: 'Wallet', type: 'cash' as WalletType },
    { label: 'e-Wallet', icon: 'Smartphone', type: 'ewallet' as WalletType },
    { label: 'Investasi', icon: 'TrendingUp', type: 'investment' as WalletType },
    { label: 'Kartu', icon: 'CreditCard', type: 'bank' as WalletType },
  ];

  const handleCreateWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addWallet({
      name: name.trim(),
      type,
      initialBalance: parseInt(initialBalance.replace(/\D/g, ''), 10) || 0,
      color,
      icon,
      accountNumber: accountNumber.trim() || undefined,
    });

    setName('');
    setInitialBalance('');
    setAccountNumber('');
    setShowAddWalletModal(false);
  };

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200">
      {/* Total Balance Card */}
      <div className="p-5 rounded-3xl bg-zinc-900 text-white shadow-ios-elevated border border-white/10 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-zinc-400">Total Aset Kas</span>
          <button
            onClick={onOpenTransferModal}
            className="min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/15 active:scale-95 transition-all"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Transfer</span>
          </button>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight tabular-nums">
          {hideBalance ? 'Rp ••••••••' : formatIDR(totalBalance)}
        </h2>

        {/* Multi-segment Balance Distribution Bar */}
        {totalBalance > 0 && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="w-full h-2 rounded-full bg-white/10 flex overflow-hidden gap-0.5">
              {wallets.map(w => {
                const b = Math.max(0, getWalletBalance(w.id));
                const pct = totalBalance > 0 ? (b / totalBalance) * 100 : 0;
                if (pct <= 0) return null;
                return (
                  <div
                    key={w.id}
                    className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                    style={{ width: `${pct}%`, backgroundColor: w.color }}
                    title={`${w.name}: ${Math.round(pct)}%`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {wallets.map(w => {
                const b = Math.max(0, getWalletBalance(w.id));
                const pct = totalBalance > 0 ? Math.round((b / totalBalance) * 100) : 0;
                return (
                  <div key={w.id} className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: w.color }} />
                    <span>{w.name} {pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Header & Add Button */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          Akun & Dompet
        </h3>
        <button
          onClick={() => setShowAddWalletModal(true)}
          className="min-h-[36px] flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Wallet Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {wallets.map(w => {
          const balance = getWalletBalance(w.id);

          return (
            <div
              key={w.id}
              className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm flex flex-col justify-between group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0"
                    style={{ backgroundColor: w.color }}
                  >
                    <DynamicIcon name={w.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                      {w.name}
                    </h4>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      {w.accountNumber || (w.type === 'cash' ? 'Uang Tunai' : 'Dompet Digital')}
                    </span>
                  </div>
                </div>

                {wallets.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`Hapus rekening "${w.name}"?`)) {
                        deleteWallet(w.id);
                      }
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80">
                <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {hideBalance ? '••••••' : formatIDR(balance)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clean Navigation Hub */}
      {onNavigate && (
        <div className="pt-2 space-y-2">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 px-1">
            Komitmen Keuangan
          </h3>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800/60">
            <button
              onClick={() => onNavigate('goals')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/40 active:bg-zinc-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Target & Anggaran
                  </h4>
                  <p className="text-[10px] text-zinc-400">
                    {goals.length} target impian aktif
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>

            <button
              onClick={() => onNavigate('debts')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/40 active:bg-zinc-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <HandCoins className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Hutang & Piutang
                  </h4>
                  <p className="text-[10px] text-zinc-400">
                    {debts.filter(d => !d.isCompleted).length} catatan belum lunas
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>

            <button
              onClick={() => onNavigate('recurring')}
              className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/40 active:bg-zinc-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <Repeat className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Tagihan Rutin
                  </h4>
                  <p className="text-[10px] text-zinc-400">
                    {recurring.filter(r => r.isActive).length} langganan bulanan
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>
      )}

      {/* Add Wallet Modal */}
      {showAddWalletModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowAddWalletModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl p-5 shadow-ios-elevated animate-slide-up z-10 border-t border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Tambah Dompet Baru
            </h3>

            <form onSubmit={handleCreateWallet} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Nama Dompet / Bank
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bank Jago, ShopeePay, Kas"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Saldo Awal
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={initialBalance ? parseInt(initialBalance, 10).toLocaleString('id-ID') : ''}
                    onChange={e => setInitialBalance(e.target.value.replace(/\D/g, ''))}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none tabular-nums"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    No. Rekening (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 521098..."
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 min-h-[48px] py-3 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
                >
                  Simpan Dompet
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddWalletModal(false)}
                  className="min-h-[48px] px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs active:scale-95"
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
