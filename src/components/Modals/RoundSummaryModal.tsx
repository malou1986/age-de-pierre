import React from 'react';
import { GameState, PlayerState, ResourceType } from '../../types/game';
import { RESOURCE_NAMES } from '../../data/buildings';
import { MeepleIcon } from '../Meeples';
import { ResourceIcon } from '../Common/ResourceIcon';
import { 
  Crown, 
  Sparkles, 
  Wheat, 
  Wrench, 
  Scroll, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Award
} from 'lucide-react';

interface RoundSummaryModalProps {
  state: GameState;
  onNextRound: () => void;
  onClose?: () => void;
}

export const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({
  state,
  onNextRound,
  onClose,
}) => {
  const round = state.round;
  // Extract log entries from current round
  const roundLogs = state.log.filter(entry => entry.round === round);

  // Sort players by VP descending for the leaderboard
  const sortedPlayers = [...state.players].sort((a, b) => b.victoryPoints - a.victoryPoints);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="bg-stone-900 border-2 border-amber-600/80 rounded-2xl sm:rounded-3xl max-w-2xl landscape:max-w-3xl w-full p-3 sm:p-5 landscape:p-3 text-stone-100 shadow-2xl flex flex-col justify-between max-h-[96vh] sm:max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/50 pb-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 sm:p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-200">
                Bilan de la Manche {round}
              </h3>
              <p className="text-[10px] text-stone-400">
                Récapitulatif des récoltes, constructions et scores
              </p>
            </div>
          </div>

          <span className="bg-amber-500/20 text-amber-300 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-500/30">
            Fin Manche {round}
          </span>
        </div>

        {/* Players Round Recap Cards */}
        <div className="flex-1 min-h-0 overflow-y-auto py-2 grid grid-cols-1 sm:grid-cols-2 landscape:grid-cols-2 gap-2 sm:gap-2.5 pr-1">
          {sortedPlayers.map((player, idx) => {
            const isFirst = state.firstPlayerIndex === state.players.findIndex(p => p.id === player.id);
            const totalTools = player.toolTiles.reduce((s, t) => s + t, 0);

            // Filter actions for this player in this round
            const playerLogs = roundLogs.filter(l => l.playerId === player.id);

            return (
              <div
                key={player.id}
                className="rounded-2xl bg-stone-950/80 border border-stone-800 p-3.5 flex flex-col justify-between space-y-2.5"
              >
                {/* Header row: avatar, name, rank, VP */}
                <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <MeepleIcon color={player.color} size={22} />
                    <span className="font-bold text-sm text-stone-200">{player.name}</span>
                    {player.isAi && (
                      <span className="text-[10px] bg-stone-800 text-stone-400 px-1.5 py-0.2 rounded font-mono">
                        IA
                      </span>
                    )}
                    {isFirst && (
                      <span title="Premier Joueur" className="text-amber-400">
                        <Crown className="w-3.5 h-3.5 fill-current inline" />
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black bg-amber-500/15 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    {player.victoryPoints} VP (#{idx + 1})
                  </span>
                </div>

                {/* Tribe Status & Assets */}
                <div className="grid grid-cols-4 gap-1.5 text-center text-[11px]">
                  <div className="bg-stone-900/90 p-1 rounded-lg border border-stone-800">
                    <span className="text-stone-400 block text-[9px]">Ouvriers</span>
                    <span className="font-bold text-stone-200">{player.totalMeeples}</span>
                  </div>
                  <div className="bg-stone-900/90 p-1 rounded-lg border border-stone-800">
                    <span className="text-stone-400 block text-[9px]">Nourriture</span>
                    <span className="font-bold text-amber-400 inline-flex items-center gap-1">
                      <ResourceIcon type="food" size="xs" />
                      <span>{player.food}</span>
                    </span>
                  </div>
                  <div className="bg-stone-900/90 p-1 rounded-lg border border-stone-800">
                    <span className="text-stone-400 block text-[9px]">Champs</span>
                    <span className="font-bold text-emerald-400 inline-flex items-center gap-1">
                      <ResourceIcon type="agriculture" size="xs" />
                      <span>{player.agriculture}</span>
                    </span>
                  </div>
                  <div className="bg-stone-900/90 p-1 rounded-lg border border-stone-800">
                    <span className="text-stone-400 block text-[9px]">Outils</span>
                    <span className="font-bold text-blue-400 inline-flex items-center gap-1">
                      <ResourceIcon type="tool" size="xs" />
                      <span>+{totalTools}</span>
                    </span>
                  </div>
                </div>

                {/* Resources Inventory */}
                <div className="flex items-center justify-around bg-stone-900/50 p-1.5 rounded-xl border border-stone-800/80 text-xs">
                  <span title="Bois" className="inline-flex items-center gap-1">
                    <ResourceIcon type="wood" size="xs" />
                    <span>{player.resources.wood}</span>
                  </span>
                  <span title="Glaise" className="inline-flex items-center gap-1">
                    <ResourceIcon type="clay" size="xs" />
                    <span>{player.resources.clay}</span>
                  </span>
                  <span title="Pierre" className="inline-flex items-center gap-1">
                    <ResourceIcon type="stone" size="xs" />
                    <span>{player.resources.stone}</span>
                  </span>
                  <span title="Or" className="inline-flex items-center gap-1">
                    <ResourceIcon type="gold" size="xs" />
                    <span>{player.resources.gold}</span>
                  </span>
                </div>

                {/* Recent actions in round */}
                {playerLogs.length > 0 && (
                  <div className="text-[10px] text-stone-400 bg-stone-900/30 p-1.5 rounded-lg border border-stone-800/50 space-y-0.5">
                    {playerLogs.slice(-2).map((l, i) => (
                      <p key={i} className="truncate">• {l.text}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer actions (Pinned) */}
        <div className="shrink-0 flex items-center justify-between border-t border-stone-800 pt-2.5 mt-1">
          <span className="text-xs text-stone-400">
            Prêt pour la manche {round + 1} ? Le pion Premier Joueur va tourner.
          </span>
          <button
            onClick={onNextRound}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-sm flex items-center gap-2 hover:from-amber-400 hover:to-amber-500 shadow-xl shadow-amber-500/20 cursor-pointer transition-all transform hover:scale-105"
          >
            <span>Lancer la Manche {round + 1}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
