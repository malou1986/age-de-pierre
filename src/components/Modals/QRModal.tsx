import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Smartphone, Copy, Check, X, Wifi } from 'lucide-react';

interface QRModalProps {
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // In local network, 192.168.1.24 is the active IP
  const defaultUrl = 'http://192.168.1.24:5173';
  const currentUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? window.location.href
    : defaultUrl;

  useEffect(() => {
    QRCode.toDataURL(currentUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: '#1c1917',
        light: '#f5f5f4',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code error', err));
  }, [currentUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-stone-900 border-2 border-amber-600/80 rounded-2xl max-w-sm w-full p-3 sm:p-6 landscape:p-3 text-stone-100 shadow-2xl space-y-3 sm:space-y-4 text-center my-auto max-h-[96dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5 text-left">
            <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-amber-200">
                Jouer sur Smartphone
              </h3>
              <p className="text-[11px] text-stone-400 flex items-center gap-1">
                <Wifi className="w-3 h-3 text-emerald-400 inline" /> Même réseau Wi-Fi local
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code L'Âge de Pierre"
              className="w-48 h-48 rounded-lg shadow-md border-2 border-stone-700"
            />
          ) : (
            <div className="w-48 h-48 bg-stone-900 animate-pulse rounded-lg flex items-center justify-center text-xs text-stone-500">
              Génération du QR Code...
            </div>
          )}

          <p className="text-xs text-stone-300">
            Scannez ce QR Code avec l'appareil photo de votre smartphone Android / iPhone pour lancer le jeu immédiatement !
          </p>
        </div>

        {/* Direct Link & Copy */}
        <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
          <span className="font-mono text-amber-300 truncate max-w-[200px]">
            {currentUrl}
          </span>
          <button
            onClick={handleCopy}
            className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copié' : 'Copier'}</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};
