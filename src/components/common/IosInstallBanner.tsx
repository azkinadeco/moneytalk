import React, { useState, useEffect } from 'react';
import { Share, X, Sparkles, Smartphone } from 'lucide-react';

export const IosInstallBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if not in standalone (PWA) mode and not dismissed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone;
    const isDismissed = localStorage.getItem('moneytalk_pwa_dismissed') === 'true';

    if (!isStandalone && !isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('moneytalk_pwa_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="relative mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 text-zinc-800 dark:text-zinc-200 shadow-ios-sm">
      <button
        onClick={handleDismiss}
        className="absolute top-2.5 right-2.5 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-start gap-3 pr-5">
        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <Smartphone className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
            Bisa Diinstall di iPhone Kamu!
            <Sparkles className="w-3 h-3 text-amber-500" />
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
            Tap tombol <span className="inline-flex items-center px-1 rounded bg-zinc-200 dark:bg-zinc-800 font-semibold text-[10px]"><Share className="w-2.5 h-2.5 mr-0.5" /> Share</span> di Safari, lalu pilih <strong className="text-zinc-800 dark:text-zinc-200">"Tambah ke Layar Utama"</strong> untuk pengalaman fullscreen seperti app bawaan iOS.
          </p>
        </div>
      </div>
    </div>
  );
};
