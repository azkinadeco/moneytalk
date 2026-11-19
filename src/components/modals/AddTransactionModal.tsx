import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType, CurrencyCode } from '../../types';
import {
  getTodayDateString,
  getNowTimeString,
  toDateKey,
  formatIDR,
  formatNumberID,
} from '../../utils/format';
import { convertToIDR, EXCHANGE_RATES } from '../../utils/currency';
import { parseNaturalLanguage } from '../../utils/naturalLanguageParser';
import { DynamicIcon } from '../common/DynamicIcon';
import { sounds } from '../../utils/audio';
import { X, Check, Sparkles, Mic, Plus, FileCheck, Delete, ArrowRight } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  editingTransaction?: Transaction | null;
}

/** Evaluates + - * / with normal operator precedence. Returns 0 for invalid input. */
export function evaluateMathExpression(expr: string): number {
  const cleaned = expr.replace(/,/g, '.').replace(/[^0-9.+\-*/]/g, '').replace(/[+\-*/]+$/, '');
  if (!cleaned) return 0;
  const tokens = cleaned.match(/\d+\.?\d*|[+\-*/]/g);
  if (!tokens) return 0;
  // First pass: * and /
  const stack: (number | string)[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if ((t === '*' || t === '/') && stack.length) {
      const prev = Number(stack.pop());
      const next = parseFloat(tokens[++i] || '0');
      stack.push(t === '*' ? prev * next : next !== 0 ? prev / next : prev);
    } else {
      stack.push(/\d/.test(t) ? parseFloat(t) : t);
    }
  }
  // Second pass: + and -
  let total = typeof stack[0] === 'number' ? (stack[0] as number) : 0;
  for (let i = 1; i < stack.length; i += 2) {
    const op = stack[i];
    const v = Number(stack[i + 1] ?? 0);
    total = op === '-' ? total - v : total + v;
  }
  return Math.max(0, Math.round(total * 100) / 100);
}

const CURRENCIES: CurrencyCode[] = ['IDR', 'USD', 'SGD', 'JPY', 'EUR', 'MYR'];
const PRESET_TAGS = ['#kantor', '#keluarga', '#liburan', '#darurat', '#langganan'];
const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 500000];
const NEW_CAT_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];
const LEGACY_CURRENCY_SUFFIX = /\s*\((?:\$|S\$|¥|€|RM|USD|SGD|JPY|EUR|MYR)[^)]*\)$/;

