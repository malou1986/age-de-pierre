import React, { useState } from 'react';
import { GameState, MammothTile, PlayerState } from '../../types/game';
import { sound } from '../../logic/audio';
import { Trophy, Dices, Flame, Sparkles, X, Check } from 'lucide-react';
import { MeepleIcon } from '../Meeples';

interface MammothContestModalProps {
  state: GameState;
  activeMammoth: MammothTile;
  humanPlayer: PlayerState;
  onResolve: (wagers: Record<string, number>, rolls: Record<string, number[]>) => void;
  onClose: () => void;
}

export const MammothContestModal: React.FC<MammothContestModalProps> = ({
  state,
  activeMammoth,
  humanPlayer,
  onResolve,
  onClose,
}) => {
  // All players participating in the mammoth hunt
  const hunters = state.players.filter(p => (p.placements['mammoth'] || 0) > 0);

  // Human food wager (bait)
  const [humanFoodWager, setHumanFoodWager] = useState<number>(0);

  // Rolling state
  const [hasRolled, setHasRolled] = useState(false);
  const [hunterRolls, setHunterRolls] = useState<Record<string, number[]>>({});
  const [hunterWagers, setHunterWagers] = useState<Record<string, number>>({});

  const handleRollDice = () => {
    sound.playDiceRoll();

    const rolls: Record<string, number[]> = {};
    const wagers: Record<string, number> = {};

    hunters.forEach(h => {
      const meepleCount = h.placements['mammoth'] || 1;
      rolls[h.id] = Array.from({ length: meepleCount }, () => Math.floor(Math.random() * 6) + 1);

      if (h.id === humanPlayer.id) {
        wagers[h.id] = humanFoodWager;
      } else {
        // AI wagers food if safe
        wagers[h.id] = h.food > h.totalMeeples + 2 ? Math.min(2, h.food - h.totalMeeples) : 0;
      }
    });

    setHunterRolls(rolls);
    setHunterWagers(wagers);
    setHasRolled(true);
  };

  // Determine winner after roll
  let winnerId: string | null = null;
  let highestScore = -1;
  if (hasRolled) {
    hunters.forEach(h => {
      const diceSum = (hunterRolls[h.id] || []).reduce((a, b) => a + b, 0);
      const total = diceSum + (hunterWagers[h.id] || 0);
      if (total > highestScore) {
        highestScore = total;
        winnerId = h.id;
      }
    });
  }

  const handleConfirmResult = () => {
    if (hasRolled) {
      onResolve(hunterWagers, hunterRolls);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-stone-900 border-2 border-amber-500 rounded-3xl max-w-xl w-full p-4 sm:p-6 text-stone-100 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-400 flex items-center justify-center text-2xl shadow-lg">
              🦣
            </div>
            <div>
              <h3 className="text-xl font-black text-amber-300">
                La Grande Chasse au Mammouth
              </h3>
              <p className="text-xs text-stone-400">
                Extension « La Harde de Mammouths »
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Active Mammoth Card Banner */}
        <div className="bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/60 border-2 border-amber-500/60 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-900/60 border border-amber-400/80 flex items-center justify-center text-4xl shadow-inner shrink-0">
            🦣
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-base sm:text-lg text-amber-200 truncate">
                {activeMammoth.name}
              </h4>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-400 text-xs font-black px-2 py-0.5 rounded-full shrink-0">
                +{activeMammoth.victoryPoints} VP
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1 leading-relaxed">
              {activeMammoth.description}
            </p>
          </div>
        </div>

        {/* 2. Human Hunter Food Wager / Bait Control */}
        {!hasRolled && (
          <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3 sm:p-4 space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-stone-200">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Pitance & Appât (Nourriture engagée) :</span>
              </span>
              <span className="text-amber-300 font-extrabold text-base">
                +{humanFoodWager} au score
              </span>
            </div>
            <p className="text-[11px] text-stone-400 leading-snug">
              Chaque ration de nourriture dépensée attire la bête et ajoute +1 point à votre score de traque final. (Stock disponible : {humanPlayer.food})
            </p>

            <div className="flex items-center gap-2 pt-1">
              {[0, 1, 2, 3, 4, 5].map(amount => {
                const canWager = humanPlayer.food >= amount;
                return (
                  <button
                    key={amount}
                    type="button"
                    disabled={!canWager}
                    onClick={() => setHumanFoodWager(amount)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-black transition-all ${
                      humanFoodWager === amount
                        ? 'border-orange-400 bg-orange-600 text-white shadow-md ring-2 ring-orange-400'
                        : canWager
                        ? 'border-stone-700 bg-stone-900 text-stone-300 hover:border-orange-500/60'
                        : 'border-stone-850 bg-stone-950/40 text-stone-600 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    {amount === 0 ? 'Aucun' : `+${amount} 🍖`}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Hunters Contenders Tally & Rolls */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider px-1">
            Chasseurs en lice :
          </span>

          <div className="space-y-2">
            {hunters.map(h => {
              const meeples = h.placements['mammoth'] || 1;
              const rolls = hunterRolls[h.id] || [];
              const wager = hunterWagers[h.id] || (h.id === humanPlayer.id ? humanFoodWager : 0);
              const diceSum = rolls.reduce((a, b) => a + b, 0);
              const total = diceSum + wager;
              const isWinner = hasRolled && h.id === winnerId;

              return (
                <div
                  key={h.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    isWinner
                      ? 'bg-amber-950/50 border-amber-400 ring-2 ring-amber-400 shadow-xl'
                      : 'bg-stone-950/70 border-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MeepleIcon color={h.color} size={22} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-stone-100">{h.name}</span>
                        {h.isAi && (
                          <span className="text-[9px] bg-stone-800 text-stone-400 px-1 py-0.2 rounded border border-stone-700">
                            IA
                          </span>
                        )}
                        <span className="text-xs text-amber-300 font-semibold">({meeples} ouvrier{meeples > 1 ? 's' : ''})</span>
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {hasRolled ? (
                          <span>
                            Dés: [{rolls.join(', ')}] = {diceSum} {wager > 0 ? `+ ${wager} vivres` : ''}
                          </span>
                        ) : (
                          <span>En attente de lancer de dés...</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {hasRolled ? (
                      <div>
                        <span className={`text-xl font-black ${isWinner ? 'text-amber-300' : 'text-stone-300'}`}>
                          {total}
                        </span>
                        <span className="text-[10px] text-stone-400 ml-1">pts</span>
                        {isWinner && (
                          <div className="text-[10px] font-black text-amber-400 flex items-center justify-end gap-1">
                            <Trophy className="w-3 h-3" />
                            <span>Vainqueur !</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-stone-500 font-mono">? pts</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {!hasRolled ? (
            <button
              type="button"
              onClick={handleRollDice}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Dices className="w-5 h-5" />
              <span>Lancer les Dés de Chasse !</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmResult}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Check className="w-5 h-5" />
              <span>Réclamer les récompenses & Continuer</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
