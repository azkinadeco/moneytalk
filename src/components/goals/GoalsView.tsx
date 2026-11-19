import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { FinancialGoal } from '../../types';
import { formatIDR, getMonthName } from '../../utils/format';
import { DynamicIcon } from '../common/DynamicIcon';
import confetti from 'canvas-confetti';
import { Plus, Target, ShieldCheck, Plane, Smartphone, Car, Home, Heart, Trash2 } from 'lucide-react';

export const GoalsView: React.FC = () => {
  const { goals, addGoal, updateGoalAmount, deleteGoal, budgets, setBudgetLimit, categories, transactions, selectedMonth, hideBalance } = useFinance();

  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [activeGoalForDeposit, setActiveGoalForDeposit] = useState<FinancialGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Add Goal Form State
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

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addGoal({
      title: title.trim(),
      targetAmount: parseInt(targetAmount.replace(/\D/g, ''), 10) || 0,
      currentAmount: parseInt(currentAmount.replace(/\D/g, ''), 10) || 0,
      icon,
      color,
    });

    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setShowAddGoalModal(false);
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoalForDeposit) return;
    const amount = parseInt(depositAmount.replace(/\D/g, ''), 10) || 0;
    if (amount <= 0) return;

    updateGoalAmount(activeGoalForDeposit.id, amount);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
    });

    setDepositAmount('');
    setActiveGoalForDeposit(null);
  };

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
            onClick={() => setShowAddGoalModal(true)}
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
              goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0
            );
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <div
                key={goal.id}
                className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0"
                      style={{ backgroundColor: goal.color }}
                    >
                      <DynamicIcon name={goal.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                        {goal.title}
                      </h4>
                      <p className="text-[10px] text-zinc-400 tabular-nums">
                        {percentage}% • Sisa {formatIDR(remaining, true)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveGoalForDeposit(goal)}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 active:scale-95 transition-all"
                  >
                    + Tabung
                  </button>
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
        <div className="px-1">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Batas Anggaran ({getMonthName(selectedMonth)})
          </h2>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm p-4 divide-y divide-zinc-100 dark:divide-zinc-800">
          {categories
            .filter(c => c.type === 'expense')
            .map(cat => {
              const currentBudget = budgets.find(
                b => b.categoryId === cat.id && b.month === selectedMonth
              );
              const limit = currentBudget?.limit || 0;

              // Calculate current spend
              const spent = transactions
                .filter(t => t.type === 'expense' && t.categoryId === cat.id && t.date.startsWith(selectedMonth))
                .reduce((sum, t) => sum + t.amount, 0);

              const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
              const isEditing = editingBudgetId === cat.id;

              return (
                <div key={cat.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        <DynamicIcon name={cat.icon} className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
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
                          className="w-24 px-2 py-1 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 text-right focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            const val = parseInt(budgetVal, 10) || 0;
                            setBudgetLimit(cat.id, val);
                            setEditingBudgetId(null);
                          }}
                          className="px-2 py-1 rounded-lg text-xs bg-emerald-500 text-white font-semibold"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingBudgetId(cat.id);
                          setBudgetVal(limit > 0 ? String(limit) : '');
                        }}
                        className="text-xs text-zinc-500 hover:text-emerald-500 font-semibold"
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
                            percent >= 90 ? 'bg-rose-500' : percent >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-zinc-400">
                        <span>Terpakai: {formatIDR(spent, true)} ({percent}%)</span>
                        <span>Sisa: {formatIDR(Math.max(0, limit - spent), true)}</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Deposit to Goal Modal */}
      {activeGoalForDeposit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setActiveGoalForDeposit(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl p-5 shadow-ios-elevated animate-slide-up z-10 border-t border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              Tambah Tabungan: {activeGoalForDeposit.title}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Terkumpul saat ini: {formatIDR(activeGoalForDeposit.currentAmount)}
            </p>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Nominal Tambahan
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  placeholder="e.g. 500.000"
                  value={depositAmount ? parseInt(depositAmount, 10).toLocaleString('id-ID') : ''}
                  onChange={e => setDepositAmount(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-lg font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="flex gap-2">
                {[50000, 100000, 250000, 500000, 1000000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDepositAmount(String((parseInt(depositAmount, 10) || 0) + val))}
                    className="flex-1 py-1.5 rounded-xl text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-emerald-500 border border-transparent active:scale-95 transition-all"
                  >
                    +{val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}k`}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-500/30 active:scale-95 transition-all"
                >
                  Masukkan ke Tabungan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGoalForDeposit(null)}
                  className="py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-sm active:scale-95 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowAddGoalModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl p-5 shadow-ios-elevated animate-slide-up z-10 border-t border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Buat Target Tabungan Baru
            </h3>

            <form onSubmit={handleCreateGoal} className="space-y-3.5">
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
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
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
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Terkumpul Awal
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={currentAmount ? parseInt(currentAmount, 10).toLocaleString('id-ID') : ''}
                    onChange={e => setCurrentAmount(e.target.value.replace(/\D/g, ''))}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
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
                  className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-500/30 active:scale-95 transition-all"
                >
                  Buat Target
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-sm active:scale-95 transition-all"
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
