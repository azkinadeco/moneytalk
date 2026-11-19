import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR } from '../../utils/format';
import { Bot, Send, Sparkles, User, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const AiAdvisorView: React.FC = () => {
  const { totalBalance, monthlyStats, transactions, categories, goals, selectedMonth } = useFinance();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Compute top category
  const topExpenseCategory = React.useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(selectedMonth));
    const map = new Map<string, number>();
    for (const t of expenses) {
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
    }
    let topCatName = 'Makanan';
    let topVal = 0;
    for (const [id, val] of map.entries()) {
      if (val > topVal) {
        topVal = val;
        topCatName = categories.find(c => c.id === id)?.name || 'Makanan';
      }
    }
    return { name: topCatName, amount: topVal };
  }, [transactions, categories, selectedMonth]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Halo! Aku Asisten Finansial Pintar MoneyTalk 🤖. Aku sudah mempelajari pembukuanmu bulan ini: Total saldomu saat ini ${formatIDR(totalBalance)} dengan rasio tabungan ${monthlyStats.savingsRate}%. Ada yang mau kamu diskusikan atau tanyakan?`,
      time: '12:00',
    },
  ]);

  const getAiResponse = (userQuery: string): string => {
    const q = userQuery.toLowerCase();

    if (q.includes('evaluasi') || q.includes('analisis') || q.includes('kondisi') || q.includes('sehat')) {
      if (monthlyStats.savingsRate >= 30) {
        return `Kondisi keuanganmu bulan ini sangat prima! Kamu berhasil menabung ${monthlyStats.savingsRate}% dari pemasukan ${formatIDR(monthlyStats.income)}. Pengeluaran terbesarmu ada di ${topExpenseCategory.name} (${formatIDR(topExpenseCategory.amount)}). Saran saya: alokasikan 10% sisa tabungan ke instrumen reksadana atau emas antam.`;
      } else if (monthlyStats.savingsRate >= 10) {
        return `Kondisi keuanganmu cukup stabil dengan rasio tabungan ${monthlyStats.savingsRate}%. Pos pengeluaran ${topExpenseCategory.name} memakan porsi terbesar (${formatIDR(topExpenseCategory.amount)}). Jika ingin menabung lebih banyak, coba kurangi jajan kafe atau belanja impulsif sebesar 15%.`;
      } else {
        return `Perhatian! Rasio tabunganmu bulan ini rendah (${monthlyStats.savingsRate}%). Pengeluaranmu hampir menyamai pemasukan. Segera batasi pos belanja non-primer pada kategori ${topExpenseCategory.name} agar saldo tabungan tidak tergerus.`;
      }
    }

    if (q.includes('makan') || q.includes('kuliner') || q.includes('kopi')) {
      const foodCatIds = categories
        .filter(
          c =>
            c.name.toLowerCase().includes('makan') ||
            c.name.toLowerCase().includes('food') ||
            c.name.toLowerCase().includes('kuliner') ||
            c.id === 'cat-food'
        )
        .map(c => c.id);

      const foodExp = transactions
        .filter(
          t =>
            t.type === 'expense' &&
            (foodCatIds.length > 0 ? foodCatIds.includes(t.categoryId) : t.categoryId === 'cat-food') &&
            t.date.startsWith(selectedMonth)
        )
        .reduce((sum, t) => sum + t.amount, 0);
      return `Total pengeluaran kategori Makanan & Minuman bulan ini adalah ${formatIDR(foodExp)}. Rata-rata per hari sekitar ${formatIDR(Math.round(foodExp / 30))}. Tips: Bawa bekal makan siang 2 kali seminggu bisa menghemat hingga Rp 350.000 sebulan!`;
    }

    if (q.includes('hemat') || q.includes('tips') || q.includes('cara')) {
      return `Berikut 3 langkah praktis hemat bulan depan:\n1. Terapkan 'Aturan 48 Jam' sebelum membeli barang online di wishlist.\n2. Batasi pos ${topExpenseCategory.name} maksimal ${formatIDR(Math.round(topExpenseCategory.amount * 0.85))}.\n3. Otomatiskan transfer tabungan di awal bulan begitu gaji masuk, bukan menunggu sisa di akhir bulan!`;
    }

    if (q.includes('darurat') || q.includes('target') || q.includes('goals')) {
      const em = goals.find(g => g.id === 'goal-emergency');
      if (em) {
        const sisa = em.targetAmount - em.currentAmount;
        return `Dana Daruratmu saat ini terkumpul ${formatIDR(em.currentAmount)} dari target ${formatIDR(em.targetAmount)} (Kurang ${formatIDR(sisa)}). Dengan konsisten menabung Rp 1,5 juta per bulan, targetmu akan terpenuhi dalam ~${Math.ceil(sisa / 1500000)} bulan ke depan!`;
      }
      return `Kamu punya ${goals.length} target impian aktif. Kunci utama adalah konsistensi menyisihkan nominal tetap tiap tanggal gajian.`;
    }

    return `Pertanyaan yang bagus! Berdasarkan data keuanganmu, total kekayaan aktifmu adalah ${formatIDR(totalBalance)}. Untuk mengoptimalkannya, pastikan rasio pengeluaran primer tetap di bawah 50% dan sisihkan minimal 20% untuk tabungan & investasi masa depan.`;
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const aiReply: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: getAiResponse(query),
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiReply]);
    }, 700);
  };

  const promptChips = [
    '📊 Evaluasi Keuangan Bulan Ini',
    '🍔 Berapa Total Uang Makan Saya?',
    '💡 3 Tips Hemat 500rb Bulan Depan',
    '🎯 Progress Dana Darurat Saya',
  ];

  return (
    <div className="flex flex-col h-[calc(100dvh-150px)] pb-24">
      {/* Advisor Header */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 mb-3 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            Aura AI Advisor
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </h3>
          <p className="text-[11px] text-zinc-400">Konsultan Finansial Pribadi Terintegrasi</p>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 px-1 pr-2">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                m.sender === 'user'
                  ? 'bg-zinc-800 text-white'
                  : 'bg-emerald-500 text-white shadow-sm'
              }`}
            >
              {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-emerald-500 text-white rounded-tr-none'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none shadow-ios-sm'
              }`}
            >
              <p className="whitespace-pre-line">{m.text}</p>
              <span
                className={`text-[9px] block text-right mt-1.5 ${
                  m.sender === 'user' ? 'text-emerald-100' : 'text-zinc-400'
                }`}
              >
                {m.time}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 pl-9">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
            <span>Aura sedang mengetik analisis...</span>
          </div>
        )}
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex gap-1.5 overflow-x-auto py-2 no-scrollbar shrink-0">
        {promptChips.map(pc => (
          <button
            key={pc}
            onClick={() => handleSend(pc)}
            className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500 shrink-0 active:scale-95 transition-all"
          >
            {pc}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="pt-1 flex gap-2 shrink-0">
        <input
          type="text"
          placeholder="Tanya saran finansial ke Aura AI..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          className="flex-1 min-h-[48px] px-4 py-3 card text-[16px] sm:text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-ios-sm"
        />
        <button
          onClick={() => handleSend()}
          className="w-12 h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center active:scale-95 transition-all shadow-md shadow-emerald-500/20 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
