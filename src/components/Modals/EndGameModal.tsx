import React, { useEffect } from 'react';
import { GameState } from '../../types/game';
import { rankPlayers } from '../../logic/scoring';
import confetti from 'canvas-confetti';
import { Trophy, Award, RefreshCw, Sparkles } from 'lucide-react';
import { MeepleIcon } from '../Meeples';
import { ResourceIcon } from '../Common/ResourceIcon';

interface EndGameModalProps {
  state: GameState;
  onRestart: () => void;
  onNewGame: () => void;
}

export const EndGameModal: React.FC<EndGameModalProps> = ({
  state,
  onRestart,
  onNewGame,
}) => {
  const rankedScores = rankPlayers(state.players);
  const winner = rankedScores[0];

  useEffect(() => {
    // Launch celebratory confetti!
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore if canvas-confetti fails
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-stone-900 border-2 border-amber-500 rounded-3xl max-w-2xl w-full p-6 text-stone-100 shadow-2xl space-y-6 my-auto">
        {/* Header / Winner Trophy */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-amber-500/20 rounded-full border border-amber-500/40 text-amber-400 mb-1">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-3xl font-black text-amber-300">
            Fin de Partie !
          </h2>
          <p className="text-sm text-stone-300">
            {state.endGameReason || 'La condition de fin a été atteinte.'}
          </p>
          <div className="text-lg font-bold text-emerald-400 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Victoire de {winner.name} avec {winner.totalScore} Points !</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        {/* Podium / Score Breakdown Table */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider font-bold text-stone-400 px-1">
            Détail des scores finaux :
          </h4>

          <div className="space-y-2.5">
            {rankedScores.map((score, idx) => (
              <div
                key={score.playerId}
                className={`p-4 rounded-2xl border transition-all ${
                  idx === 0
                    ? 'bg-amber-950/40 border-amber-500/80 ring-1 ring-amber-400/30'
                    : 'bg-stone-950 border-stone-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-sm ${
                      idx === 0 ? 'bg-amber-400 text-stone-950' : 'bg-stone-800 text-stone-300'
                    }`}>
                      #{score.rank}
                    </span>
                    <MeepleIcon color={score.color} size={24} />
                    <span className="font-bold text-stone-100 text-base">{score.name}</span>
                    {score.isAi && (
                      <span className="text-[10px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded border border-stone-700">
                        IA
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-400">{score.totalScore}</span>
                    <span className="text-xs text-stone-400 ml-1 font-semibold">VP</span>
                  </div>
                </div>

                {/* Score composition items */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs bg-stone-900/80 p-2.5 rounded-xl border border-stone-800 text-stone-300">
                  <div>
                    <span className="text-stone-400 text-[10px] block">Bâtiments & Jeu :</span>
                    <strong className="text-stone-200">{score.boardPoints} pts</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] block">Séries Vertes (K²) :</span>
                    <strong className="text-emerald-400">{score.greenCardPoints} pts</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] block">Chamans (x Pop) :</span>
                    <strong className="text-amber-300">{score.shamanPoints} pts</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] block">Fermiers (x Agri) :</span>
                    <strong className="text-amber-300">{score.farmerPoints} pts</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] block">Artisans (x Outils) :</span>
                    <strong className="text-amber-300">{score.toolMakerPoints} pts</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] flex items-center gap-1">
                      <ResourceIcon type="building" size="xs" />
                      <span>Bâtisseurs (x Huttes) :</span>
                    </span>
                    <strong className="text-amber-300">{score.builderPoints} pts</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onRestart}
            className="flex-1 py-3.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Rejouer (Mêmes règles)</span>
          </button>
          <button
            onClick={onNewGame}
            className="flex-1 py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Award className="w-5 h-5" />
            <span>Nouvelle Partie</span>
          </button>
        </div>
      </div>
    </div>
  );
};
