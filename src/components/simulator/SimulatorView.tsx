import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR } from '../../utils/format';
import { Calculator, Percent, Sparkles, TrendingUp, ShieldAlert, ArrowRight } from 'lucide-react';

export const SimulatorView: React.FC = () => {
  const { monthlyStats } = useFinance();
  const [activeTab, setActiveTab] = useState<'tax' | 'compound'>('compound');

  // Compound Interest State
  const [initialCapital, setInitialCapital] = useState('5000000');
  const [monthlyContribution, setMonthlyContribution] = useState('1500000');
  const [years, setYears] = useState('5');
  const [returnRate, setReturnRate] = useState('7'); // 7% per year

  // Tax PPh 21 State
  const [monthlyGrossIncome, setMonthlyGrossIncome] = useState(
    monthlyStats.income > 0 ? String(monthlyStats.income) : '15000000'
  );
  const [ptkpType, setPtkpType] = useState<'TK/0' | 'K/0' | 'K/1' | 'K/2'>('TK/0');

  // PTKP Rates (Indonesia)
  const PTKP_MAP = {
    'TK/0': 54000000,
    'K/0': 58500000,
    'K/1': 63000000,
    'K/2': 67500000,
  };

  // Compound Interest Calculation
  const P = parseInt(initialCapital.replace(/\D/g, ''), 10) || 0;
  const PMT = parseInt(monthlyContribution.replace(/\D/g, ''), 10) || 0;
  const t = parseInt(years, 10) || 1;
  const r = (parseFloat(returnRate) || 0) / 100;

  // Monthly rate
  const i = r / 12;
  const n = t * 12;

  // FV = P*(1+i)^n + PMT * [ ((1+i)^n - 1) / i ]
  const futureValueInitial = P * Math.pow(1 + i, n);
  const futureValueMonthly = i > 0 ? PMT * ((Math.pow(1 + i, n) - 1) / i) : PMT * n;
  const totalFutureValue = Math.round(futureValueInitial + futureValueMonthly);
  const totalDeposited = P + PMT * n;
  const totalInterestGained = Math.max(0, totalFutureValue - totalDeposited);

  // Tax PPh 21 Calculation
  const grossMonthly = parseInt(monthlyGrossIncome.replace(/\D/g, ''), 10) || 0;
  const grossAnnual = grossMonthly * 12;
  const ptkp = PTKP_MAP[ptkpType];
  const pkp = Math.max(0, grossAnnual - ptkp);

  // Progressive Tax Bracket UU HPP
  let annualTax = 0;
  if (pkp > 0) {
    if (pkp <= 60000000) {
      annualTax = pkp * 0.05;
    } else if (pkp <= 250000000) {
      annualTax = 60000000 * 0.05 + (pkp - 60000000) * 0.15;
    } else if (pkp <= 500000000) {
      annualTax = 60000000 * 0.05 + 190000000 * 0.15 + (pkp - 250000000) * 0.25;
    } else {
      annualTax = 60000000 * 0.05 + 190000000 * 0.15 + 250000000 * 0.25 + (pkp - 500000000) * 0.3;
    }
  }
  const monthlyTax = Math.round(annualTax / 12);
  const netMonthlyIncome = grossMonthly - monthlyTax;

  return (
    <div className="space-y-4 pb-28">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Simulasi Finansial
          </h2>
          <p className="text-xs text-zinc-400">Kalkulator bunga majemuk & pajak PPh 21</p>
        </div>
      </div>

      {/* Segmented Selector */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold gap-1">
        <button
          onClick={() => setActiveTab('compound')}
          className={`min-h-[40px] rounded-xl transition-all ${
            activeTab === 'compound'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
              : 'text-zinc-500'
          }`}
        >
          Bunga Majemuk
        </button>
        <button
          onClick={() => setActiveTab('tax')}
          className={`min-h-[40px] rounded-xl transition-all ${
            activeTab === 'tax'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
              : 'text-zinc-500'
          }`}
        >
          Pajak PPh 21
        </button>
      </div>

      {/* COMPOUND INTEREST CALCULATOR */}
      {activeTab === 'compound' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm space-y-3.5">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Parameter Investasi
            </h4>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Modal Awal Disetor
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={P > 0 ? P.toLocaleString('id-ID') : ''}
                onChange={e => setInitialCapital(e.target.value.replace(/\D/g, ''))}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Rutin Nabung per Bulan
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={PMT > 0 ? PMT.toLocaleString('id-ID') : ''}
                onChange={e => setMonthlyContribution(e.target.value.replace(/\D/g, ''))}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Jangka Waktu ({years} Tahun)
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={years}
                  onChange={e => setYears(e.target.value)}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Estimasi Return ({returnRate}% / thn)
                </label>
                <input
                  type="range"
                  min="3"
                  max="20"
                  value={returnRate}
                  onChange={e => setReturnRate(e.target.value)}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Results Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950 text-white shadow-ios-elevated border border-emerald-500/30 text-center">
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
              Total Hasil di Akhir Tahun ke-{years}
            </span>
            <h3 className="text-3xl font-black text-emerald-400 mt-1">
              {formatIDR(totalFutureValue)}
            </h3>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10 text-xs text-left">
              <div>
                <span className="text-[10px] text-zinc-400 block">Total Modal Disetor</span>
                <strong className="text-sm font-bold text-zinc-200">{formatIDR(totalDeposited)}</strong>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block">Hasil Bunga & Cuan</span>
                <strong className="text-sm font-bold text-emerald-400">+{formatIDR(totalInterestGained)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAX PPH 21 CALCULATOR */}
      {activeTab === 'tax' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm space-y-3.5">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Data Penghasilan & PTKP
            </h4>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Gaji Bruto per Bulan
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={grossMonthly > 0 ? grossMonthly.toLocaleString('id-ID') : ''}
                onChange={e => setMonthlyGrossIncome(e.target.value.replace(/\D/g, ''))}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Status Perkawinan & Tanggungan (PTKP)
              </label>
              <select
                value={ptkpType}
                onChange={e => setPtkpType(e.target.value as any)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                <option value="TK/0">TK/0 — Tidak Kawin (Rp 54 Juta/thn)</option>
                <option value="K/0">K/0 — Kawin Tanpa Anak (Rp 58.5 Juta/thn)</option>
                <option value="K/1">K/1 — Kawin 1 Anak (Rp 63 Juta/thn)</option>
                <option value="K/2">K/2 — Kawin 2 Anak (Rp 67.5 Juta/thn)</option>
              </select>
            </div>
          </div>

          {/* Tax Result Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Estimasi Potongan Pajak UU HPP
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Penghasilan Setahun (Bruto)</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatIDR(grossAnnual)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">PTKP (Bebas Pajak)</span>
                <span className="font-bold text-emerald-500">-{formatIDR(ptkp)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Penghasilan Kena Pajak (PKP)</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatIDR(pkp)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800 text-rose-500 font-bold">
                <span>Pajak PPh 21 Setahun</span>
                <span>{formatIDR(annualTax)}</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold text-rose-500">
                <span>Potongan Pajak per Bulan</span>
                <span>{formatIDR(monthlyTax)}</span>
              </div>
            </div>

            <div className="mt-2 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-950 dark:text-emerald-200">Gaji Bersih / Take-Home Pay:</span>
              <strong className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatIDR(netMonthlyIncome)}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
