import React, { useState } from 'react';
import { CurrencyCode } from '../../types';
import { EXCHANGE_RATES, CURRENCY_SYMBOLS, formatCurrency } from '../../utils/currency';
import { formatIDR } from '../../utils/format';
import { X, ArrowRightLeft, Coins } from 'lucide-react';

interface CurrencyConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CurrencyConverterModal: React.FC<CurrencyConverterModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('IDR');

  if (!isOpen) return null;

  const numericVal = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;
  const inIDR = numericVal * (EXCHANGE_RATES[fromCurrency] || 1);
  const convertedResult = inIDR / (EXCHANGE_RATES[toCurrency] || 1);

  const currencies: CurrencyCode[] = ['IDR', 'USD', 'SGD', 'JPY', 'EUR', 'MYR'];

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] p-5 shadow-ios-elevated z-10 border-t border-zinc-200 dark:border-zinc-800">
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Kalkulator Kurs & Valuta Asing
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
              Jumlah Uang
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-xl font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          {/* Currency Selectors */}
          <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
            <div>
              <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Dari</label>
              <select
                value={fromCurrency}
                onChange={e => setFromCurrency(e.target.value as any)}
                className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-bold text-[16px] sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                {currencies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSwap}
              className="mt-4 p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 active:scale-95 transition-all text-zinc-600 dark:text-zinc-300"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            <div>
              <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Ke</label>
              <select
                value={toCurrency}
                onChange={e => setToCurrency(e.target.value as any)}
                className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-bold text-[16px] sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                {currencies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Converted Result */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-zinc-100 to-teal-500/10 dark:from-emerald-950/30 dark:via-zinc-850 dark:to-zinc-900 border border-emerald-500/30 text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Hasil Konversi</span>
            <p className="text-2xl font-black text-emerald-500 mt-1">
              {formatCurrency(convertedResult, toCurrency)}
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              Kurs: 1 {fromCurrency} = {formatCurrency(EXCHANGE_RATES[fromCurrency] / EXCHANGE_RATES[toCurrency], toCurrency)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
