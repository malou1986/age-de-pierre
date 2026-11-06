import React from 'react';
import { PlayerState } from '../types/game';
import { ResourceIcon } from './Common/ResourceIcon';
import { Utensils, Wheat, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

interface TribeHungerMeterProps {
  player: PlayerState;
  compact?: boolean;
  className?: string;
}

export const TribeHungerMeter: React.FC<TribeHungerMeterProps> = ({
  player,
  compact = false,
  className = '',
}) => {
  const meeples = player.totalMeeples;
  const agri = player.agriculture;
  const netFoodNeeded = Math.max(0, meeples - agri);
  const currentFood = player.food;
  const deficit = Math.max(0, netFoodNeeded - currentFood);
  const surplus = currentFood - netFoodNeeded;
  const isSecure = surplus >= 0;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors select-none ${
        isSecure 
          ? 'bg-emerald-950/60 border-emerald-700/70 text-emerald-300' 
          : 'bg-red-950/80 border-red-600 text-red-200 animate-pulse'
      } ${className}`}>
        {isSecure ? (
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
        )}
        <div className="flex items-center gap-1.5 leading-none">
          <span>Besoin : {netFoodNeeded}</span>
          <span className="text-stone-500">•</span>
          <span>Stock : {currentFood}</span>
          <span className="text-stone-500">•</span>
          <span className={isSecure ? 'text-emerald-400 font-black' : 'text-red-400 font-black'}>
            {isSecure ? `+${surplus} marge` : `-${deficit} MANQUE !`}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-2xl border-2 transition-all select-none shadow-md ${
      isSecure
        ? 'bg-gradient-to-r from-stone-900/90 via-emerald-950/30 to-stone-900/90 border-emerald-600/60'
        : 'bg-gradient-to-r from-stone-900/90 via-red-950/40 to-stone-900/90 border-red-500 ring-2 ring-red-500/30'
    } ${className}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className={`p-1.5 rounded-lg border ${
            isSecure ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
          }`}>
            <Utensils className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-200">
              Subsistance de la Tribu
            </h4>
            <span className="text-[10px] text-stone-400">
              (1 ration obligatoire par ouvrier à chaque fin de manche)
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className={`inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full border ${
            isSecure 
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
              : 'bg-red-500/20 border-red-500/40 text-red-300 animate-pulse'
          }`}>
            {isSecure ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            <span>{isSecure ? `Nourriture assurée (+${surplus})` : `Alerte Famine (-${deficit})`}</span>
          </span>
        </div>
      </div>

      {/* Grid of calculations */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="bg-stone-950/80 p-1.5 rounded-xl border border-stone-800">
          <span className="text-[10px] text-stone-400 block font-medium">1. Tribu</span>
          <span className="font-bold text-stone-100 text-sm">{meeples} ouvriers</span>
        </div>

        <div className="bg-stone-950/80 p-1.5 rounded-xl border border-stone-800">
          <span className="text-[10px] text-stone-400 block font-medium">2. Champs</span>
          <span className="font-bold text-emerald-400 text-sm">-{agri} blé auto</span>
        </div>

        <div className="bg-stone-950/80 p-1.5 rounded-xl border border-stone-800">
          <span className="text-[10px] text-stone-400 block font-medium">3. Rations nettes</span>
          <span className="font-black text-amber-400 text-sm">{netFoodNeeded}</span>
        </div>

        <div className="bg-stone-950/80 p-1.5 rounded-xl border border-stone-800">
          <span className="text-[10px] text-stone-400 block font-medium">4. Vos réserves</span>
          <span className={`font-black text-sm flex items-center gap-1 ${isSecure ? 'text-emerald-400' : 'text-red-400'}`}>
            <ResourceIcon type="food" size="xs" />
            <span>{currentFood}</span>
          </span>
        </div>
      </div>

      {/* Visual Ration Slots representation */}
      <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-1 text-[11px]">
        <div className="flex flex-wrap items-center gap-1">
          {Array.from({ length: meeples }).map((_, idx) => {
            const isCoveredByAgri = idx < agri;
            const isCoveredByFood = !isCoveredByAgri && (idx - agri < currentFood);
            const isMissing = !isCoveredByAgri && !isCoveredByFood;

            return (
              <span
                key={idx}
                title={isCoveredByAgri ? 'Couvert par agriculture' : isCoveredByFood ? 'Couvert par vos réserves' : 'NON COUVERT - Risque de famine'}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-transform hover:scale-110 ${
                  isCoveredByAgri
                    ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                    : isCoveredByFood
                    ? 'bg-amber-950 border-amber-600 text-amber-300'
                    : 'bg-red-950 border-red-500 text-red-200 animate-pulse'
                }`}
              >
                {isCoveredByAgri ? (
                  <span className="flex items-center gap-0.5"><ResourceIcon type="agriculture" size="xs" /> Blé</span>
                ) : isCoveredByFood ? (
                  <span className="flex items-center gap-0.5"><ResourceIcon type="food" size="xs" /> Réserve</span>
                ) : (
                  '❌ MANQUE'
                )}
              </span>
            );
          })}
        </div>

        {!isSecure && (
          <span className="text-red-300 font-bold text-[11px] animate-pulse">
            Envoyez des chasseurs ou cultivez avant la fin de manche !
          </span>
        )}
      </div>
    </div>
  );
};
