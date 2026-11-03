import React, { useState, useEffect } from 'react';
import { CivilizationCard, PlayerState, ResourceType } from '../../types/game';
import { sound } from '../../logic/audio';
import { Dices, Check, Sparkles, Wrench, ArrowRight } from 'lucide-react';

interface CardDiceRollModalProps {
  card: CivilizationCard;
  player: PlayerState;
  onConfirm: (diceValues: number[], usedTools: number[], tempToolsUsed?: number) => void;
}

const RESOURCE_INFO: Record<ResourceType, { name: string; icon: string; divisor: number; colorText: string; bgBadge: string }> = {
  wood: { name: 'Bois', icon: '🪵', divisor: 3, colorText: 'text-amber-200', bgBadge: 'bg-amber-950/80 border-amber-800' },
  clay: { name: 'Glaise', icon: '🧱', divisor: 4, colorText: 'text-amber-300', bgBadge: 'bg-amber-950/80 border-amber-800' },
  stone: { name: 'Pierre', icon: '🪨', divisor: 5, colorText: 'text-stone-200', bgBadge: 'bg-stone-900 border-stone-700' },
  gold: { name: 'Or', icon: '✨', divisor: 6, colorText: 'text-yellow-300', bgBadge: 'bg-yellow-950/80 border-yellow-600' },
};

// 2D Dice dot positions (percentages)
const DICE_DOTS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]],
};

