import React, { useState, useEffect } from 'react';
import { Share, X } from 'lucide-react';

/** Compact "Add to Home Screen" hint — only on iOS Safari when not installed. */
export const IosInstallBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone;
    const isDismissed = localStorage.getItem('moneytalk_pwa_dismissed') === 'true';
    setIsVisible(isIOS && !isStandalone && !isDismissed);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="card p-3 pr-2 flex items-center gap-3">
      <img src="/favicon.png" alt="" className="w-9 h-9 rounded-xl shrink-0" />
      <p className="text-xs text-muted flex-1 leading-snug">
        Pasang di iPhone: ketuk <Share className="inline w-3.5 h-3.5 -mt-0.5" /> lalu{' '}
        <b className="text-zinc-800 dark:text-zinc-200">Tambah ke Layar Utama</b>
      </p>
      <button
        onClick={() => {
          setIsVisible(false);
          localStorage.setItem('moneytalk_pwa_dismissed', 'true');
        }}
        aria-label="Tutup"
        className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
