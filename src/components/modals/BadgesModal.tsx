import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Trophy, X, Check, Lock } from 'lucide-react';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({ isOpen, onClose }) => {
  const { badges } = useFinance();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] p-5 shadow-ios-elevated z-10 border-t border-zinc-200 dark:border-zinc-800">
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Piala Pencapaian Finansial
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-[70vh] overflow-y-auto">
          {badges.map(b => (
            <div
              key={b.id}
              className={`p-3.5 rounded-2xl border flex items-center gap-3.5 transition-all ${
                b.isUnlocked
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
                  : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 opacity-50'
              }`}
            >
              <div className="text-3xl p-2 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm shrink-0">
                {b.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{b.title}</h4>
                  {b.isUnlocked ? (
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      Terbuka ✓
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> Terkunci
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
