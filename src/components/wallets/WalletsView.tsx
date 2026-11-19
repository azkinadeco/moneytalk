import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Wallet, WalletType } from '../../types';
import { formatIDR, formatDateIndonesian, getTodayDateString } from '../../utils/format';
import { DynamicIcon } from '../common/DynamicIcon';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Plus,
  ArrowLeftRight,
  Trash2,
  Target,
  HandCoins,
  Repeat,
  ChevronRight,
  Edit2,
  Sliders,
  X,
  Check,
} from 'lucide-react';

interface WalletsViewProps {
  onOpenTransferModal: () => void;
  onNavigate?: (tab: any) => void;
}

export const WalletsView: React.FC<WalletsViewProps> = ({ onOpenTransferModal, onNavigate }) => {
  const {
    wallets,
    getWalletBalance,
    totalBalance,
    hideBalance,
    addWallet,
    updateWallet,
    deleteWallet,
    transactions,
    categories,
    addTransaction,
    goals,
    debts,
    recurring,
  } = useFinance();

  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [sheetMode, setSheetMode] = useState<'history' | 'reconcile' | 'edit'>('history');

  // Reconcile state
  const [actualBalanceStr, setActualBalanceStr] = useState('');

  // Edit wallet state
  const [editName, setEditName] = useState('');
  const [editAccNum, setEditAccNum] = useState('');
  const [editColor, setEditColor] = useState('#3B82F6');
  const [editIcon, setEditIcon] = useState('Landmark');

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

  const handleOpenWalletSheet = (w: Wallet) => {
    sounds.playPop();
    sounds.vibrate(10);
    setSelectedWallet(w);
    setSheetMode('history');
    const curBal = getWalletBalance(w.id);
    setActualBalanceStr(String(Math.max(0, curBal)));
    setEditName(w.name);
    setEditAccNum(w.accountNumber || '');
    setEditColor(w.color);
    setEditIcon(w.icon);
  };

  const selectedWalletTransactions = useMemo(() => {
    if (!selectedWallet) return [];
    return transactions
      .filter(
        t => t.walletId === selectedWallet.id || t.targetWalletId === selectedWallet.id
      )
      .slice(0, 8);
  }, [selectedWallet, transactions]);

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

  const handleReconcileBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet) return;

    const targetBalance = parseInt(actualBalanceStr.replace(/\D/g, ''), 10) || 0;
    const currentBalance = getWalletBalance(selectedWallet.id);
    const diff = targetBalance - currentBalance;

    if (diff === 0) {
      setSelectedWallet(null);
      return;
    }

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const defaultCat =
      categories.find(c => c.type === (diff > 0 ? 'income' : 'expense'))?.id || '';

    addTransaction({
      type: diff > 0 ? 'income' : 'expense',
      amount: Math.abs(diff),
      categoryId: defaultCat,
      walletId: selectedWallet.id,
      date: getTodayDateString(),
      time,
      note: `[Penyesuaian Saldo] ${selectedWallet.name}`,
    });

    confetti({ particleCount: 35, spread: 55, origin: { y: 0.8 } });
    setSelectedWallet(null);
  };

  const handleSaveEditWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet || !editName.trim()) return;

    updateWallet(selectedWallet.id, {
      name: editName.trim(),
      accountNumber: editAccNum.trim() || undefined,
      color: editColor,
      icon: editIcon,
    });

    setSelectedWallet(null);
  };

  return (
    <div className="space-y-5">
      {/* Total + distribution */}
      <section className="card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted">Total saldo {wallets.length} akun</p>
            <p className="text-[26px] leading-tight font-extrabold num text-zinc-900 dark:text-zinc-50 mt-0.5">
              {hideBalance ? 'Rp ••••••' : formatIDR(totalBalance)}
            </p>
          </div>
          <button
            onClick={() => {
              sounds.playPop();
              onOpenTransferModal();
            }}
            className="btn-secondary btn-sm shrink-0"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Transfer
          </button>
        </div>

        {totalBalance > 0 && (
          <div className="flex h-2 mt-4 rounded-full overflow-hidden gap-0.5 bg-zinc-100 dark:bg-zinc-800">
            {wallets.map(w => {
              const pct = (Math.max(0, getWalletBalance(w.id)) / totalBalance) * 100;
              if (pct <= 0) return null;
              return (
                <div
                  key={w.id}
                  className="h-full"
                  style={{ width: `${pct}%`, backgroundColor: w.color }}
                  title={`${w.name}: ${Math.round(pct)}%`}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Wallet list */}
      <section>
        <div className="flex items-center justify-between px-1 mb-2">
          <h3 className="section-title">Akun & dompet</h3>
          <button
            onClick={() => {
              sounds.playPop();
              setShowAddWalletModal(true);
            }}
            className="link min-h-[32px]"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah
          </button>
        </div>

        <div className="card-list">
          {wallets.map(w => {
            const balance = getWalletBalance(w.id);
            const pct = totalBalance > 0 ? Math.round((Math.max(0, balance) / totalBalance) * 100) : 0;
            return (
              <button
                key={w.id}
                onClick={() => handleOpenWalletSheet(w)}
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <span className="icon-tile text-white" style={{ backgroundColor: w.color }}>
                  <DynamicIcon name={w.icon} className="w-5 h-5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {w.name}
                  </span>
                  <span className="block text-xs text-zinc-400 truncate">
                    {w.accountNumber ||
                      (w.type === 'cash'
                        ? 'Tunai'
                        : w.type === 'bank'
                        ? 'Bank'
                        : w.type === 'investment'
                        ? 'Investasi'
                        : 'E-wallet')}{' '}
                    · {pct}%
                  </span>
                </span>
                <span className={`text-sm font-bold num shrink-0 ${balance < 0 ? 'text-rose-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                  {hideBalance ? '••••' : formatIDR(balance)}
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0" />
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-zinc-400 px-1 mt-2">
          Ketuk akun untuk lihat mutasi, edit, atau sesuaikan saldo.
        </p>
      </section>

      {/* Clean Navigation Hub */}
      {onNavigate && (
        <div className="pt-2 space-y-2">
          <h3 className="section-title px-1">Komitmen keuangan</h3>

          <div className="card overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800/60">
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
                  <p className="text-[10px] text-zinc-400">{goals.length} target impian aktif</p>
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

      {/* BATCH 64: INTERACTIVE WALLET DETAIL, RECONCILE & EDIT BOTTOM SHEET */}
      {selectedWallet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setSelectedWallet(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] p-5 pb-safe-bottom shadow-ios-elevated animate-slide-up z-10 max-h-[88dvh] overflow-y-auto border-t border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-3" />

            {/* Wallet Sheet Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: selectedWallet.color }}
                >
                  <DynamicIcon name={selectedWallet.icon} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                    {selectedWallet.name}
                  </h3>
                  <p className="text-xs font-bold text-emerald-500 tabular-nums">
                    {hideBalance ? 'Rp ••••••••' : formatIDR(getWalletBalance(selectedWallet.id))}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedWallet(null)}
                aria-label="Tutup"
                className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Segmented Mode Switcher */}
            <div className="grid grid-cols-3 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 gap-1 mb-4">
              {[
                { id: 'history', label: 'Riwayat' },
                { id: 'reconcile', label: 'Sesuaikan Saldo' },
                { id: 'edit', label: 'Edit Dompet' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setSheetMode(tab.id as any);
                  }}
                  className={`min-h-[38px] text-xs font-bold rounded-xl transition-all ${
                    sheetMode === tab.id
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* MODE 1: RECENT TRANSACTIONS FOR THIS WALLET */}
            {sheetMode === 'history' && (
              <div className="space-y-3">
                {selectedWalletTransactions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-400">
                    Belum ada mutasi transaksi di dompet ini
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden">
                    {selectedWalletTransactions.map(tx => {
                      const isOutgoing =
                        tx.type === 'expense' ||
                        (tx.type === 'transfer' && tx.walletId === selectedWallet.id);
                      const cat =
                        tx.type === 'transfer'
                          ? { name: 'Transfer', icon: 'ArrowLeftRight', color: '#6366F1' }
                          : categories.find(c => c.id === tx.categoryId) || {
                              name: 'Lainnya',
                              icon: 'Package',
                              color: '#64748B',
                            };
                      return (
                        <div
                          key={tx.id}
                          className="p-3 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
                              style={{ backgroundColor: cat.color }}
                            >
                              <DynamicIcon name={cat.icon} className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                {tx.note || cat.name}
                              </p>
                              <p className="text-[10px] text-zinc-400">
                                {formatDateIndonesian(tx.date)}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`font-extrabold tabular-nums shrink-0 ml-2 ${
                              isOutgoing ? 'text-rose-500' : 'text-emerald-500'
                            }`}
                          >
                            {isOutgoing ? '-' : '+'}
                            {formatIDR(tx.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {wallets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Hapus rekening "${selectedWallet.name}"?`)) {
                        deleteWallet(selectedWallet.id);
                        setSelectedWallet(null);
                      }
                    }}
                    className="w-full min-h-[44px] py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Dompet Ini</span>
                  </button>
                )}
              </div>
            )}

            {/* MODE 2: INSTANT BALANCE RECONCILIATION */}
            {sheetMode === 'reconcile' && (() => {
              const curBal = getWalletBalance(selectedWallet.id);
              const targetBal = parseInt(actualBalanceStr.replace(/\D/g, ''), 10) || 0;
              const diff = targetBal - curBal;

              return (
                <form onSubmit={handleReconcileBalance} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-750 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-zinc-400">
                      Saldo Tercatat di Aplikasi
                    </span>
                    <p className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {formatIDR(curBal)}
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                      Masukkan Saldo Asli di Bank / Dompet Saat Ini
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={
                        actualBalanceStr
                          ? parseInt(actualBalanceStr, 10).toLocaleString('id-ID')
                          : ''
                      }
                      onChange={e => setActualBalanceStr(e.target.value.replace(/\D/g, ''))}
                      className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100 focus:outline-none tabular-nums"
                    />
                  </div>

                  {diff !== 0 && (
                    <div
                      className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-between ${
                        diff > 0
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}
                    >
                      <span>Selisih Penyesuaian Otomatis:</span>
                      <span className="tabular-nums">
                        {diff > 0 ? '+' : '-'}
                        {formatIDR(Math.abs(diff))}
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full min-h-[48px] py-3 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan & Samakan Saldo</span>
                  </button>
                </form>
              );
            })()}

            {/* MODE 3: EDIT WALLET DETAILS */}
            {sheetMode === 'edit' && (
              <form onSubmit={handleSaveEditWallet} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Nama Dompet / Bank
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    No. Rekening / Keterangan
                  </label>
                  <input
                    type="text"
                    value={editAccNum}
                    onChange={e => setEditAccNum(e.target.value)}
                    placeholder="Opsional"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                    Warna Kartu
                  </label>
                  <div className="flex gap-2">
                    {colorOptions.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditColor(c)}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          editColor === c ? 'scale-110 ring-2 ring-emerald-500' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[48px] py-3 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
                >
                  Simpan Perubahan Dompet
                </button>
              </form>
            )}
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
                    value={
                      initialBalance ? parseInt(initialBalance, 10).toLocaleString('id-ID') : ''
                    }
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

              {/* Icon & Color selector for new wallet */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                  Tipe & Warna Kartu
                </label>
                <div className="grid grid-cols-5 gap-1.5 mb-2.5">
                  {iconOptions.map(opt => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => {
                        setIcon(opt.icon);
                        setType(opt.type);
                      }}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center text-[10px] font-semibold transition-all ${
                        icon === opt.icon
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <DynamicIcon name={opt.icon} className="w-4 h-4 mb-0.5" />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {colorOptions.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === c ? 'scale-110 ring-2 ring-emerald-500' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
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
