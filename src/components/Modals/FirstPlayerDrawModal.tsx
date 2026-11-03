import React, { useState, useEffect } from 'react';
import { GameState } from '../../types/game';
import { Crown, ArrowRight, Dices } from 'lucide-react';

interface FirstPlayerDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: GameState;
}

const PLAYER_COLORS: Record<string, { bg: string; border: string; text: string; disc: string; ring: string }> = {
  red: { bg: 'bg-red-950/90', border: 'border-red-600', text: 'text-red-300', disc: '#dc2626', ring: 'ring-red-500/50' },
  blue: { bg: 'bg-blue-950/90', border: 'border-blue-600', text: 'text-blue-300', disc: '#2563eb', ring: 'ring-blue-500/50' },
  yellow: { bg: 'bg-amber-950/90', border: 'border-amber-500', text: 'text-amber-300', disc: '#d97706', ring: 'ring-amber-500/50' },
  green: { bg: 'bg-emerald-950/90', border: 'border-emerald-600', text: 'text-emerald-300', disc: '#059669', ring: 'ring-emerald-500/50' },
};

export const FirstPlayerDrawModal: React.FC<FirstPlayerDrawModalProps> = ({
  isOpen,
  onClose,
  state,
}) => {
  const [isSpinning, setIsSpinning] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const targetIndex = state.firstPlayerIndex;
  const startingPlayer = state.players[targetIndex] || state.players[0];

  useEffect(() => {
    if (!isOpen) return;

    setIsSpinning(true);
    let step = 0;
    const totalSteps = 16 + (targetIndex % state.players.length);
    let delay = 60;

    const tick = () => {
      step++;
      setCurrentIndex(step % state.players.length);

      if (step < totalSteps) {
        if (step > totalSteps - 6) {
          delay += 45; // Slow down effect near the end
        }
        setTimeout(tick, delay);
      } else {
        setCurrentIndex(targetIndex);
        setIsSpinning(false);
      }
    };

    const timer = setTimeout(tick, delay);
    return () => clearTimeout(timer);
  }, [isOpen, targetIndex, state.players.length]);

  if (!isOpen) return null;

  const displayPlayer = isSpinning ? state.players[currentIndex] : startingPlayer;
  const pColor = PLAYER_COLORS[displayPlayer.color] || PLAYER_COLORS.red;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-fadeIn overflow-hidden"
      onClick={() => {
        if (!isSpinning) onClose();
      }}
    >
      <div 
        className="relative bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-500/80 rounded-2xl sm:rounded-3xl max-w-md landscape:max-w-2xl w-full p-3 sm:p-5 text-stone-100 shadow-[0_20px_70px_rgba(0,0,0,0.95)] flex flex-col max-h-[96vh] sm:max-h-[92vh] overflow-hidden text-center justify-between"
        onClick={e => e.stopPropagation()}
      >
        {/* Background Decorative Glow */}
        <div 
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none transition-colors duration-300"
          style={{ backgroundColor: pColor.disc }}
        />

        {/* Pinned Header */}
        <div className="shrink-0 flex items-center justify-center gap-2 relative z-10 pb-1 border-b border-stone-800/80">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/20 border border-amber-500/60 flex items-center justify-center">
            <Dices className={`w-4 h-4 sm:w-5 sm:h-5 text-amber-400 ${isSpinning ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-200 leading-tight">
              Tirage au Sort
            </h2>
            <p className="text-[10px] text-stone-400">
              Désignation du Premier Joueur pour la Manche 1
            </p>
          </div>
        </div>

        {/* Scrollable Center Area (Landscape: 2 columns, Portrait: Stacked) */}
        <div className="flex-1 min-h-0 overflow-y-auto py-2 relative z-10 landscape:grid landscape:grid-cols-2 landscape:gap-3 landscape:items-center">
          {/* Animated Player Reveal Box */}
          <div 
            className={`p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 sm:gap-3 shadow-xl ${
              isSpinning 
                ? 'bg-stone-900/90 border-stone-700 scale-98' 
                : `${pColor.bg} ${pColor.border} ring-4 ${pColor.ring} scale-100 animate-bounce-short`
            }`}
          >
            {/* Player Avatar Disc with Crown */}
            <div className="relative">
              <div 
                className="w-14 h-14 sm:w-18 sm:h-18 rounded-full border-3 border-white/90 shadow-2xl flex items-center justify-center text-xl sm:text-2xl font-black text-white transition-transform duration-200"
                style={{ backgroundColor: pColor.disc }}
              >
                {displayPlayer.name.charAt(0)}
              </div>
              {!isSpinning && (
                <div className="absolute -top-2.5 -right-2 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 p-1 rounded-full shadow-lg animate-pulse">
                  <Crown className="w-4 h-4 fill-current" />
                </div>
              )}
            </div>

            {/* Player Name and Tribe Banner */}
            <div>
              <div className={`text-base sm:text-xl font-black ${pColor.text}`}>
                {displayPlayer.name}
              </div>
              <div className="text-[11px] sm:text-xs text-stone-300 font-semibold mt-0.5">
                {isSpinning ? 'Tirage en cours...' : '👑 Premier Joueur de la partie'}
              </div>
            </div>
          </div>

          {/* Explanatory Rules & Compensations summary */}
          {!isSpinning ? (
            <div className="mt-2 landscape:mt-0 space-y-2 text-left bg-stone-950/80 p-2.5 sm:p-3 rounded-2xl border border-stone-800 animate-fadeIn text-xs max-h-48 overflow-y-auto">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Avantage du Premier Joueur :</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-300 leading-relaxed">
                <strong>{startingPlayer.name}</strong> posera ses ouvriers en premier lors de la Manche 1. Le jeton tournera dans le sens horaire à chaque manche.
              </p>

              {/* Turn order & compensations breakdown */}
              {state.variants.startingCompensation && (
                <div className="pt-1.5 border-t border-stone-800 space-y-1">
                  <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Compensations d'équilibre (Variante) :
                  </div>
                  <div className="space-y-1">
                    {state.players.map((p, idx) => {
                      const turnOrder = (idx - targetIndex + state.players.length) % state.players.length;
                      const isStart = turnOrder === 0;

                      let compensationText = 'Pose en 1er';
                      if (turnOrder === 1) compensationText = '+1 Bois immédiat';
                      if (turnOrder === 2) compensationText = state.players.length === 3 ? '+1 Outil' : '+1 Bois & +1 Glaise';
                      if (turnOrder === 3) compensationText = '+1 Outil';

                      return (
                        <div 
                          key={p.id}
                          className={`flex items-center justify-between text-[11px] px-2 py-0.5 rounded-lg ${
                            isStart ? 'bg-amber-500/20 text-amber-200 font-bold border border-amber-500/40' : 'bg-stone-900/60 text-stone-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              p.color === 'red' ? 'bg-red-500' : p.color === 'blue' ? 'bg-blue-500' : p.color === 'yellow' ? 'bg-amber-400' : 'bg-emerald-500'
                            }`} />
                            <span className="truncate">{p.name}</span>
                            {isStart && <span>👑</span>}
                          </div>
                          <span className="text-[10px] font-mono font-semibold text-stone-400 shrink-0 ml-1">
                            {compensationText}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden landscape:flex flex-col items-center justify-center p-4 text-stone-400 text-xs">
              <span className="animate-pulse">Les esprits désignent le chef du premier tour...</span>
            </div>
          )}
        </div>

        {/* Pinned Action Button (Always visible on smartphone in landscape) */}
        <div className="shrink-0 pt-2 border-t border-stone-800/80 relative z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isSpinning}
            className={`w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
              isSpinning
                ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 cursor-pointer active:scale-98 shadow-amber-950/50 ring-2 ring-amber-400/40'
            }`}
          >
            <span>{isSpinning ? 'Tirage en cours...' : 'Commencer la Partie !'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
