import React, { useState, useEffect } from 'react';
import { Lock, Delete, ScanFace, Check, ShieldCheck } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface PinLockModalProps {
  isLocked: boolean;
  onUnlock: () => void;
  correctPin?: string;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  isLocked,
  onUnlock,
  correctPin = '1234',
}) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [faceIdScanning, setFaceIdScanning] = useState(false);

  useEffect(() => {
    if (enteredPin.length === 4) {
      if (enteredPin === correctPin) {
        sounds.playSuccess();
        sounds.vibrate(40);
        setEnteredPin('');
        onUnlock();
      } else {
        sounds.vibrate(80);
        setErrorShake(true);
        setTimeout(() => {
          setEnteredPin('');
          setErrorShake(false);
        }, 500);
      }
    }
  }, [enteredPin, correctPin, onUnlock]);

  if (!isLocked) return null;

  const handleKeyPress = (num: string) => {
    if (enteredPin.length < 4) {
      sounds.playPop();
      setEnteredPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setEnteredPin(prev => prev.slice(0, -1));
  };

  const handleSimulateFaceId = () => {
    setFaceIdScanning(true);
    setTimeout(() => {
      setFaceIdScanning(false);
      sounds.playSuccess();
      onUnlock();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-zinc-950 text-white p-6 pb-safe-bottom animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="w-full text-center pt-8">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-amber-500/40 shadow-xl shadow-amber-500/10 mx-auto mb-4 bg-zinc-900">
          <img src="/logo-app.png" alt="Money Talk" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight">Money Talk</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Masukkan 4-digit PIN kamu untuk membuka (Default: 1234)
        </p>

        {/* PIN Dots */}
        <div className={`flex items-center justify-center gap-4 mt-6 ${errorShake ? 'animate-bounce text-rose-500' : ''}`}>
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                enteredPin.length > idx
                  ? errorShake
                    ? 'bg-rose-500 border-rose-500 scale-125'
                    : 'bg-emerald-500 border-emerald-500 scale-110 shadow-sm shadow-emerald-500/50'
                  : 'border-zinc-700 bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Keypad */}
      <div className="w-full max-w-xs space-y-3">
        <div className="grid grid-cols-3 gap-4 text-center">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(key => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 text-xl font-bold hover:bg-zinc-800 active:bg-zinc-700 active:scale-95 transition-all mx-auto flex items-center justify-center"
            >
              {key}
            </button>
          ))}

          {/* Bottom row: Face ID / 0 / Backspace */}
          <button
            onClick={handleSimulateFaceId}
            className="w-16 h-16 rounded-full text-zinc-400 hover:text-emerald-400 active:scale-95 transition-all mx-auto flex items-center justify-center"
            title="Buka dengan Face ID"
          >
            <ScanFace className={`w-7 h-7 ${faceIdScanning ? 'text-emerald-400 animate-pulse' : ''}`} />
          </button>

          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 text-xl font-bold hover:bg-zinc-800 active:bg-zinc-700 active:scale-95 transition-all mx-auto flex items-center justify-center"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full text-zinc-400 hover:text-white active:scale-95 transition-all mx-auto flex items-center justify-center"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center pb-4 text-[11px] text-zinc-500 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        Enkripsi Lokal Aman Terproteksi
      </div>
    </div>
  );
};
