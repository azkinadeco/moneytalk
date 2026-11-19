import { Category, Wallet, TransactionType } from '../types';

export interface ParsedTransaction {
  type: TransactionType;
  amount: number;
  categoryId: string;
  walletId: string;
  note: string;
}

export const parseNaturalLanguage = (
  text: string,
  categories: Category[],
  wallets: Wallet[]
): ParsedTransaction | null => {
  if (!text || text.trim().length === 0) return null;

  const raw = text.toLowerCase().trim();

  // 1. Detect Type
  let type: TransactionType = 'expense';
  const incomeKeywords = ['gaji', 'bonus', 'freelance', 'dividen', 'terima', 'dapat', 'pemasukan', 'cair'];
  const transferKeywords = ['transfer', 'pindah', 'topup', 'top up'];

  if (transferKeywords.some(kw => raw.includes(kw))) {
    type = 'transfer';
  } else if (incomeKeywords.some(kw => raw.includes(kw))) {
    type = 'income';
  }

  // 2. Extract Amount
  // Support: 50rb, 50k, 1.5jt, 2jt, 25000, 25.000, 150000, rp 50000
  let amount = 0;

  // Pattern: number + jt / juta
  const jtMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/i);
  if (jtMatch) {
    const num = parseFloat(jtMatch[1].replace(',', '.'));
    amount = Math.round(num * 1_000_000);
  } else {
    // Pattern: number + rb / k / ribu
    const rbMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*(?:rb|k|ribu)/i);
    if (rbMatch) {
      const num = parseFloat(rbMatch[1].replace(',', '.'));
      amount = Math.round(num * 1_000);
    } else {
      // Pattern: raw number like 50000 or 50.000 or rp 50.000
      const rawNumMatch = raw.match(/(?:rp\s*)?(\d{1,3}(?:\.\d{3})+|\d+)/i);
      if (rawNumMatch) {
        amount = parseInt(rawNumMatch[1].replace(/\./g, ''), 10);
      }
    }
  }

  // 3. Detect Wallet
  let walletId = wallets[0]?.id || '';
  for (const w of wallets) {
    const wName = w.name.toLowerCase();
    if (raw.includes(wName) || (wName.includes('cash') && raw.includes('tunai')) || (wName.includes('bca') && raw.includes('bca')) || (wName.includes('gopay') && raw.includes('gopay')) || (wName.includes('ovo') && raw.includes('ovo')) || (wName.includes('mandiri') && raw.includes('mandiri'))) {
      walletId = w.id;
      break;
    }
  }

  // 4. Detect Category
  let categoryId = categories.find(c => c.type === type)?.id || '';
  const categoryKeywords: Record<string, string[]> = {
    'cat-food': ['makan', 'minum', 'kopi', 'coffee', 'resto', 'cafe', 'sarapan', 'siang', 'dinner', 'snack', 'ayam', 'mie', 'bakso', 'padang', 'burger', 'pizza'],
    'cat-transport': ['bensin', 'pertalite', 'pertamax', 'gojek', 'grab', 'ojol', 'tol', 'parkir', 'kereta', 'mrt', 'krl', 'busway', 'taksi'],
    'cat-shopping': ['belanja', 'indomaret', 'alfamart', 'superindo', 'shopee', 'tokopedia', 'baju', 'celana', 'sepatu', 'skincare'],
    'cat-bills': ['listrik', 'pln', 'wifi', 'indihome', 'biznet', 'air', 'pdam', 'bpjs', 'pulsa', 'kuota', 'tagihan'],
    'cat-entertainment': ['nonton', 'bioskop', 'netflix', 'spotify', 'game', 'steam', 'playstation', 'liburan', 'hotel'],
    'cat-health': ['obat', 'dokter', 'klinik', 'apotek', 'vitamin', 'gym', 'fitness'],
    'cat-salary': ['gaji', 'salary', 'payroll', 'upah'],
    'cat-freelance': ['freelance', 'proyek', 'side job', 'desain', 'koding', 'client'],
    'cat-gift': ['hadiah', 'angpao', 'thr', 'bonus'],
  };

  for (const [catKey, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => raw.includes(kw))) {
      const found = categories.find(c => c.id === catKey || c.name.toLowerCase().includes(catKey));
      if (found) {
        categoryId = found.id;
        break;
      }
    }
  }

  // 5. Build clean note
  // capitalize first letter
  const note = text.charAt(0).toUpperCase() + text.slice(1);

  return {
    type,
    amount: amount || 0,
    categoryId,
    walletId,
    note,
  };
};
