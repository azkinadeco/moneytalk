import { CurrencyCode } from '../types';

export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  IDR: 1,
  USD: 16250,
  SGD: 12100,
  JPY: 105,
  EUR: 17500,
  MYR: 3650,
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  IDR: 'Rp',
  USD: '$',
  SGD: 'S$',
  JPY: '¥',
  EUR: '€',
  MYR: 'RM',
};

export const convertToIDR = (amount: number, fromCurrency: CurrencyCode): number => {
  const rate = EXCHANGE_RATES[fromCurrency] || 1;
  return Math.round(amount * rate);
};

export const convertFromIDR = (amountInIDR: number, toCurrency: CurrencyCode): number => {
  const rate = EXCHANGE_RATES[toCurrency] || 1;
  return amountInIDR / rate;
};

export const formatCurrency = (amount: number, currency: CurrencyCode = 'IDR'): string => {
  if (currency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${symbol} ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(amount)}`;
};