export const CardDiceRollModal: React.FC<CardDiceRollModalProps> = ({
  card,
  player,
  onConfirm,
}) => {
  const resType = (card.topBonus.resourceType || 'stone') as ResourceType;
  const resInfo = RESOURCE_INFO[resType] || RESOURCE_INFO.stone;

  const [hasRolled, setHasRolled] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [diceValues, setDiceValues] = useState<number[]>([1, 1]);
  const [selectedTools, setSelectedTools] = useState<number[]>([]);
  const [tempToolsCount, setTempToolsCount] = useState<number>(0);
  const maxTempTools = player.temporaryTools || 0;

  // Auto-roll for AI
  useEffect(() => {
    if (player.isAi) {
      const timer = setTimeout(() => {
        handleRoll();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [player.isAi]);

  // Once AI has rolled, auto-confirm
  useEffect(() => {
    if (player.isAi && hasRolled && !isRolling) {
      const timer = setTimeout(() => {
        const diceSum = diceValues.reduce((s, v) => s + v, 0);
        const remainder = diceSum % resInfo.divisor;
        const needed = resInfo.divisor - remainder;
        const aiTools: number[] = [];

        if (needed <= 2) {
          player.toolTiles.forEach((val, idx) => {
            if (!player.toolsUsedThisRound[idx] && val > 0 && aiTools.length === 0 && val >= needed) {
              aiTools.push(idx);
            }
          });
        }
        onConfirm(diceValues, aiTools, 0);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [player.isAi, hasRolled, isRolling, diceValues, resInfo.divisor, player.toolTiles, player.toolsUsedThisRound, onConfirm]);

  const handleRoll = () => {
    setIsRolling(true);
    sound.playDiceRoll();

    let count = 0;
    const interval = setInterval(() => {
      setDiceValues([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
      count++;
      if (count > 9) {
        clearInterval(interval);
        const finalDice = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
        ];
        setDiceValues(finalDice);
        setIsRolling(false);
        setHasRolled(true);
      }
    }, 60);
  };

  const toggleTool = (idx: number) => {
    sound.playTool();
    if (selectedTools.includes(idx)) {
      setSelectedTools(selectedTools.filter(i => i !== idx));
    } else {
      setSelectedTools([...selectedTools, idx]);
    }
  };

  const diceSum = diceValues.reduce((s, v) => s + v, 0);
  const toolBonus = selectedTools.reduce((s, idx) => s + (player.toolTiles[idx] || 0), 0) + tempToolsCount;
  const totalScore = diceSum + toolBonus;
  const yieldCount = Math.floor(totalScore / resInfo.divisor);
  const remainder = totalScore % resInfo.divisor;
  const neededForNext = resInfo.divisor - remainder;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="relative bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-600/80 rounded-2xl max-w-lg landscape:max-w-2xl w-full p-2.5 sm:p-4 landscape:p-2.5 text-stone-100 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-1.5 sm:space-y-3 max-h-[94vh] sm:max-h-[92vh] flex flex-col justify-between overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(ellipse at top center, rgba(180, 83, 9, 0.2), transparent 70%)',
        }}
      >
        {/* Header with Card Preview */}
        <div className="flex items-center gap-2 border-b border-stone-800 pb-1.5 shrink-0">
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt={card.name}
              className="w-8 h-11 sm:w-11 sm:h-14 object-cover rounded-md border border-amber-500/50 shadow-md shrink-0"
            />
          ) : (
            <div className="w-8 h-11 rounded-md bg-stone-900 border border-stone-700 flex items-center justify-center text-base shrink-0">
              📜
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="p-1 bg-amber-500/20 text-amber-400 rounded-md border border-amber-500/40">
                <Dices className="w-3.5 h-3.5 animate-pulse" />
              </span>
              <h3 className="text-xs sm:text-base font-black text-amber-200 truncate">
                {card.name}
              </h3>
            </div>
            <p className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5">
              Bonus spécial : <strong className={resInfo.colorText}>2 dés pour récolter du {resInfo.name}</strong>
            </p>
          </div>

          <div className={`px-2 py-0.5 rounded-lg border text-xs font-black flex items-center gap-1 shadow shrink-0 ${resInfo.bgBadge}`}>
            <span className="text-sm sm:text-base">{resInfo.icon}</span>
            <span className={resInfo.colorText}>÷{resInfo.divisor}</span>
          </div>
        </div>

        {/* Responsive Content: 2-column on landscape / 1-column on portrait */}
        <div className="grid grid-cols-1 landscape:grid-cols-2 md:landscape:grid-cols-2 gap-2 sm:gap-3 items-stretch flex-1 min-h-0 overflow-y-auto pr-0.5">
          {/* Left Column: Dice Rolling Arena */}
          <div className="bg-stone-950/90 rounded-xl p-2 sm:p-3 border border-stone-800 text-center flex flex-col justify-between space-y-1.5">
            <div className="text-[9px] sm:text-[10px] text-stone-400">
              {hasRolled ? 'Résultat des 2 dés :' : 'Lancez les 2 dés :'}
            </div>

            {/* 2 Dice Render */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 min-h-[50px] sm:min-h-[60px]">
              {diceValues.map((val, idx) => (
                <div
                  key={idx}
                  className={`relative w-10 h-10 sm:w-14 sm:h-14 rounded-xl shadow-lg flex items-center justify-center border-2 transition-transform duration-150 ${
                    isRolling
                      ? 'animate-spin border-amber-400 bg-amber-950/80 scale-105'
                      : 'border-red-600/90 bg-gradient-to-br from-red-700 to-red-950 shadow-red-950/60'
                  }`}
                >
                  {/* Dice dots */}
                  <div className="relative w-full h-full p-1 sm:p-1.5">
                    {DICE_DOTS[val]?.map(([x, y], dotIdx) => (
                      <div
                        key={dotIdx}
                        className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.8)] -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${x}%`, top: `${y}%` }}
                      />
                    ))}
                  </div>

                  <span className="absolute -bottom-2 px-1 py-0.2 rounded-full bg-stone-950 text-[8px] sm:text-[9px] font-black text-amber-300 border border-stone-700">
                    Dé {idx + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* Roll Button */}
            {!hasRolled ? (
              <button
                onClick={handleRoll}
                disabled={isRolling}
                className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm transition-transform active:scale-95 disabled:opacity-50 shrink-0"
              >
                <Dices className="w-4 h-4 text-amber-950" />
                <span>{isRolling ? 'Lancement...' : 'Lancer les 2 dés !'}</span>
              </button>
            ) : (
              <div className="py-0.5 sm:py-1 bg-stone-900/90 rounded-lg border border-stone-800">
                <div className="text-[8px] sm:text-[9px] text-stone-400 uppercase font-bold tracking-wider">Total des 2 dés</div>
                <div className="text-lg sm:text-2xl font-black text-amber-400 leading-tight">{diceValues[0]} + {diceValues[1]} = {diceSum}</div>
              </div>
            )}
          </div>

          {/* Right Column: Tools Selector & Harvest Confirmation */}
          <div className="flex flex-col justify-between space-y-1.5 min-h-0">
            {hasRolled ? (
              <>
                {/* Tools Section */}
                <div className="space-y-1 bg-stone-950/70 p-1.5 sm:p-2 rounded-xl border border-stone-800">
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
                      const isUsed = player.toolsUsedThisRound[idx];
                      const isSelected = selectedTools.includes(idx);

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isUsed}
                          onClick={() => toggleTool(idx)}
                          className={`flex-1 py-0.5 sm:py-1 px-1 rounded-lg border font-black text-[10px] sm:text-xs transition-all flex items-center justify-center gap-0.5 sm:gap-1 cursor-pointer ${
                            isUsed
                              ? 'opacity-40 bg-stone-900 border-stone-800 text-stone-600 line-through cursor-not-allowed'
                              : isSelected
                              ? 'bg-blue-600 border-blue-400 text-white shadow-md ring-2 ring-blue-400/50 scale-[1.02]'
                              : 'bg-stone-800 border-stone-700 text-stone-200 hover:border-blue-500/80'
                          }`}
                        >
                          <img
                            src={`/tools/tool_${val}.png`}
                            alt={`Outil +${val}`}
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded object-contain"
                          />
                          <span>+{val}</span>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </button>
                      );
                    })}
                    {player.toolTiles.every(t => t === 0) && (
                      <div className="text-[9px] sm:text-[10px] text-stone-500 italic py-0.5 text-center w-full">
                        Aucun outil disponible.
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
                      Score : ({diceSum}{toolBonus > 0 ? ` + ${toolBonus}` : ''}) ÷ {resInfo.divisor} =
                      <span className="text-sm sm:text-base font-black text-amber-300 ml-1">
                        +{yieldCount}
                      </span>
                      <span className="text-[10px] sm:text-xs text-stone-400 ml-1 font-sans">
                        {resInfo.name}
                      </span>
                    </div>
                    {remainder > 0 && yieldCount < 4 && (
                      <div className="text-[9px] text-amber-400/90 font-medium">
                        Manque <span className="font-bold underline">{neededForNext} pt(s)</span> pour +1 {resInfo.name} !
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirm Harvest Button: Always visible and directly clickable with right thumb */}
                {!player.isAi && (
                  <button
                    onClick={() => onConfirm(diceValues, selectedTools, tempToolsCount)}
                    className="w-full py-2 sm:py-3 px-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-black rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-95 border border-emerald-400/50 text-xs sm:text-sm shrink-0 min-h-[40px]"
                  >
                    <Check className="w-4 h-4 text-stone-950" />
                    <span>Récupérer +{yieldCount} {resInfo.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              <div className="bg-stone-950/60 p-2 sm:p-3 rounded-xl border border-stone-800 text-center flex flex-col justify-center items-center h-full">
                <p className="text-[11px] sm:text-xs text-stone-400 leading-relaxed">
                  Lancez les 2 dés à gauche pour calculer votre gain de {resInfo.name} !
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
