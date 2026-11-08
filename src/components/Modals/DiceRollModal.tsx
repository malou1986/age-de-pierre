import React, { useState } from 'react';
import { BoardLocationId, PlayerState } from '../../types/game';
import { getLocationInfo } from '../../logic/gameEngine';
import { sound } from '../../logic/audio';
import { LeatherDiceCupRoll } from '../Common/LeatherDiceCupRoll';
import { Dices, Check, ArrowRight, Wrench } from 'lucide-react';

interface DiceRollModalProps {
  locationId: BoardLocationId;
  player: PlayerState;
  state: any;
  onConfirm: (diceValues: number[], usedToolIndices: number[], tempToolsUsed?: number) => void;
  onCancel?: () => void;
}

export const DiceRollModal: React.FC<DiceRollModalProps> = ({
  locationId,
  player,
  state,
  onConfirm,
}) => {
  const meepleCount = player.placements[locationId] || 1;
  const info = getLocationInfo(locationId, state);
  const divisor = info.diceDivisor || 2;

  const [hasRolled, setHasRolled] = useState(false);
  const [diceValues, setDiceValues] = useState<number[]>(() => 
    Array.from({ length: meepleCount }, () => 1)
  );
  const [selectedTools, setSelectedTools] = useState<number[]>([]);
  const [tempToolsCount, setTempToolsCount] = useState<number>(0);
  const maxTempTools = player.temporaryTools || 0;

  // Toggle tool
  const toggleTool = (tileIndex: number) => {
    sound.playTool();
    if (selectedTools.includes(tileIndex)) {
      setSelectedTools(selectedTools.filter(i => i !== tileIndex));
    } else {
      setSelectedTools([...selectedTools, tileIndex]);
    }
  };

  const diceSum = diceValues.reduce((s, v) => s + v, 0);
  const toolBonus = selectedTools.reduce((s, idx) => s + (player.toolTiles[idx] || 0), 0) + tempToolsCount;
  const totalScore = diceSum + toolBonus;
  const harvestYield = Math.floor(totalScore / divisor);
  const remainder = totalScore % divisor;
  const neededForNext = divisor - remainder;

  const handleFinish = () => {
    sound.playHarvest();
    onConfirm(diceValues, selectedTools, tempToolsCount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border-2 border-amber-600/80 rounded-2xl max-w-lg landscape:max-w-2xl w-full p-2.5 sm:p-4 landscape:p-2.5 text-stone-100 shadow-2xl space-y-1.5 sm:space-y-3 max-h-[94vh] sm:max-h-[92vh] flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-1 sm:pb-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 sm:p-1.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              <Dices className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
            </span>
            <div>
              <h3 className="text-xs sm:text-base font-bold text-amber-200 leading-tight">
                {info.name}
              </h3>
              <p className="text-[9px] sm:text-[10px] text-stone-400">
                {meepleCount} ouvrier(s) • Diviseur : <span className="text-amber-400 font-bold">÷{divisor}</span>
              </p>
            </div>
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 bg-stone-800 rounded-full border border-stone-700 text-stone-300">
            {player.name}
          </span>
        </div>

        {/* Responsive Content: 2-column on landscape / 1-column on portrait */}
        <div className="grid grid-cols-1 landscape:grid-cols-2 md:landscape:grid-cols-2 gap-2 sm:gap-3 items-stretch flex-1 min-h-0 overflow-y-auto pr-0.5">
          {/* Left Column: Prehistoric Leather Cup & 3D Wooden Dice Arena */}
          <div className="flex flex-col justify-between h-full">
            <LeatherDiceCupRoll
              diceCount={meepleCount}
              initialValues={diceValues}
              hasRolled={hasRolled}
              onRollComplete={(values) => {
                setDiceValues(values);
                setHasRolled(true);
              }}
              rollButtonLabel={`Secouer & Lancer ${meepleCount} dé${meepleCount > 1 ? 's' : ''} !`}
              className="h-full"
            />
          </div>

          {/* Right Column: Tools Selector & Harvest Confirmation */}
          <div className="flex flex-col justify-between space-y-1.5 min-h-0">
            {hasRolled ? (
              <>
                {/* Tools Section */}
                <div className="space-y-1 bg-stone-950/70 p-1.5 sm:p-2.5 rounded-xl border border-stone-800">
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-stone-400">
                    <span className="flex items-center gap-1 font-medium text-stone-300">
                      <Wrench className="w-3 h-3 text-amber-400" />
                      <span>Outils disponibles :</span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-stone-400">
                      {player.toolTiles.filter((t, i) => t > 0 && !player.toolsUsedThisRound[i]).length} restant(s)
                    </span>
                  </div>

                  {/* Tool tiles buttons */}
                  <div className="flex gap-1 sm:gap-1.5">
                    {player.toolTiles.map((val, idx) => {
                      if (val === 0) return null;
                      const isUsedRound = player.toolsUsedThisRound[idx];
                      const isSelected = selectedTools.includes(idx);

                      return (
                        <button
                          key={idx}
                          disabled={isUsedRound}
                          onClick={() => toggleTool(idx)}
                          className={`flex-1 py-0.5 sm:py-1 px-1 rounded-lg border font-black text-[10px] sm:text-xs transition-all flex items-center justify-center gap-0.5 sm:gap-1 cursor-pointer ${
                            isUsedRound
                              ? 'bg-stone-900 border-stone-800 text-stone-600 opacity-50 grayscale cursor-not-allowed'
                              : isSelected
                              ? 'bg-amber-500 border-amber-300 text-stone-950 shadow-md ring-2 ring-amber-400/60 scale-[1.02]'
                              : 'bg-stone-800 border-stone-700 text-stone-200 hover:border-amber-500/60'
                          }`}
                        >
                          <img
                            src={`/tools/tool_${val}.png`}
                            alt={`Outil +${val}`}
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded object-contain"
                          />
                          <span>+{val}</span>
                          {isSelected && <Check className="w-3 h-3 text-stone-950" />}
                        </button>
                      );
                    })}
                    {player.toolTiles.every(t => t === 0) && (
                      <div className="text-[9px] sm:text-[10px] text-stone-500 italic py-0.5 text-center w-full">
                        Aucun outil permanent en stock.
                      </div>
                    )}
                  </div>

                  {/* Temporary Single-Use Tools Selector */}
                  {maxTempTools > 0 && (
                    <div className="p-1 sm:p-1.5 rounded-lg bg-amber-950/40 border border-amber-500/50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm">📯</span>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-amber-200 truncate">Outils Temporaires (+1/u)</div>
                          <div className="text-[8px] text-stone-400 truncate">{maxTempTools - tempToolsCount} restant(s)</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={tempToolsCount <= 0}
                          onClick={() => setTempToolsCount(prev => Math.max(0, prev - 1))}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-stone-800 text-stone-200 disabled:opacity-30 flex items-center justify-center font-black text-xs hover:bg-stone-700 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono font-black text-amber-300 text-xs px-1">
                          +{tempToolsCount}
                        </span>
                        <button
                          type="button"
                          disabled={tempToolsCount >= maxTempTools}
                          onClick={() => setTempToolsCount(prev => Math.min(maxTempTools, prev + 1))}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-amber-600 text-stone-950 disabled:opacity-30 flex items-center justify-center font-black text-xs hover:bg-amber-500 shadow cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Calculation summary */}
                  <div className="bg-stone-900 border border-stone-800 rounded-lg p-1 text-center">
                    <div className="text-[11px] sm:text-xs font-mono text-stone-300">
                      ({diceSum} dés + {toolBonus} outil{toolBonus > 1 ? 's' : ''}) ÷ {divisor} =
                      <span className="text-sm sm:text-base font-black text-emerald-400 ml-1">
                        +{harvestYield}
                      </span>
                      <span className="text-[10px] sm:text-xs text-stone-400 ml-1 font-sans">
                        {info.resource === 'food' ? 'nourriture' : info.resource}
                      </span>
                    </div>
                    {remainder > 0 && harvestYield < meepleCount * 3 && (
                      <div className="text-[9px] text-amber-400/90 font-medium">
                        Manque <span className="font-bold underline">{neededForNext} pt(s)</span> pour +1 ressource !
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirm Harvest Button: Always visible and directly clickable with right thumb */}
                <button
                  onClick={handleFinish}
                  className="w-full py-2 sm:py-3 px-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-black rounded-xl shadow-[0_4px_16px_rgba(16,185,129,0.5)] border border-emerald-400/50 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 text-xs sm:text-sm shrink-0 min-h-[40px]"
                >
                  <span>Récupérer ma récolte (+{harvestYield})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="bg-stone-950/60 p-2 sm:p-3 rounded-xl border border-stone-800 text-center flex flex-col justify-center items-center h-full">
                <p className="text-[11px] sm:text-xs text-stone-400 leading-relaxed">
                  Lancez les dés à gauche pour calculer votre récolte et mobiliser vos outils !
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