const TYPE_STYLE: Record<TransactionType, { label: string; active: string; btn: string }> = {
  expense: { label: 'Pengeluaran', active: 'bg-rose-500 !text-white', btn: 'bg-rose-500 hover:bg-rose-600' },
  income: { label: 'Pemasukan', active: 'bg-emerald-500 !text-white', btn: 'bg-emerald-500 hover:bg-emerald-600' },
  transfer: { label: 'Transfer', active: 'bg-indigo-500 !text-white', btn: 'bg-indigo-500 hover:bg-indigo-600' },
};

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'expense',
  editingTransaction = null,
}) => {
  const {
    categories,
    wallets,
    transactions,
    addTransaction,
    updateTransaction,
    addCategory,
    getWalletBalance,
    showToast,
    hideBalance,
  } = useFinance();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [currency, setCurrency] = useState<CurrencyCode>('IDR');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [targetWalletId, setTargetWalletId] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isReimburse, setIsReimburse] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(NEW_CAT_COLORS[0]);

  const [smartText, setSmartText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [smartHint, setSmartHint] = useState<string | null>(null);
  const smartInputRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  // Reset/sync state whenever the sheet opens
  useEffect(() => {
    if (!isOpen) return;
    const tx = editingTransaction;
    if (tx) {
      setType(tx.type);
      setCurrency(tx.currency || 'IDR');
      setAmountStr(String(tx.originalAmount ?? tx.amount));
      setCategoryId(tx.categoryId || '');
      setWalletId(tx.walletId || wallets[0]?.id || '');
      setTargetWalletId(tx.targetWalletId || wallets.find(w => w.id !== tx.walletId)?.id || '');
      setDate(tx.date || getTodayDateString());
      setNote((tx.note || '').replace(LEGACY_CURRENCY_SUFFIX, ''));
      setSelectedTags(tx.tags || []);
      setIsReimburse(Boolean(tx.isReimburse));
    } else {
      // Remember the last wallet used so the most common case needs zero taps
      const lastWallet = transactions.find(t => t.type !== 'transfer')?.walletId;
      const startWallet = wallets.some(w => w.id === lastWallet) ? lastWallet! : wallets[0]?.id || '';
      setType(defaultType);
      setCurrency('IDR');
      setAmountStr('');
      setCategoryId('');
      setWalletId(startWallet);
      setTargetWalletId(wallets.find(w => w.id !== startWallet)?.id || '');
      setDate(getTodayDateString());
      setNote('');
      setSelectedTags([]);
      setIsReimburse(false);
    }
    setSmartText('');
    setSmartHint(null);
    setShowNewCat(false);
    setShowCalc(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultType, editingTransaction]);

  // Categories sorted by how often they're used — most frequent first
  const availableCategories = useMemo(() => {
    const usage = new Map<string, number>();
    for (const t of transactions.slice(0, 200)) usage.set(t.categoryId, (usage.get(t.categoryId) || 0) + 1);
    return categories
      .filter(c => c.type === type)
      .sort((a, b) => (usage.get(b.id) || 0) - (usage.get(a.id) || 0));
  }, [categories, type, transactions]);

  useEffect(() => {
    if (type === 'transfer') return;
    if (availableCategories.length && !availableCategories.some(c => c.id === categoryId)) {
      setCategoryId(availableCategories[0].id);
    }
  }, [type, availableCategories, categoryId]);

  useEffect(() => {
    if (type === 'transfer' && targetWalletId === walletId) {
      setTargetWalletId(wallets.find(w => w.id !== walletId)?.id || '');
    }
  }, [type, walletId, targetWalletId, wallets]);

  const hasOperator = /[+\-*/]/.test(amountStr.replace(/^-/, ''));
  const numericAmount = useMemo(() => evaluateMathExpression(amountStr), [amountStr]);

  if (!isOpen) return null;

  const isIDR = currency === 'IDR';
  const amountIDR = isIDR ? Math.round(numericAmount) : convertToIDR(numericAmount, currency);
  const style = TYPE_STYLE[type];

  // Display amount with thousand separators (IDR) while keeping the raw expression in state
  const displayAmount = (isIDR ? amountStr.replace(/\d+/g, n => formatNumberID(Number(n))) : amountStr)
    .replace(/\*/g, '×')
    .replace(/\//g, '÷');

  const handleAmountChange = (value: string) => {
    let raw = value.replace(/×|x/gi, '*').replace(/÷|:/g, '/');
    raw = isIDR ? raw.replace(/\./g, '').replace(/[^0-9+\-*/]/g, '') : raw.replace(/[^0-9.,+\-*/]/g, '');
    raw = raw.replace(/([+\-*/])[+\-*/]+/g, '$1').replace(/^[+*/]/, '');
    setAmountStr(raw);
  };

  const tap = (ms = 10) => {
    sounds.playPop();
    sounds.vibrate(ms);
  };

  const appendOperator = (op: string) => {
    tap();
    if (!amountStr) return;
    if (op === '=') {
      setAmountStr(String(numericAmount));
      return;
    }
    setAmountStr(/[+\-*/]$/.test(amountStr) ? amountStr.slice(0, -1) + op : amountStr + op);
  };

  const applySmartInput = (text: string) => {
    if (!text.trim()) return;
    const parsed = parseNaturalLanguage(text, categories, wallets);
    if (parsed && parsed.amount > 0) {
      setType(parsed.type);
      setCurrency('IDR');
      setAmountStr(String(parsed.amount));
      if (parsed.categoryId) setCategoryId(parsed.categoryId);
      if (parsed.walletId) setWalletId(parsed.walletId);
      if (parsed.note) setNote(parsed.note);
      const catName = categories.find(c => c.id === parsed.categoryId)?.name;
      const walName = wallets.find(w => w.id === parsed.walletId)?.name;
      setSmartHint([formatIDR(parsed.amount), catName, walName].filter(Boolean).join(' · '));
    }
  };

  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      smartInputRef.current?.focus();
      setSmartHint('Pakai ikon mikrofon di keyboard untuk mendikte');
      return;
    }
    try {
      const rec = new SR();
      rec.lang = 'id-ID';
      rec.interimResults = false;
      setIsRecording(true);
      setSmartHint('Mendengarkan… contoh: "kopi 25 ribu gopay"');
      rec.onresult = (e: any) => {
        const transcript = e.results?.[0]?.[0]?.transcript || '';
        setIsRecording(false);
        if (transcript) {
          setSmartText(transcript);
          applySmartInput(transcript);
        }
      };
      rec.onerror = () => {
        setIsRecording(false);
        setSmartHint('Mikrofon tidak tersedia — ketik saja');
      };
      rec.onend = () => setIsRecording(false);
      rec.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleCreateCategory = () => {
    if (!newCatName.trim() || type === 'transfer') return;
    addCategory({
      name: newCatName.trim(),
      color: newCatColor,
      icon: type === 'income' ? 'Coins' : 'ShoppingBag',
      type,
    });
    showToast(`Kategori "${newCatName.trim()}" ditambahkan`);
    setNewCatName('');
    setShowNewCat(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (amountIDR <= 0) {
      showToast('Isi nominal dulu ya', 'error');
      amountRef.current?.focus();
      return;
    }
    if (!walletId) {
      showToast('Pilih dompet terlebih dahulu', 'error');
      return;
    }
    if (type === 'transfer' && (!targetWalletId || walletId === targetWalletId)) {
      showToast('Dompet asal dan tujuan harus berbeda', 'error');
      return;
    }

    const payload = {
      type,
      amount: amountIDR,
      originalAmount: !isIDR ? numericAmount : undefined,
      currency: !isIDR ? currency : undefined,
      categoryId: type === 'transfer' ? '' : categoryId,
      walletId,
      targetWalletId: type === 'transfer' ? targetWalletId : undefined,
      date,
      time: editingTransaction?.time || getNowTimeString(),
      note: note.trim(),
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      isReimburse: type === 'expense' ? isReimburse : false,
      reimburseStatus:
        type === 'expense' && isReimburse
          ? editingTransaction?.reimburseStatus || ('pending' as const)
          : undefined,
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, payload);
      showToast('Perubahan disimpan');
    } else {
      addTransaction(payload);
      showToast(`${style.label} ${formatIDR(amountIDR)} tercatat`);
    }
    onClose();
  };

  const today = getTodayDateString();
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return toDateKey(d);
  })();

  const walletChips = (selected: string, onSelect: (id: string) => void, disabledId?: string) => (
    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
      {wallets.map(w => {
        const active = selected === w.id;
        const disabled = disabledId === w.id;
        return (
          <button
            key={w.id}
            type="button"
            disabled={disabled}
            onClick={() => {
              tap();
              onSelect(w.id);
            }}
            className={`shrink-0 min-h-[48px] pl-2.5 pr-3.5 py-1.5 rounded-xl border flex items-center gap-2 text-left transition-all active:scale-95 disabled:opacity-30 ${
              active
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <span className="w-6 h-6 rounded-lg shrink-0" style={{ backgroundColor: w.color }} />
            <span>
              <span className="block text-xs font-semibold leading-tight">{w.name}</span>
              <span className={`block text-[10px] num leading-tight ${active ? 'opacity-70' : 'text-zinc-400'}`}>
                {hideBalance ? '••••' : formatIDR(getWalletBalance(w.id), true)}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="sheet-backdrop" role="dialog" aria-modal="true" aria-labelledby="tx-sheet-title">
      <div className="fixed inset-0" onClick={onClose} />

      <form onSubmit={handleSubmit} className="sheet !pb-0 flex flex-col">
        <div className="px-5">
          <div className="sheet-handle" />
          <div className="flex items-center justify-between mb-3">
            <h2 id="tx-sheet-title" className="section-title text-base">
              {editingTransaction ? 'Edit transaksi' : 'Catat transaksi'}
            </h2>
            <button type="button" onClick={onClose} aria-label="Tutup" className="icon-btn -mr-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Type */}
          <div className="segmented grid-cols-3">
            {(Object.keys(TYPE_STYLE) as TransactionType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  tap();
                  setType(t);
                  setShowNewCat(false);
                }}
                className={`segment min-h-[38px] ${type === t ? TYPE_STYLE[t].active + ' shadow-xs' : ''}`}
              >
                {TYPE_STYLE[t].label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 pt-4 pb-4 space-y-5 flex-1">
          {/* Smart input */}
          {!editingTransaction && (
            <div>
              <div className="flex items-center gap-2 h-11 pl-3 pr-1 rounded-xl surface-muted focus-within:ring-2 focus-within:ring-emerald-500/40">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                <input
                  ref={smartInputRef}
                  type="text"
                  placeholder='Ketik cepat: "kopi 25rb gopay"'
                  value={smartText}
                  onChange={e => {
                    setSmartText(e.target.value);
                    applySmartInput(e.target.value);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applySmartInput(smartText);
                      amountRef.current?.blur();
                    }
                  }}
                  className="flex-1 min-w-0 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleVoice}
                  aria-label="Dikte suara"
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    isRecording ? 'bg-rose-500 text-white animate-pulse' : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
              {smartHint && (
                <p className="mt-1.5 px-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {smartHint}
                </p>
              )}
            </div>
          )}

          {/* Amount */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="tx-amount" className="label">
                Nominal
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as CurrencyCode)}
                aria-label="Mata uang"
                className="text-sm font-semibold bg-transparent text-zinc-500 focus:outline-none text-right"
              >
                {CURRENCIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 mt-1 border-b-2 border-zinc-200 dark:border-zinc-800 focus-within:border-emerald-500 transition-colors pb-1">
              <span className="text-2xl font-bold text-zinc-400">{isIDR ? 'Rp' : currency}</span>
              <input
                id="tx-amount"
                ref={amountRef}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0"
                value={displayAmount}
                onChange={e => handleAmountChange(e.target.value)}
                className="flex-1 min-w-0 bg-transparent !text-[34px] leading-tight font-extrabold num text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none"
              />
              {amountStr && (
                <button
                  type="button"
                  onClick={() => setAmountStr(amountStr.slice(0, -1))}
                  aria-label="Hapus angka terakhir"
                  className="icon-btn w-9 h-9"
                >
                  <Delete className="w-5 h-5" />
                </button>
              )}
            </div>

            {(hasOperator || !isIDR) && numericAmount > 0 && (
              <p className="mt-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 num">
                = {formatIDR(amountIDR)}
                {!isIDR && (
                  <span className="text-zinc-400 font-medium"> · kurs {formatIDR(EXCHANGE_RATES[currency])}</span>
                )}
              </p>
            )}

            <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar -mx-5 px-5">
              <button
                type="button"
                onClick={() => {
                  tap();
                  setShowCalc(v => !v);
                }}
                className={`chip ${showCalc ? 'chip-active' : ''}`}
                aria-pressed={showCalc}
              >
                ± Hitung
              </button>
              {showCalc
                ? [
                    ['+', '+'],
                    ['−', '-'],
                    ['×', '*'],
                    ['÷', '/'],
                    ['=', '='],
                  ].map(([label, op]) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => appendOperator(op)}
                      className="chip min-w-[44px] justify-center text-sm"
                    >
                      {label}
                    </button>
                  ))
                : isIDR &&
                  QUICK_AMOUNTS.map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        tap();
                        setAmountStr(String(Math.round(numericAmount + v)));
                      }}
                      className="chip"
                    >
                      +{v >= 1_000_000 ? `${v / 1_000_000}jt` : `${v / 1000}rb`}
                    </button>
                  ))}
            </div>
          </div>

          {/* Category */}
          {type !== 'transfer' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="label">Kategori</span>
                <button type="button" onClick={() => setShowNewCat(v => !v)} className="link">
                  {showNewCat ? (
                    'Batal'
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Baru
                    </>
                  )}
                </button>
              </div>

              {showNewCat && (
                <div className="mb-3 p-3 rounded-xl surface-muted space-y-2.5 animate-fade-in">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      placeholder={type === 'income' ? 'Nama sumber pemasukan' : 'Nama kategori'}
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateCategory();
                        }
                      }}
                      className="field !bg-white dark:!bg-zinc-900"
                    />
                    <button type="button" onClick={handleCreateCategory} className="btn-primary shrink-0">
                      Tambah
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {NEW_CAT_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        aria-label={`Warna ${c}`}
                        onClick={() => setNewCatColor(c)}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          newCatColor === c ? 'ring-2 ring-offset-2 ring-zinc-900 dark:ring-white ring-offset-zinc-100 dark:ring-offset-zinc-800' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 gap-2">
                {availableCategories.map(cat => {
                  const active = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        tap(12);
                        setCategoryId(cat.id);
                      }}
                      aria-pressed={active}
                      className={`flex flex-col items-center gap-1.5 pt-2.5 pb-2 px-1 rounded-xl border transition-all active:scale-95 ${
                        active
                          ? 'border-transparent'
                          : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      }`}
                      style={active ? { backgroundColor: `${cat.color}1f`, borderColor: `${cat.color}66` } : undefined}
                    >
                      <span
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                        style={
                          active
                            ? { backgroundColor: cat.color, color: '#fff' }
                            : { backgroundColor: `${cat.color}1f`, color: cat.color }
                        }
                      >
                        <DynamicIcon name={cat.icon} className="w-5 h-5" />
                      </span>
                      <span
                        className={`text-[11px] leading-tight text-center line-clamp-2 ${
                          active ? 'font-bold text-zinc-900 dark:text-zinc-50' : 'font-medium text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Wallets */}
          <div>
            <span className="label block mb-2">{type === 'transfer' ? 'Dari' : 'Dompet'}</span>
            {walletChips(walletId, setWalletId)}
          </div>

          {type === 'transfer' && (
            <div>
              <span className="label flex items-center gap-1 mb-2">
                <ArrowRight className="w-3 h-3" /> Ke
              </span>
              {walletChips(targetWalletId, setTargetWalletId, walletId)}
            </div>
          )}

          {/* Date */}
          <div>
            <span className="label block mb-2">Tanggal</span>
            <div className="flex gap-2">
              {[
                { v: today, label: 'Hari ini' },
                { v: yesterday, label: 'Kemarin' },
              ].map(d => (
                <button
                  key={d.v}
                  type="button"
                  onClick={() => {
                    tap();
                    setDate(d.v);
                  }}
                  className={`chip ${date === d.v ? 'chip-active' : ''}`}
                >
                  {d.label}
                </button>
              ))}
              <input
                type="date"
                value={date}
                max={today}
                onChange={e => e.target.value && setDate(e.target.value)}
                aria-label="Pilih tanggal lain"
                className={`chip flex-1 min-w-0 ${date !== today && date !== yesterday ? 'chip-active' : ''}`}
              />
            </div>
          </div>

          {/* Note & tags */}
          <div>
            <label htmlFor="tx-note" className="label block mb-2">
              Catatan
            </label>
            <input
              id="tx-note"
              type="text"
              placeholder={type === 'income' ? 'mis. Gaji November' : 'mis. Makan siang Padang'}
              value={note}
              onChange={e => setNote(e.target.value)}
              className="field"
            />
            {type !== 'transfer' && (
              <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar -mx-5 px-5">
                {type === 'expense' && (
                  <button
                    type="button"
                    onClick={() => {
                      tap();
                      setIsReimburse(v => !v);
                    }}
                    aria-pressed={isReimburse}
                    className={`chip ${isReimburse ? '!bg-blue-500 !border-blue-500 !text-white' : ''}`}
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    Klaim kantor
                  </button>
                )}
                {PRESET_TAGS.map(tag => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        tap();
                        setSelectedTags(prev => (active ? prev.filter(t => t !== tag) : [...prev, tag]));
                      }}
                      aria-pressed={active}
                      className={`chip ${active ? '!bg-emerald-500 !border-emerald-500 !text-white' : ''}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sticky submit */}
        <div className="sticky bottom-0 px-5 pt-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-t border-zinc-100 dark:border-zinc-800" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <button
            type="submit"
            className={`btn w-full min-h-[50px] text-white text-[15px] font-bold rounded-2xl ${style.btn}`}
          >
            <Check className="w-5 h-5" strokeWidth={2.6} />
            {editingTransaction
              ? 'Simpan perubahan'
              : amountIDR > 0
              ? `Simpan ${formatIDR(amountIDR)}`
              : `Simpan ${style.label.toLowerCase()}`}
          </button>
        </div>
      </form>
    </div>
  );
};
