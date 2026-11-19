import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { FinancialGoal } from '../../types';
import { formatIDR, getMonthName } from '../../utils/format';
import { DynamicIcon } from '../common/DynamicIcon';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Plus,
  Target,
  Trash2,
  Edit2,
  Sparkles,
  Check,
} from 'lucide-react';

export const GoalsView: React.FC = () => {
  const {
    goals,
    addGoal,
    updateGoal,
    updateGoalAmount,
    deleteGoal,
    budgets,
    setBudgetLimit,
    categories,
    transactions,
    wallets,
    selectedMonth,
    monthlyStats,
    userProfile,
    hideBalance,
  } = useFinance();

  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [activeGoalForDeposit, setActiveGoalForDeposit] = useState<FinancialGoal | null>(null);
  const [depositMode, setDepositMode] = useState<'add' | 'withdraw'>('add');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositWalletId, setDepositWalletId] = useState('');

  // Add/Edit Goal Form State
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [icon, setIcon] = useState('ShieldCheck');
  const [color, setColor] = useState('#10B981');

  // Budget editing state
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [budgetVal, setBudgetVal] = useState('');

  const goalIcons = [
    { name: 'ShieldCheck', label: 'Darurat' },
    { name: 'Plane', label: 'Liburan' },
    { name: 'Smartphone', label: 'Gadget' },
    { name: 'Car', label: 'Kendaraan' },
    { name: 'Home', label: 'Rumah' },
    { name: 'Heart', label: 'Menikah' },
  ];

  const colorOptions = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

  const handleOpenCreateModal = () => {
    sounds.playPop();
    setEditingGoal(null);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setIcon('ShieldCheck');
    setColor('#10B981');
    setShowAddGoalModal(true);
  };

  const handleOpenEditModal = (goal: FinancialGoal) => {
    sounds.playPop();
    setEditingGoal(goal);
    setTitle(goal.title);
    setTargetAmount(String(goal.targetAmount));
    setCurrentAmount(String(goal.currentAmount));
    setIcon(goal.icon);
    setColor(goal.color);
    setShowAddGoalModal(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const targetVal = parseInt(targetAmount.replace(/\D/g, ''), 10) || 0;
    const currentVal = parseInt(currentAmount.replace(/\D/g, ''), 10) || 0;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        title: title.trim(),
        targetAmount: targetVal,
        currentAmount: currentVal,
        icon,
        color,
      });
    } else {
      addGoal({
        title: title.trim(),
        targetAmount: targetVal,
        currentAmount: currentVal,
        icon,
        color,
      });
    }

    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setEditingGoal(null);
    setShowAddGoalModal(false);
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoalForDeposit) return;
    const amount = parseInt(depositAmount.replace(/\D/g, ''), 10) || 0;
    if (amount <= 0) return;

    const delta = depositMode === 'add' ? amount : -amount;
    updateGoalAmount(activeGoalForDeposit.id, delta, depositWalletId || wallets[0]?.id);

    if (depositMode === 'add') {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    }

    setDepositAmount('');
    setDepositWalletId('');
    setActiveGoalForDeposit(null);
  };

  // Batch 69: 1-Tap Smart Auto-Budget 50/30/20 Generator
  const handleAutoAllocateBudgets = () => {
    sounds.playSuccess();
    sounds.vibrate(25);
    const baseIncome =
      monthlyStats.income > 0
        ? monthlyStats.income
        : userProfile.monthlyIncomeTarget || 10000000;
    const maxSpendable = Math.round(baseIncome * 0.7); // 70% for needs + wants, 30% savings
    const expenseCats = categories.filter(c => c.type === 'expense');
    if (expenseCats.length === 0) return;

    // Weight primary needs higher
    const primaryIds = ['cat-food', 'cat-transport', 'cat-bills'];
    expenseCats.forEach(cat => {
      const share = primaryIds.includes(cat.id)
        ? Math.round((maxSpendable * 0.2) / 100000) * 100000
        : Math.round((maxSpendable * 0.08) / 50000) * 50000;
      setBudgetLimit(cat.id, Math.max(250000, share));
    });

    confetti({ particleCount: 40, spread: 60, origin: { y: 0.75 } });
  };

  const totalBudget = budgets
    .filter(b => b.month === selectedMonth)
    .reduce((sum, b) => sum + b.limit, 0);

  return (
    <div className="space-y-6 pb-24">
      {/* SECTION 1: Target Menabung / Financial Goals */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-500" />
            <span>Target Tabungan</span>
          </h2>
          <button
            onClick={handleOpenCreateModal}
            className="min-h-[36px] flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Tambah</span>
          </button>
        </div>

        {/* Goals List */}
        <div className="space-y-2.5">
          {goals.map(goal => {
            const percentage = Math.min(
              100,
              goal.targetAmount > 0
                ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
                : 0
            );
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <div
                key={goal.id}
                className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0"
                      style={{ backgroundColor: goal.color }}
                    >
                      <DynamicIcon name={goal.icon} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight truncate">
                        {goal.title}
                      </h4>
                      <p className="text-[10px] text-zinc-400 tabular-nums">
                        {percentage}% •{' '}
                        {remaining === 0 ? 'Tercapai! 🎉' : `Sisa ${formatIDR(remaining, true)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        sounds.playPop();
                        setDepositMode('add');
                        setActiveGoalForDeposit(goal);
                      }}
                      className="min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 active:scale-95 transition-all"
                    >
                      + Tabung
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(goal)}
                      aria-label="Edit Target"
                      className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-emerald-500 flex items-center justify-center active:scale-90 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: goal.color,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 tabular-nums">
                  <span>{hideBalance ? '••••••' : formatIDR(goal.currentAmount)}</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Target {hideBalance ? '••••••' : formatIDR(goal.targetAmount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Anggaran Bulanan per Kategori */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Batas Anggaran ({getMonthName(selectedMonth)})
            </h2>
            {totalBudget > 0 && (
              <p className="text-[11px] text-zinc-400 tabular-nums">
                Total Alokasi: {hideBalance ? '••••••' : formatIDR(totalBudget)}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleAutoAllocateBudgets}
            className="min-h-[36px] px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 hover:bg-indigo-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Budget</span>
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm p-4 divide-y divide-zinc-100 dark:divide-zinc-800">
          {categories
            .filter(c => c.type === 'expense')
            .map(cat => {
              const currentBudget = budgets.find(
                b => b.categoryId === cat.id && b.month === selectedMonth
              );
              const limit = currentBudget?.limit || 0;

              const spent = transactions
                .filter(
                  t =>
                    t.type === 'expense' &&
                    t.categoryId === cat.id &&
                    t.date.startsWith(selectedMonth)
                )
                .reduce((sum, t) => sum + t.amount, 0);

              const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
              const isEditing = editingBudgetId === cat.id;

              return (
                <div key={cat.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs shrink-0"
                        style={{ backgroundColor: cat.color }}
                      >
                        <DynamicIcon name={cat.icon} className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                        {cat.name}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={budgetVal}
                          onChange={e => setBudgetVal(e.target.value.replace(/\D/g, ''))}
                          className="w-28 min-h-[38px] px-2.5 py-1 rounded-xl text-[16px] sm:text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-right focus:outline-none tabular-nums"
                        />
                        <button
                          onClick={() => {
                            const val = parseInt(budgetVal, 10) || 0;
                            setBudgetLimit(cat.id, val);
                            setEditingBudgetId(null);
                          }}
                          className="min-h-[38px] px-3 py-1 rounded-xl text-xs bg-emerald-500 text-white font-bold flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          sounds.playPop();
                          setEditingBudgetId(cat.id);
                          setBudgetVal(limit > 0 ? String(limit) : '');
                        }}
                        className="min-h-[34px] px-2.5 py-1 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-xs text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 font-bold tabular-nums"
                      >
                        {limit > 0 ? formatIDR(limit, true) : '+ Pasang Limit'}
                      </button>
                    )}
                  </div>

                  {limit > 0 && (
                    <>
                      <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            percent >= 90
                              ? 'bg-rose-500'
                              : percent >= 75
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-zinc-400 tabular-nums">
                        <span>
                          Terpakai: {formatIDR(spent, true)} ({percent}%)
                        </span>
                        <span
                          className={
                            spent > limit ? 'text-rose-500 font-bold' : 'text-emerald-500 font-semibold'
                          }
                        >
                          {spent > limit
                            ? `Over ${formatIDR(spent - limit, true)}`
                            : `Sisa ${formatIDR(limit - spent, true)}`}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Deposit / Withdraw Goal Modal */}
      {activeGoalForDeposit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setActiveGoalForDeposit(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl p-5 shadow-ios-elevated animate-slide-up z-10 border-t border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              {activeGoalForDeposit.title}
            </h3>
            <p className="text-xs text-zinc-400 mb-3 tabular-nums">
              Terkumpul saat ini: {formatIDR(activeGoalForDeposit.currentAmount)}
            </p>

            {/* Mode Switch: Tambah vs Tarik */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800 gap-1 mb-4">
              <button
                type="button"
                onClick={() => setDepositMode('add')}
                className={`min-h-[38px] text-xs font-bold rounded-xl transition-all ${
                  depositMode === 'add'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-zinc-500'
                }`}
              >
                + Tambah Tabungan
              </button>
              <button
                type="button"
                onClick={() => setDepositMode('withdraw')}
                className={`min-h-[38px] text-xs font-bold rounded-xl transition-all ${
                  depositMode === 'withdraw'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-zinc-500'
                }`}
              >
                - Tarik Dana
              </button>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Nominal ({depositMode === 'add' ? 'Setoran' : 'Penarikan'})
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 500.000"
                  value={depositAmount ? parseInt(depositAmount, 10).toLocaleString('id-ID') : ''}
                  onChange={e => setDepositAmount(e.target.value.replace(/\D/g, ''))}
                  className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 tabular-nums"
                />
              </div>

              <div className="flex gap-2">
                {[50000, 100000, 250000, 500000, 1000000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setDepositAmount(String((parseInt(depositAmount, 10) || 0) + val))
                    }
                    className="flex-1 min-h-[36px] py-1.5 rounded-xl text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-emerald-500 border border-transparent active:scale-95 transition-all"
                  >
                    +{val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}k`}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  {depositMode === 'add' ? 'Sumber Dompet (Keluar)' : 'Tujuan Dompet (Masuk)'}
                </label>
                <select
                  value={depositWalletId || wallets[0]?.id}
                  onChange={e => setDepositWalletId(e.target.value)}
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
                  className={`flex-1 min-h-[48px] py-3 rounded-2xl text-white font-bold text-xs shadow-md active:scale-95 transition-all ${
                    depositMode === 'add'
                      ? 'bg-emerald-500 shadow-emerald-500/30'
                      : 'bg-rose-500 shadow-rose-500/30'
                  }`}
                >
                  {depositMode === 'add' ? 'Masukkan ke Tabungan' : 'Tarik dari Tabungan'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGoalForDeposit(null)}
                  className="min-h-[48px] py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs active:scale-95 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowAddGoalModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl p-5 shadow-ios-elevated animate-slide-up z-10 border-t border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {editingGoal ? `Edit Target: ${editingGoal.title}` : 'Buat Target Tabungan Baru'}
              </h3>
              {editingGoal && goals.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Hapus target "${editingGoal.title}"?`)) {
                      deleteGoal(editingGoal.id);
                      setShowAddGoalModal(false);
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Nama Target
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Beli iPhone 17, Modal Nikah, Modal Usaha"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Target Nominal
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="0"
                    value={targetAmount ? parseInt(targetAmount, 10).toLocaleString('id-ID') : ''}
                    onChange={e => setTargetAmount(e.target.value.replace(/\D/g, ''))}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 tabular-nums"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Terkumpul Saat Ini
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={
                      currentAmount ? parseInt(currentAmount, 10).toLocaleString('id-ID') : ''
                    }
                    onChange={e => setCurrentAmount(e.target.value.replace(/\D/g, ''))}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 tabular-nums"
                  />
                </div>
              </div>

              {/* Warna Target */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                  Warna Target
                </label>
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

              {/* Ikon Target */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                  Ikon Impian
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {goalIcons.map(gi => (
                    <button
                      key={gi.name}
                      type="button"
                      onClick={() => setIcon(gi.name)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        icon === gi.name
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <DynamicIcon name={gi.name} className="w-5 h-5 mb-1" />
                      <span className="text-[9px]">{gi.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 min-h-[48px] py-3 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/30 active:scale-95 transition-all"
                >
                  {editingGoal ? 'Simpan Perubahan' : 'Buat Target'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="min-h-[48px] py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs active:scale-95 transition-all"
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
