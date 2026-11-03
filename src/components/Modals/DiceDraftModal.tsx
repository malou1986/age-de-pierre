import React, { useState, useEffect } from 'react';
import { CivilizationCard, PlayerState, ResourceType } from '../../types/game';
import { sound } from '../../logic/audio';
import { Dices, Check, Sparkles, User, Bot, ArrowRight } from 'lucide-react';

export interface DiceDraftReward {
  dieValue: number;
  type: 'resource' | 'tool' | 'agriculture';
  resource?: ResourceType;
  label: string;
  icon: string;
}

export const DICE_REWARDS_MAP: Record<number, DiceDraftReward> = {
  1: { dieValue: 1, type: 'resource', resource: 'wood', label: '1 Bois', icon: '🪵' },
  2: { dieValue: 2, type: 'resource', resource: 'clay', label: '1 Glaise', icon: '🧱' },
  3: { dieValue: 3, type: 'resource', resource: 'stone', label: '1 Pierre', icon: '🪨' },
  4: { dieValue: 4, type: 'resource', resource: 'gold', label: '1 Or', icon: '✨' },
  5: { dieValue: 5, type: 'tool', label: '+1 Outil', icon: '🔨' },
  6: { dieValue: 6, type: 'agriculture', label: '+1 Agriculture', icon: '🌾' },
};

export interface DraftSelection {
  playerId: string;
  playerName: string;
  playerColor: string;
  dieIndex: number;
  reward: DiceDraftReward;
}

interface DiceDraftModalProps {
  card: CivilizationCard;
  buyerPlayer: PlayerState;
  allPlayers: PlayerState[];
  onComplete: (selections: DraftSelection[]) => void;
}

// Visual dice faces rendering
const DICE_DOT_LAYOUTS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]],
};

