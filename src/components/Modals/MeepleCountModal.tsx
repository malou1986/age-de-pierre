import React, { useState } from 'react';
import { BoardLocationId, PlayerState } from '../../types/game';
import { getLocationInfo, getZoneTotalMeeples } from '../../logic/gameEngine';
import { MeepleIcon } from '../Meeples';
import { sound } from '../../logic/audio';
import { Users, Plus, Minus, Check, X } from 'lucide-react';

interface MeepleCountModalProps {
  locationId: BoardLocationId;
  player: PlayerState;
  state: any;
  onConfirm: (count: number) => void;
  onCancel: () => void;
}

export const MeepleCountModal: React.FC<MeepleCountModalProps> = ({
  locationId,
  player,
  state,
  onConfirm,
  onCancel,
}) => {
  const info = getLocationInfo(locationId, state);
  const zoneTotal = getZoneTotalMeeples(state, locationId);
  const maxZoneCapacity = info.maxTotal || 7;
  const remainingZoneSpace = maxZoneCapacity - zoneTotal;

  const maxPlaceable = Math.min(player.availableMeeples, remainingZoneSpace);
  const [count, setCount] = useState<number>(Math.min(maxPlaceable, 2));

  const handleIncrement = () => {
    if (count < maxPlaceable) {
      setCount(count + 1);
      sound.playTool();
    }
  };

  const handleDecrement = () => {
    if (count > 1) {
      setCount(count - 1);
      sound.playTool();
    }
  };

  const handleConfirm = () => {
    sound.playMeeplePlace();
    onConfirm(count);
  };

  // Expected yield estimation
  const expectedSum = count * 3.5;
  const divisor = info.diceDivisor || 2;
  const expectedYield = Math.floor(expectedSum / divisor);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-stone-900 border-2 border-amber-600/80 rounded-2xl max-w-sm w-full p-3 sm:p-5 landscape:p-3 text-stone-100 shadow-2xl space-y-2.5 sm:space-y-4 my-auto max-h-[96dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-amber-200">
                {info.name}
              </h3>
              <p className="text-xs text-stone-400">
                Place(s) disponible(s) : {remainingZoneSpace}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Picker */}
        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center space-y-3">
          <div className="text-xs text-stone-400">Combien d'ouvriers poser ?</div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleDecrement}
              disabled={count <= 1}
              className="w-10 h-10 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-stone-200 rounded-xl flex items-center justify-center font-bold text-lg cursor-pointer transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <MeepleIcon color={player.color} size={38} />
              <span className="text-3xl font-black text-amber-400 w-10 text-center">{count}</span>
            </div>

            <button
              onClick={handleIncrement}
              disabled={count >= maxPlaceable}
              className="w-10 h-10 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-stone-200 rounded-xl flex items-center justify-center font-bold text-lg cursor-pointer transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-center gap-2 pt-1">
            {[1, 2, 3, maxPlaceable].map((n, i) => {
              if (n > maxPlaceable || (i === 3 && n <= 3)) return null;
              return (
                <button
                  key={i}
                  onClick={() => setCount(n)}
                  className={`px-3 py-1 text-xs rounded-lg border font-bold cursor-pointer transition-colors ${
                    count === n
                      ? 'bg-amber-500 border-amber-300 text-stone-950'
                      : 'bg-stone-900 border-stone-700 text-stone-300 hover:border-amber-400'
                  }`}
                >
                  {i === 3 ? `Max (${n})` : n}
                </button>
              );
            })}
          </div>

          {/* Estimation */}
          <div className="text-[11px] text-stone-400 pt-1">
            Espérance moyenne : <span className="text-emerald-400 font-bold">~{expectedYield}</span> ressource(s) aux dés
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 text-sm cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Poser ({count})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
