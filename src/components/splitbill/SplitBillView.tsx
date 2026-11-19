import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR, getTodayDateString } from '../../utils/format';
import { SplitBillMember } from '../../types';
import confetti from 'canvas-confetti';
import { Users, Plus, Trash2, Share2, Check, ArrowRight, Copy } from 'lucide-react';

export const SplitBillView: React.FC = () => {
  const { addTransaction, addDebt, wallets, categories, showToast } = useFinance();

  const [billTitle, setBillTitle] = useState('Makan Bareng Teman');
  const [billAmount, setBillAmount] = useState('300000');
  const [taxPercent, setTaxPercent] = useState('10'); // PB1 10%
  const [servicePercent, setServicePercent] = useState('5'); // Service 5%

  const [members, setMembers] = useState<SplitBillMember[]>([
    { id: '1', name: 'Saya (Pribadi)', amount: 100000, isPaid: true },
    { id: '2', name: 'Budi Santoso', amount: 100000, isPaid: false },
    { id: '3', name: 'Rian Pratama', amount: 100000, isPaid: false },
  ]);

  const [newMemberName, setNewMemberName] = useState('');
  const [copiedText, setCopiedText] = useState(false);

  // Calculations
  const baseSubtotal = parseInt(billAmount.replace(/\D/g, ''), 10) || 0;
  const taxVal = Math.round(baseSubtotal * ((parseFloat(taxPercent) || 0) / 100));
  const serviceVal = Math.round(baseSubtotal * ((parseFloat(servicePercent) || 0) / 100));
  const grandTotal = baseSubtotal + taxVal + serviceVal;

  const perPersonEqual = members.length > 0 ? Math.round(grandTotal / members.length) : 0;

  // Split equally
  const handleSplitEqually = () => {
    setMembers(prev => prev.map(m => ({ ...m, amount: perPersonEqual })));
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    const newM: SplitBillMember = {
      id: String(Date.now()),
      name: newMemberName.trim(),
      amount: perPersonEqual,
      isPaid: false,
    };
    setMembers(prev => [...prev, newM]);
    setNewMemberName('');
  };

  const handleRemoveMember = (id: string) => {
    if (members.length <= 1) return;
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleTogglePaid = (id: string) => {
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, isPaid: !m.isPaid } : m)));
  };

  // WhatsApp formatted string
  const generateWhatsAppMessage = () => {
    const lines = [
      `🧾 *RINCIAN PATUNGAN: ${billTitle}*`,
      `Subtotal: ${formatIDR(baseSubtotal)}`,
      taxVal > 0 ? `Pajak (${taxPercent}%): ${formatIDR(taxVal)}` : '',
      serviceVal > 0 ? `Service (${servicePercent}%): ${formatIDR(serviceVal)}` : '',
      `*TOTAL AKHIR: ${formatIDR(grandTotal)}*`,
      '',
      '*Daftar Pembayaran per Orang:*',
      ...members.map(
        (m, idx) =>
          `${idx + 1}. ${m.name}: *${formatIDR(m.amount)}* ${m.isPaid ? '✅ (Lunas)' : '⏳ (Belum bayar)'}`
      ),
      '',
      'Silakan transfer ke rekening BCA / GoPay. Terima kasih banyak guys! 🙏',
    ].filter(Boolean);

    return lines.join('\n');
  };

  const handleCopyWA = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // 1-Click: Book to MoneyTalk as Expense (your part) & Piutang (their parts)
  const handleBookAutomatically = () => {
    const myShare = members[0]?.amount || 0;
    const otherMembers = members.slice(1);

    const foodCat =
      categories.find(
        c =>
          c.type === 'expense' &&
          (c.name.toLowerCase().includes('makan') ||
            c.name.toLowerCase().includes('food') ||
            c.id === 'cat-food')
      ) ||
      categories.find(c => c.type === 'expense') ||
      categories[0];

    const walletId = wallets[0]?.id || 'wal-bca';

    // Add your expense
    addTransaction({
      type: 'expense',
      amount: myShare,
      categoryId: foodCat?.id || 'cat-food',
      walletId,
      date: getTodayDateString(),
      note: `Patungan: ${billTitle} (Porsi Saya)`,
    });

    // Add others to Piutang
    for (const m of otherMembers) {
      if (!m.isPaid && m.amount > 0) {
        addDebt({
          type: 'receivable',
          personName: m.name,
          amount: m.amount,
          paidAmount: 0,
          note: `Patungan ${billTitle}`,
        });
      }
    }

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.8 },
    });

    showToast(
      `Sukses! Porsi kamu (${formatIDR(myShare)}) dicatat di Pengeluaran & piutang teman tercatat!`,
      'success'
    );
  };

  return (
    <div className="space-y-4">
      {/* Bill Input Card */}
      <div className="p-5 card space-y-3.5">
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
            Nama Acara / Resto
          </label>
          <input
            type="text"
            value={billTitle}
            onChange={e => setBillTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
            Total Tagihan (Sebelum Pajak)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={baseSubtotal > 0 ? baseSubtotal.toLocaleString('id-ID') : ''}
            onChange={e => setBillAmount(e.target.value.replace(/\D/g, ''))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-lg font-black text-zinc-900 dark:text-zinc-100 focus:outline-none"
          />
        </div>

        {/* Tax & Service */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
              Pajak Resto PB1 (%)
            </label>
            <input
              type="number"
              value={taxPercent}
              onChange={e => setTaxPercent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
              Service Charge (%)
            </label>
            <input
              type="number"
              value={servicePercent}
              onChange={e => setServicePercent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none"
            />
          </div>
        </div>

        {/* Grand Total Bar */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs">
          <div>
            <span className="text-zinc-400 text-[10px] uppercase font-bold">Total Akhir Tagihan</span>
            <p className="text-base font-black text-emerald-500">{formatIDR(grandTotal)}</p>
          </div>
          <button
            onClick={handleSplitEqually}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 active:scale-95 transition-all shadow-sm"
          >
            Bagi Rata ({members.length} Orang)
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="p-5 card space-y-3">
        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Daftar Teman ({members.length})
        </h4>

        <div className="space-y-2">
          {members.map((m, idx) => (
            <div
              key={m.id}
              className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate block">
                  {m.name}
                </span>
                <button
                  onClick={() => handleTogglePaid(m.id)}
                  className={`text-[10px] font-semibold mt-0.5 px-2 py-0.5 rounded-full ${
                    m.isPaid
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-500'
                  }`}
                >
                  {m.isPaid ? 'Sudah Lunas ✓' : 'Belum Bayar ⏳'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={m.amount > 0 ? m.amount.toLocaleString('id-ID') : ''}
                  onChange={e => {
                    const val = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
                    setMembers(prev => prev.map(item => (item.id === m.id ? { ...item, amount: val } : item)));
                  }}
                  className="w-24 px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-[16px] sm:text-xs font-bold text-right border border-zinc-200 dark:border-zinc-700"
                />

                {idx !== 0 && (
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Friend Input */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Tambah nama teman..."
            value={newMemberName}
            onChange={e => setNewMemberName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddMember()}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
          />
          <button
            onClick={handleAddMember}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold active:scale-95"
          >
            + Teman
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleCopyWA}
          className="w-full min-h-[48px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copiedText ? 'Teks WhatsApp Berhasil Disalin!' : 'Salin Rincian ke WhatsApp'}
        </button>

        <button
          onClick={handleBookAutomatically}
          className="w-full min-h-[48px] rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-750 transition-all active:scale-95"
        >
          <ArrowRight className="w-4 h-4 text-emerald-500" />
          Bukukan ke Arus Kas & Piutang
        </button>
      </div>
    </div>
  );
};