export const DiceDraftModal: React.FC<DiceDraftModalProps> = ({
  card,
  buyerPlayer,
  allPlayers,
  onComplete,
}) => {
  const playerCount = allPlayers.length;
  const buyerIndex = allPlayers.findIndex(p => p.id === buyerPlayer.id);

  // Turn draft order starting from buyer, then clockwise
  const draftOrder = React.useMemo(() => {
    const order: number[] = [];
    for (let i = 0; i < playerCount; i++) {
      order.push((buyerIndex + i) % playerCount);
    }
    return order;
  }, [buyerIndex, playerCount]);

  const [hasRolled, setHasRolled] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [diceValues, setDiceValues] = useState<number[]>(() =>
    Array.from({ length: playerCount }, () => Math.floor(Math.random() * 6) + 1)
  );

  // Turn in draft order (0 to playerCount - 1)
  const [draftStep, setDraftStep] = useState(0);
  const [selections, setSelections] = useState<DraftSelection[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentPickerIndex = draftOrder[draftStep];
  const currentPicker = allPlayers[currentPickerIndex];

  // Function to roll the dice
  const handleRollDice = () => {
    setIsRolling(true);
    sound.playDiceRoll();

    let count = 0;
    const interval = setInterval(() => {
      setDiceValues(Array.from({ length: playerCount }, () => Math.floor(Math.random() * 6) + 1));
      count++;
      if (count > 9) {
        clearInterval(interval);
        const finalValues = Array.from({ length: playerCount }, () => Math.floor(Math.random() * 6) + 1);
        setDiceValues(finalValues);
        setIsRolling(false);
        setHasRolled(true);
      }
    }, 70);
  };

  // If buyer is AI, trigger automatic roll after 500ms
  useEffect(() => {
    if (!hasRolled && !isRolling && buyerPlayer.isAi) {
      const timer = setTimeout(() => {
        handleRollDice();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasRolled, isRolling, buyerPlayer.isAi]);

  // AI draft decision logic
  useEffect(() => {
    if (!hasRolled || isRolling || isFinished) return;
    if (!currentPicker) return;

    if (currentPicker.isAi) {
      // AI evaluates and picks an unchosen die after 800ms
      const timer = setTimeout(() => {
        const takenIndices = selections.map(s => s.dieIndex);
        const availableIndices = diceValues
          .map((v, idx) => ({ value: v, idx }))
          .filter(item => !takenIndices.includes(item.idx));

        if (availableIndices.length === 0) return;

        // Priority: 4 (Gold) > 5 (Tool) > 6 (Agri) > 3 (Stone) > 2 (Clay) > 1 (Wood)
        const scoreDie = (val: number) => {
          if (val === 4) return 100; // Gold
          if (val === 5 && currentPicker.toolTiles.reduce((a, b) => a + b, 0) < 12) return 90; // Tool
          if (val === 6 && currentPicker.agriculture < 10) return 85; // Agri
          if (val === 3) return 70; // Stone
          if (val === 2) return 55; // Clay
          if (val === 1) return 40; // Wood
          return 30;
        };

        availableIndices.sort((a, b) => scoreDie(b.value) - scoreDie(a.value));
        const chosen = availableIndices[0];

        selectDieForCurrentPlayer(chosen.idx, chosen.value);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [hasRolled, isRolling, draftStep, isFinished, selections]);

  // Apply a selection for current picker
  const selectDieForCurrentPlayer = (dieIndex: number, dieValue: number) => {
    if (!currentPicker) return;
    sound.playHarvest();

    const reward = DICE_REWARDS_MAP[dieValue];
    const newSelection: DraftSelection = {
      playerId: currentPicker.id,
      playerName: currentPicker.name,
      playerColor: currentPicker.color,
      dieIndex,
      reward,
    };

    const nextSelections = [...selections, newSelection];
    setSelections(nextSelections);

    if (draftStep + 1 >= playerCount) {
      // All players have drafted!
      setIsFinished(true);
      // Wait 1.8s then complete
      setTimeout(() => {
        onComplete(nextSelections);
      }, 1800);
    } else {
      setDraftStep(prev => prev + 1);
    }
  };

  const takenDieIndices = selections.map(s => s.dieIndex);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-stone-900 border-2 border-purple-500/80 rounded-3xl max-w-2xl w-full p-6 text-stone-100 shadow-2xl space-y-6 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-500/30">
              <Dices className="w-7 h-7 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-purple-200">
                  Tirage de Dés Spécial : {card.name}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700">
                  Pour tous les joueurs
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Achetée par <strong className="text-purple-300">{buyerPlayer.name}</strong> • {playerCount} dé(s) lancé(s) • Choix dans l’ordre du tour
              </p>
            </div>
          </div>
        </div>

        {/* Reward Legend Table */}
        <div className="bg-stone-950/70 border border-stone-800/80 rounded-2xl p-3">
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Table des récompenses de l’Âge de Pierre :</span>
            <span className="text-stone-500 text-[10px] font-normal">1 dé par participant</span>
          </div>
          <div className="grid grid-cols-6 gap-1.5 text-center">
            {[1, 2, 3, 4, 5, 6].map(val => {
              const r = DICE_REWARDS_MAP[val];
              return (
                <div
                  key={val}
                  className="bg-stone-900/90 border border-stone-800 rounded-xl p-1.5 flex flex-col items-center justify-center gap-0.5"
                >
                  <div className="w-5 h-5 bg-amber-100 text-stone-900 rounded font-black text-xs flex items-center justify-center shadow">
                    {val}
                  </div>
                  <span className="text-base leading-none mt-1">{r.icon}</span>
                  <span className="text-[10px] font-semibold text-stone-300 leading-tight">{r.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dice Rolling & Selection Area */}
        <div className="bg-stone-950/90 border border-purple-900/40 rounded-2xl p-6 text-center space-y-5">
          {!hasRolled ? (
            <div className="space-y-4 py-4">
              <p className="text-sm text-stone-300">
                {buyerPlayer.isAi
                  ? `L'IA ${buyerPlayer.name} prépare le lancer des ${playerCount} dés...`
                  : `Lancez les ${playerCount} dés pour révéler les récompenses disponibles !`}
              </p>
              {!buyerPlayer.isAi && (
                <button
                  onClick={handleRollDice}
                  disabled={isRolling}
                  className="px-8 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-base rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-2"
                >
                  <Dices className="w-5 h-5 animate-spin" />
                  {isRolling ? 'Lancement en cours...' : `Lancer les ${playerCount} dés !`}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Turn indicator */}
              {!isFinished && currentPicker && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-sm font-bold ${
                    !currentPicker.isAi
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 animate-pulse'
                      : 'bg-stone-900 border-stone-700 text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {currentPicker.isAi ? (
                      <Bot className="w-5 h-5 text-purple-400" />
                    ) : (
                      <User className="w-5 h-5 text-amber-400" />
                    )}
                    <span>
                      {!currentPicker.isAi
                        ? `À votre tour, ${currentPicker.name} ! Cliquez sur un dé pour le choisir :`
                        : `L'IA ${currentPicker.name} choisit son bonus...`}
                    </span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-stone-950 font-mono text-stone-400 border border-stone-800">
                    Tour {draftStep + 1} / {playerCount}
                  </span>
                </div>
              )}

              {/* The Rolled Dice Display */}
              <div className="flex flex-wrap items-center justify-center gap-4 py-2">
                {diceValues.map((val, idx) => {
                  const reward = DICE_REWARDS_MAP[val];
                  const isTaken = takenDieIndices.includes(idx);
                  const selection = selections.find(s => s.dieIndex === idx);
                  const canPick = !isTaken && !isFinished && currentPicker && !currentPicker.isAi;

                  return (
                    <div
                      key={idx}
                      onClick={() => canPick && selectDieForCurrentPlayer(idx, val)}
                      className={`relative flex flex-col items-center justify-between p-3.5 rounded-2xl border-2 transition-all duration-200 select-none ${
                        isTaken
                          ? 'bg-stone-950/60 border-stone-800 opacity-60 scale-95'
                          : canPick
                          ? 'bg-gradient-to-b from-stone-800 to-stone-900 border-amber-400 shadow-lg hover:border-amber-300 hover:scale-105 cursor-pointer ring-2 ring-amber-400/30 ring-offset-2 ring-offset-stone-950'
                          : 'bg-stone-900 border-stone-700 opacity-90'
                      }`}
                      style={{ width: '115px', height: '145px' }}
                    >
                      {/* Die Graphic */}
                      <div className="relative w-14 h-14 bg-gradient-to-br from-amber-50 to-amber-200 rounded-xl border border-amber-300 shadow-md flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-11 h-11">
                          {(DICE_DOT_LAYOUTS[val] || []).map(([cx, cy], dotIdx) => (
                            <circle
                              key={dotIdx}
                              cx={cx}
                              cy={cy}
                              r={10}
                              fill="#1c1917"
                            />
                          ))}
                        </svg>
                      </div>

                      {/* Reward info */}
                      <div className="text-center mt-2">
                        <div className="text-xl leading-none">{reward.icon}</div>
                        <div className="text-xs font-bold text-amber-200 mt-1 leading-tight">
                          {reward.label}
                        </div>
                      </div>

                      {/* Taken indicator badge */}
                      {isTaken && selection && (
                        <div className="absolute inset-0 bg-black/75 rounded-2xl backdrop-blur-xs flex flex-col items-center justify-center p-2 text-center">
                          <Check className="w-5 h-5 text-emerald-400 mb-1" />
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white shadow truncate max-w-[100px]"
                            style={{
                              backgroundColor:
                                selection.playerColor === 'red'
                                  ? '#dc2626'
                                  : selection.playerColor === 'blue'
                                  ? '#2563eb'
                                  : selection.playerColor === 'yellow'
                                  ? '#d97706'
                                  : '#16a34a',
                            }}
                          >
                            {selection.playerName}
                          </span>
                        </div>
                      )}

                      {/* Click helper for human */}
                      {canPick && (
                        <span className="text-[10px] uppercase font-black tracking-wider text-amber-300 animate-pulse mt-1">
                          Choisir
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Finished Summary */}
              {isFinished && (
                <div className="bg-emerald-950/60 border border-emerald-600/80 rounded-2xl p-4 text-center space-y-3 animate-fade-in">
                  <div className="flex items-center justify-center gap-2 text-emerald-300 font-bold text-base">
                    <Sparkles className="w-5 h-5" />
                    <span>Tous les joueurs ont choisi leur bonus !</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {selections.map((sel, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-stone-900 border border-stone-700 text-stone-200"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              sel.playerColor === 'red'
                                ? '#ef4444'
                                : sel.playerColor === 'blue'
                                ? '#3b82f6'
                                : sel.playerColor === 'yellow'
                                ? '#eab308'
                                : '#22c55e',
                          }}
                        />
                        <span>{sel.playerName} :</span>
                        <span className="text-amber-300">
                          {sel.reward.icon} {sel.reward.label}
                        </span>
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => onComplete(selections)}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow transition-transform active:scale-95 inline-flex items-center gap-1.5 mt-2"
                  >
                    <span>Continuer la partie</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
