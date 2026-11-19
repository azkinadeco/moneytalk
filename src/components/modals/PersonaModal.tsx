import React, { useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { PERSONA_PRESETS, PersonaData } from '../../utils/personas';
import { Sparkles, X, Upload, Check, UserCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PersonaModal: React.FC<PersonaModalProps> = ({ isOpen, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleApplyPersona = (persona: PersonaData) => {
    if (confirm(`Terapkan preset persona "${persona.name}"? Data saat ini akan digantikan dengan data persona ini.`)) {
      localStorage.setItem('moneytalk_cat_v2', JSON.stringify(persona.categories));
      localStorage.setItem('moneytalk_wal_v2', JSON.stringify(persona.wallets));
      localStorage.setItem('moneytalk_bud_v2', JSON.stringify(persona.budgets));
      localStorage.setItem('moneytalk_goal_v2', JSON.stringify(persona.goals));
      localStorage.setItem('moneytalk_rec_v2', JSON.stringify(persona.recurring));
      localStorage.setItem('moneytalk_tx_v2', JSON.stringify(persona.transactions));

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      window.location.reload();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.transactions) {
          localStorage.setItem('moneytalk_tx_v2', JSON.stringify(json.transactions));
          if (json.categories) localStorage.setItem('moneytalk_cat_v2', JSON.stringify(json.categories));
          if (json.wallets) localStorage.setItem('moneytalk_wal_v2', JSON.stringify(json.wallets));
          if (json.budgets) localStorage.setItem('moneytalk_bud_v2', JSON.stringify(json.budgets));
          if (json.goals) localStorage.setItem('moneytalk_goal_v2', JSON.stringify(json.goals));

          confetti({ particleCount: 50, spread: 60 });
          alert('Data backup berhasil dipulihkan!');
          window.location.reload();
        } else {
          alert('Format berkas JSON tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca berkas JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] p-5 pb-safe-bottom shadow-ios-elevated animate-slide-up z-10 max-h-[88vh] overflow-y-auto border-t border-zinc-200/80 dark:border-zinc-800">
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <UserCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Preset Gaya Hidup & Restore Data
              </h3>
              <p className="text-[11px] text-zinc-400">Pilih simulasi profil keuanganmu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Persona Options */}
        <div className="space-y-3 mb-5">
          {PERSONA_PRESETS.map(p => (
            <div
              key={p.id}
              onClick={() => handleApplyPersona(p)}
              className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 hover:border-purple-500/50 cursor-pointer active:scale-[0.99] transition-all flex items-start gap-3.5"
            >
              <div className="text-3xl p-2 rounded-2xl bg-white dark:bg-zinc-750 shadow-sm shrink-0">
                {p.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{p.name}</h4>
                  <span className="text-[10px] font-semibold text-purple-500 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
                    Gunakan
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">{p.role}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">{p.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Restore JSON Backup Section */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Upload className="w-4 h-4" />
            Pulihkan / Upload Berkas Backup (JSON)
          </button>
        </div>
      </div>
    </div>
  );
};
