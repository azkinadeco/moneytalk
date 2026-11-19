import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ShoppingItem } from '../../types';
import { formatIDR } from '../../utils/format';
import confetti from 'canvas-confetti';
import { ShoppingBag, Plus, Trash2, Check, ArrowRight, Sparkles } from 'lucide-react';

export const ShoppingListView: React.FC = () => {
  const {
    addTransaction,
    wallets,
    categories,
    shoppingItems,
    addShoppingItem,
    toggleShoppingItem,
    deleteShoppingItem,
    clearBoughtShoppingItems,
    showToast,
  } = useFinance();

  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const totalEstimate = shoppingItems.reduce((sum, it) => sum + it.estimatedPrice, 0);
  const boughtTotal = shoppingItems.filter(it => it.isBought).reduce((sum, it) => sum + it.estimatedPrice, 0);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addShoppingItem({
      name: newItemName.trim(),
      estimatedPrice: parseInt(newItemPrice.replace(/\D/g, ''), 10) || 0,
      isBought: false,
    });

    setNewItemName('');
    setNewItemPrice('');
  };

  // 1-Click: Book total bought items into Expenses
  const handleBookExpense = () => {
    if (boughtTotal <= 0) {
      showToast('Pilih barang yang sudah dibeli terlebih dahulu', 'info');
      return;
    }

    const shoppingCat =
      categories.find(c => c.type === 'expense' && (c.name.toLowerCase().includes('belanja') || c.id === 'cat-shopping')) ||
      categories.find(c => c.type === 'expense') ||
      categories[0];

    const walletId = wallets[0]?.id || 'wal-bca';

    addTransaction({
      type: 'expense',
      amount: boughtTotal,
      categoryId: shoppingCat?.id || 'cat-shopping',
      walletId,
      date: new Date().toISOString().split('T')[0],
      note: `Belanja Supermarket (${shoppingItems.filter(i => i.isBought).length} barang)`,
    });

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.8 },
    });

    showToast(`Sukses membukukan ${formatIDR(boughtTotal)} ke ${shoppingCat?.name || 'Belanja'}!`, 'success');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Daftar Belanja
          </h2>
          <p className="text-xs text-zinc-400">Checklist belanja supermarket</p>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-2 gap-2 p-3.5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm">
        <div>
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Total Estimasi</span>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{formatIDR(totalEstimate)}</p>
        </div>
        <div>
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Sudah Terbeli</span>
          <p className="text-sm font-bold text-emerald-500 tabular-nums">{formatIDR(boughtTotal)}</p>
        </div>
      </div>

      {/* Add Item Form */}
      <form
        onSubmit={handleAddItem}
        className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm flex gap-2"
      >
        <input
          type="text"
          placeholder="Nama barang..."
          value={newItemName}
          onChange={e => setNewItemName(e.target.value)}
          className="flex-1 min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
        />
        <input
          type="text"
          inputMode="numeric"
          placeholder="Estimasi harga..."
          value={newItemPrice ? parseInt(newItemPrice, 10).toLocaleString('id-ID') : ''}
          onChange={e => setNewItemPrice(e.target.value.replace(/\D/g, ''))}
          className="w-28 min-h-[44px] px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
        />
        <button
          type="submit"
          className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs active:scale-95 transition-all shadow-sm flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Items List */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
        {shoppingItems.map(it => (
          <div
            key={it.id}
            className={`px-4 py-3 flex items-center justify-between transition-colors ${
              it.isBought ? 'bg-zinc-50/60 dark:bg-zinc-900/40 opacity-70' : ''
            }`}
          >
            <div
              onClick={() => toggleShoppingItem(it.id)}
              className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
            >
              <div
                className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                  it.isBought
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                }`}
              >
                {it.isBought && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <span
                className={`text-xs font-semibold truncate ${
                  it.isBought
                    ? 'line-through text-zinc-400'
                    : 'text-zinc-800 dark:text-zinc-200'
                }`}
              >
                {it.name}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0 pl-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {formatIDR(it.estimatedPrice)}
              </span>
              <button
                onClick={() => deleteShoppingItem(it.id)}
                className="text-zinc-300 hover:text-rose-500 transition-colors"
                title="Hapus barang"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleBookExpense}
          className="w-full min-h-[48px] rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/25 active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Bukukan Belanja ({formatIDR(boughtTotal)})
        </button>

        {shoppingItems.some(i => i.isBought) && (
          <button
            onClick={clearBoughtShoppingItems}
            className="w-full min-h-[40px] rounded-xl bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold text-xs active:scale-95 transition-all"
          >
            Hapus Barang Yang Sudah Terbeli
          </button>
        )}
      </div>
    </div>
  );
};
