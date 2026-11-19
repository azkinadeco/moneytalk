import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType, CurrencyCode } from '../../types';
import { getTodayDateString, formatIDR } from '../../utils/format';
import { convertToIDR, formatCurrency, EXCHANGE_RATES } from '../../utils/currency';
import { parseNaturalLanguage } from '../../utils/naturalLanguageParser';
import { DynamicIcon } from '../common/DynamicIcon';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  X,
  Check,
  Calendar,
  MessageSquare,
  Sparkles,
  Mic,
} from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  editingTransaction?: Transaction | null;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'expense',
  editingTransaction = null,
}) => {
  const { categories, wallets, addTransaction, updateTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [currency, setCurrency] = useState<CurrencyCode>('IDR');
  const [amountStr, setAmountStr] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [walletId, setWalletId] = useState<string>('');
  const [targetWalletId, setTargetWalletId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [note, setNote] = useState<string>('');

  // F-01 & F-03: Smart NLP & Real Web Speech Voice Input
  const [smartTextInput, setSmartTextInput] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [detectedBadge, setDetectedBadge] = useState<string | null>(null);
  const smartInputRef = useRef<HTMLInputElement>(null);

  // F-01 & F-02: Sync modal state whenever it opens or when editingTransaction/defaultType changes
  useEffect(() => {
    if (!isOpen) return;

    if (editingTransaction) {
      setType(editingTransaction.type);
      setCurrency(editingTransaction.currency || 'IDR');
      setAmountStr(
        String(
          editingTransaction.originalAmount
            ? editingTransaction.originalAmount
            : editingTransaction.amount
        )
      );
      setCategoryId(editingTransaction.categoryId || '');
      setWalletId(editingTransaction.walletId || wallets[0]?.id || '');
      setTargetWalletId(
        editingTransaction.targetWalletId || wallets[1]?.id || wallets[0]?.id || ''
      );
      setDate(editingTransaction.date || getTodayDateString());
      setNote(editingTransaction.note || '');
      setSmartTextInput('');
      setDetectedBadge(null);
    } else {
      setType(defaultType);
      setCurrency('IDR');
      setAmountStr('');
      setDate(getTodayDateString());
      setNote('');
      setSmartTextInput('');
      setDetectedBadge(null);
    }
  }, [isOpen, defaultType, editingTransaction, wallets]);

  const availableCategories = categories.filter(c => c.type === type);

  useEffect(() => {
    if (
      availableCategories.length > 0 &&
      (!categoryId || !availableCategories.some(c => c.id === categoryId))
    ) {
      setCategoryId(availableCategories[0].id);
    }
  }, [type, availableCategories, categoryId]);

  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id);
    }
    if (wallets.length > 1 && !targetWalletId) {
      setTargetWalletId(wallets[1].id);
    }
  }, [wallets, walletId, targetWalletId]);

  if (!isOpen) return null;

  const numericInputAmount = parseFloat(amountStr.replace(/[^0-9.]/g, '')) || 0;
  const equivalentIDR =
    currency === 'IDR' ? numericInputAmount : convertToIDR(numericInputAmount, currency);

  const handleQuickAddAmount = (addVal: number) => {
    const current = numericInputAmount;
    setAmountStr(String(Math.round(current + addVal)));
  };

  // Process smart natural language text (F-01)
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

      const catName =
        categories.find(c => c.id === parsed.categoryId)?.name || 'Kategori';
      const walName = wallets.find(w => w.id === parsed.walletId)?.name || 'Dompet';
      setDetectedBadge(
        `✨ ${formatIDR(parsed.amount)} • ${catName} • ${walName}`
      );

      setTimeout(() => {
        setDetectedBadge(null);
      }, 4000);
    }
  };

  // F-03: Real Web Speech API Dictation (No more fake random data!)
  const handleVoiceTrigger = () => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      smartInputRef.current?.focus();
      setDetectedBadge(
        '🎙️ Gunakan ikon mikrofon di keyboard iPhone kamu untuk mendikte teks'
      );
      setTimeout(() => setDetectedBadge(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'id-ID';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsVoiceRecording(true);
      setDetectedBadge('🎙️ Mendengarkan... Ucapkan contoh: "Kopi 25 ribu gopay"');

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        setIsVoiceRecording(false);
        if (transcript) {
          setSmartTextInput(transcript);
          applySmartInput(transcript);
        }
      };

      recognition.onerror = () => {
        setIsVoiceRecording(false);
        smartInputRef.current?.focus();
        setDetectedBadge(
          '🎙️ Akses mikrofon ditolak/gagal — ketik atau pakai mic keyboard iPhone'
        );
        setTimeout(() => setDetectedBadge(null), 4000);
      };

      recognition.onend = () => {
        setIsVoiceRecording(false);
      };

      recognition.start();
    } catch {
      setIsVoiceRecording(false);
      smartInputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (equivalentIDR <= 0) {
      alert('Masukkan nominal yang valid');
      return;
    }

    if (type === 'transfer' && walletId === targetWalletId) {
      alert('Rekening asal dan tujuan tidak boleh sama');
      return;
    }

    const now = new Date();
    const time =
      editingTransaction?.time ||
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const finalNote =
      currency !== 'IDR'
        ? `${note.trim() ? note.trim() + ' ' : ''}(${formatCurrency(numericInputAmount, currency)})`
        : note.trim();

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        type,
        amount: equivalentIDR,
        originalAmount: currency !== 'IDR' ? numericInputAmount : undefined,
        currency: currency !== 'IDR' ? currency : undefined,
        categoryId: type === 'transfer' ? '' : categoryId,
        walletId,
        targetWalletId: type === 'transfer' ? targetWalletId : undefined,
        date,
        time,
        note: finalNote,
      });
      sounds.playSuccess();
      sounds.vibrate(30);
    } else {
      addTransaction({
        type,
        amount: equivalentIDR,
        originalAmount: currency !== 'IDR' ? numericInputAmount : undefined,
        currency: currency !== 'IDR' ? currency : undefined,
        categoryId: type === 'transfer' ? '' : categoryId,
        walletId,
        targetWalletId: type === 'transfer' ? targetWalletId : undefined,
        date,
        time,
        note: finalNote,
      });

      sounds.playSuccess();
      sounds.vibrate(40);
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.85 },
        colors:
          type === 'expense'
            ? ['#EF4444', '#F59E0B', '#10B981']
            : ['#10B981', '#34D399', '#6EE7B7'],
      });
    }

    setAmountStr('');
    setNote('');
    setSmartTextInput('');
    onClose();
  };

  const handleSelectType = (newType: TransactionType) => {
    sounds.playPop();
    sounds.vibrate(10);
    setType(newType);
  };

  const handleSelectCategory = (id: string) => {
    sounds.playPop();
    sounds.vibrate(12);
    setCategoryId(id);
    // Dismiss virtual keyboard if active to prevent Safari zooming/viewport distortion
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleSelectWallet = (id: string, isTarget = false) => {
    sounds.playPop();
    sounds.vibrate(10);
    if (isTarget) {
      setTargetWalletId(id);
    } else {
      setWalletId(id);
    }
  };

  const quickNotes =
    type === 'expense'
      ? ['Makan Siang', 'Kopi', 'Bensin', 'Gojek', 'Belanja', 'Nonton']
      : ['Gaji', 'Bonus', 'Freelance', 'Dividen', 'Cashback'];

  const currencies: CurrencyCode[] = ['IDR', 'USD', 'SGD', 'JPY', 'EUR', 'MYR'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-tx-title"
    >
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] p-5 pb-safe-bottom shadow-ios-elevated animate-slide-up z-10 max-h-[90dvh] overflow-y-auto overscroll-contain border-t border-zinc-200/80 dark:border-zinc-800">
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-3" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2
              id="modal-tx-title"
              className="text-lg font-bold text-zinc-900 dark:text-zinc-100"
            >
              {editingTransaction ? 'Edit Transaksi' : 'Catat Keuangan'}
            </h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
              {editingTransaction ? 'Koreksi' : '1-Pintu'}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup Modal"
            className="w-11 h-11 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center justify-center active:scale-90 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* F-01 & F-03: Smart AI Text & Real Voice Input Bar */}
        {!editingTransaction && (
          <div className="mb-4">
            <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-750 transition-all focus-within:border-emerald-500">
              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
              <input
                ref={smartInputRef}
                type="text"
                placeholder="Ketik 'Kopi 25rb gopay' atau 'Makan 35rb'..."
                value={smartTextInput}
                onChange={e => {
                  setSmartTextInput(e.target.value);
                  applySmartInput(e.target.value);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applySmartInput(smartTextInput);
                  }
                }}
                className="flex-1 bg-transparent text-[16px] sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none font-medium min-h-[40px]"
              />

              <button
                type="button"
                onClick={handleVoiceTrigger}
                aria-label="Dikte Suara"
                title="Bicara dengan mikrofon untuk catat otomatis"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isVoiceRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-rose-500 active:scale-90'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            {detectedBadge && (
              <div className="mt-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{detectedBadge}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 no-scrollbar">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider shrink-0 mr-0.5">
                Kilat:
              </span>
              {[
                '☕ Kopi 25rb',
                '🍱 Makan Siang 35rb',
                '⛽ Bensin 50rb',
                '🛒 Belanja 100rb',
                '💰 Gaji 5jt bca',
              ].map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    sounds.vibrate(10);
                    setSmartTextInput(prompt);
                    applySmartInput(prompt);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 active:scale-95 transition-all shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Segmented Type Selector (44px min height) */}
          <div className="grid grid-cols-3 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 gap-1">
            <button
              type="button"
              onClick={() => handleSelectType('expense')}
              className={`min-h-[44px] text-xs font-bold rounded-xl transition-all active:scale-95 ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => handleSelectType('income')}
              className={`min-h-[44px] text-xs font-bold rounded-xl transition-all active:scale-95 ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => handleSelectType('transfer')}
              className={`min-h-[44px] text-xs font-bold rounded-xl transition-all active:scale-95 ${
                type === 'transfer'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Transfer
            </button>
          </div>

          {/* Large Amount Input + Currency Selector */}
          <div className="py-2.5 px-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Nominal
              </span>

              <div className="flex items-center gap-1 bg-zinc-200 dark:bg-zinc-700/60 p-0.5 rounded-lg text-[10px] font-bold">
                {currencies.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`px-1.5 py-0.5 rounded-md transition-all ${
                      currency === c
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 my-2">
              <span className="text-xl sm:text-2xl font-bold text-zinc-400">
                {currency === 'IDR' ? 'Rp' : currency}
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={amountStr}
                onChange={e => setAmountStr(e.target.value)}
                className="w-full text-center text-3xl sm:text-4xl font-extrabold bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none tracking-tight tabular-nums"
              />
            </div>

            {currency !== 'IDR' && numericInputAmount > 0 && (
              <p className="text-xs text-center text-emerald-500 font-semibold pb-1 tabular-nums">
                ≈ {formatIDR(equivalentIDR)} (Kurs 1 {currency} ={' '}
                {formatIDR(EXCHANGE_RATES[currency])})
              </p>
            )}

            {currency === 'IDR' && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                {[10000, 20000, 50000, 100000, 500000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAddAmount(val)}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 active:scale-95 transition-all"
                  >
                    +{val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}rb`}
                  </button>
                ))}
                {numericInputAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmountStr('')}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Categories Grid */}
          {type !== 'transfer' && (
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
                Pilih Kategori
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1 no-scrollbar">
                {availableCategories.map(cat => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.id)}
                      style={{
                        borderColor: isSelected ? cat.color : undefined,
                        boxShadow: isSelected ? `0 0 0 2px ${cat.color}40` : undefined,
                      }}
                      className={`min-h-[58px] flex flex-col items-center justify-center p-2 rounded-2xl border transition-all active:scale-90 relative ${
                        isSelected
                          ? 'bg-zinc-100 dark:bg-zinc-800 font-bold shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 text-white shadow-sm transition-transform ${
                          isSelected ? 'scale-110 shadow-md ring-2 ring-white/60 dark:ring-black/60' : ''
                        }`}
                        style={{ backgroundColor: cat.color }}
                      >
                        <DynamicIcon name={cat.icon} className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-200 text-center leading-tight line-clamp-1">
                        {cat.name}
                      </span>
                      {isSelected && (
                        <div
                          className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Account / Wallet Selector */}
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
              {type === 'transfer' ? 'Dari Rekening' : 'Sumber Rekening'}
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {wallets.map(w => {
                const isSelected = walletId === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => handleSelectWallet(w.id, false)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-2xl border flex items-center gap-2 shrink-0 transition-all active:scale-95 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-medium'
                    }`}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: w.color }}
                    />
                    <span className="text-xs">{w.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transfer Target Wallet */}
          {type === 'transfer' && (
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
                Tujuan Transfer
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {wallets.map(w => {
                  const isSelected = targetWalletId === w.id;
                  const isSource = walletId === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      disabled={isSource}
                      onClick={() => handleSelectWallet(w.id, true)}
                      className={`min-h-[44px] px-3.5 py-2 rounded-2xl border flex items-center gap-2 shrink-0 transition-all ${
                        isSource
                          ? 'opacity-40 cursor-not-allowed border-zinc-200 dark:border-zinc-800'
                          : isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-medium active:scale-95'
                      }`}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: w.color }}
                      />
                      <span className="text-xs">{w.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date & Note Inputs (Anti-Zoom: 16px min on mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Tanggal
              </label>
              <div className="min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-transparent text-[16px] sm:text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Catatan (Opsional)
              </label>
              <div className="min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <MessageSquare className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  placeholder="e.g. Makan siang Padang"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full bg-transparent text-[16px] sm:text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {type !== 'transfer' && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickNotes.map(qn => (
                <button
                  key={qn}
                  type="button"
                  onClick={() => setNote(qn)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all"
                >
                  +{qn}
                </button>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full min-h-[48px] py-3 px-4 rounded-2xl text-white font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
                type === 'expense'
                  ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/25'
                  : type === 'transfer'
                  ? 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/25'
                  : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25'
              }`}
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              {editingTransaction ? 'Simpan Perubahan' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
