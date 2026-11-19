import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { InvestmentAsset } from '../../types';
import { formatIDR } from '../../utils/format';
import { TrendingUp, Plus, Trash2, ArrowUpRight, ArrowDownRight, Sparkles, Building, Landmark } from 'lucide-react';

export const InvestmentsView: React.FC = () => {
  const { totalBalance, hideBalance, investments, addInvestment, deleteInvestment } = useFinance();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [investedValue, setInvestedValue] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [institution, setInstitution] = useState('');
  const [type, setType] = useState<InvestmentAsset['type']>('mutual_fund');

  // Calculations
  const totalInvested = investments.reduce((sum, a) => sum + a.investedValue, 0);
  const totalCurrent = investments.reduce((sum, a) => sum + a.currentValue, 0);
  const totalGain = totalCurrent - totalInvested;
  const totalGainPercent = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(1) : '0';

  const totalNetWorth = totalBalance + totalCurrent;

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addInvestment({
      name: name.trim(),
      type,
      investedValue: parseInt(investedValue.replace(/\D/g, ''), 10) || 0,
      currentValue: parseInt(currentValue.replace(/\D/g, ''), 10) || 0,
      institution: institution.trim() || 'Mandiri',
      color: type === 'stocks' ? '#3B82F6' : type === 'gold' ? '#F59E0B' : '#10B981',
    });

    setName('');
    setInvestedValue('');
    setCurrentValue('');
    setInstitution('');
    setShowAddModal(false);
  };

  const handleDeleteAsset = (id: string) => {
    deleteInvestment(id);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Portofolio Aset
          </h2>
          <p className="text-xs text-zinc-400">Total kekayaan bersih & instrumen investasi</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="min-h-[36px] px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 active:scale-95 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          + Aset
        </button>
      </div>

      {/* Total Net Worth Card */}
      <div className="p-5 rounded-3xl bg-zinc-900 dark:bg-zinc-850 text-white shadow-ios-card border border-zinc-800 relative overflow-hidden">
        <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
          Total Kekayaan Bersih (Net Worth)
        </span>
        <h3 className="text-3xl sm:text-4xl font-black tracking-tight mt-1 tabular-nums">
          {hideBalance ? 'Rp ••••••••' : formatIDR(totalNetWorth)}
        </h3>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-zinc-800 text-xs">
          <div>
            <span className="text-[10px] text-zinc-400 block">Saldo Kas / Tabungan</span>
            <strong className="text-sm font-bold text-zinc-200 tabular-nums">
              {hideBalance ? '••••••' : formatIDR(totalBalance)}
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block">Portofolio Investasi</span>
            <strong className="text-sm font-bold text-emerald-400 tabular-nums">
              {hideBalance ? '••••••' : formatIDR(totalCurrent)}
            </strong>
          </div>
        </div>
      </div>

      {/* Investment Gain Summary */}
      <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-400">Total Keuntungan Investasi (Gain)</span>
          <p className="text-lg font-black text-emerald-500 flex items-center gap-1 tabular-nums">
            <ArrowUpRight className="w-5 h-5" />
            {hideBalance ? '••••••' : `+${formatIDR(totalGain)} (+${totalGainPercent}%)`}
          </p>
        </div>
      </div>

      {/* Assets List */}
      <div className="space-y-3">
        {investments.map(asset => {
          const gain = asset.currentValue - asset.investedValue;
          const gainPercent =
            asset.investedValue > 0 ? ((gain / asset.investedValue) * 100).toFixed(1) : '0';

          return (
            <div
              key={asset.id}
              className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-ios-sm space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {asset.name}
                  </h4>
                  <span className="text-[11px] text-zinc-400">{asset.institution}</span>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                    {hideBalance ? '••••••' : formatIDR(asset.currentValue)}
                  </p>
                  <p
                    className={`text-[11px] font-bold ${
                      gain >= 0 ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {gain >= 0 ? `+${formatIDR(gain)} (+${gainPercent}%)` : `${formatIDR(gain)} (${gainPercent}%)`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <span>Modal Awal: {formatIDR(asset.investedValue)}</span>
                <button
                  onClick={() => handleDeleteAsset(asset.id)}
                  className="text-zinc-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] p-5 shadow-ios-elevated animate-slide-up z-10 border-t border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Tambah Instrumen Investasi
            </h3>

            <form onSubmit={handleAddAsset} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Nama Aset
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saham BCA, Reksadana Sucorinvest, Bitcoin"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Modal Yang Disetor
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="0"
                    value={investedValue ? parseInt(investedValue, 10).toLocaleString('id-ID') : ''}
                    onChange={e => setInvestedValue(e.target.value.replace(/\D/g, ''))}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Nilai Sekarang
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="0"
                    value={currentValue ? parseInt(currentValue, 10).toLocaleString('id-ID') : ''}
                    onChange={e => setCurrentValue(e.target.value.replace(/\D/g, ''))}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Sekuritas / Platform
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bibit, Ajaib, Pluang, Tokocrypto"
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[16px] sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-sm active:scale-95 transition-all shadow-md"
                >
                  Simpan Aset
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-sm active:scale-95"
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
