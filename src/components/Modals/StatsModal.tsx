import React, { useState } from 'react';
import { 
  Trophy, 
  BarChart3, 
  X, 
  RotateCcw, 
  Award, 
  Calendar, 
  Users, 
  Bot, 
  Sparkles,
  Flame
} from 'lucide-react';
import { getTribeStats, resetTribeStats, TribeGlobalStats } from '../../logic/stats';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<TribeGlobalStats>(() => getTribeStats());
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    const fresh = resetTribeStats();
    setStats(fresh);
    setConfirmReset(false);
  };

  const totalVictories = stats.humanVictories + stats.aiVictories;
  const humanPct = totalVictories > 0 ? Math.round((stats.humanVictories / totalVictories) * 100) : 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        className="relative bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-600/80 rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-5 text-stone-100 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-4 max-h-[94vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-200 leading-tight">
                Statistiques & Records du Clan
              </h3>
              <p className="text-[10px] sm:text-xs text-stone-400">
                Historique de vos parties et hauts faits de tribu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highest Score Hero Banner */}
        {stats.highestScore ? (
          <div className="bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/80 border-2 border-amber-500/60 rounded-2xl p-3 sm:p-4 text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-1 right-2 text-amber-500/10 text-6xl font-black pointer-events-none">
              ★
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                Record Absolu de Points
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-amber-200 tracking-tight my-0.5">
              {stats.highestScore.score} <span className="text-lg sm:text-xl font-bold text-amber-400">PV</span>
            </div>
            <div className="text-xs text-stone-300 flex items-center justify-center gap-2">
              <span className="font-bold text-amber-100">{stats.highestScore.playerName}</span>
              <span className="text-stone-500">•</span>
              <span className="text-stone-400 text-[11px] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-stone-400 inline" />
                {stats.highestScore.date}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-stone-950/60 border border-stone-800 rounded-2xl p-4 text-center text-xs text-stone-400">
            <Sparkles className="w-5 h-5 text-stone-500 mx-auto mb-1.5" />
            Aucun record enregistré pour le moment. Terminez une partie pour inaugurer le tableau des légendes !
          </div>
        )}

        {/* Global Key Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-2.5">
            <div className="text-xl sm:text-2xl font-black text-stone-200">{stats.gamesPlayed}</div>
            <div className="text-[10px] sm:text-xs text-stone-400 font-semibold">Parties Jouées</div>
          </div>
          <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-2.5">
            <div className="text-xl sm:text-2xl font-black text-emerald-400">{stats.humanVictories}</div>
            <div className="text-[10px] sm:text-xs text-stone-400 font-semibold">Victoires Humaines ({humanPct}%)</div>
          </div>
          <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-2.5">
            <div className="text-xl sm:text-2xl font-black text-purple-400">{stats.aiVictories}</div>
            <div className="text-[10px] sm:text-xs text-stone-400 font-semibold">Victoires IA</div>
          </div>
        </div>

        {/* Victories by Color Breakdown */}
        <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3 space-y-2">
          <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Répartition des Victoires par Tribu :</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
            <div className="bg-red-950/50 border border-red-700/60 rounded-lg p-1.5">
              <span className="block text-red-300 font-black text-sm">{stats.victoriesByColor.red}</span>
              <span className="text-[9px] text-red-400 font-semibold">Rouge</span>
            </div>
            <div className="bg-blue-950/50 border border-blue-700/60 rounded-lg p-1.5">
              <span className="block text-blue-300 font-black text-sm">{stats.victoriesByColor.blue}</span>
              <span className="text-[9px] text-blue-400 font-semibold">Bleu</span>
            </div>
            <div className="bg-yellow-950/50 border border-yellow-700/60 rounded-lg p-1.5">
              <span className="block text-yellow-300 font-black text-sm">{stats.victoriesByColor.yellow}</span>
              <span className="text-[9px] text-yellow-400 font-semibold">Jaune</span>
            </div>
            <div className="bg-green-950/50 border border-green-700/60 rounded-lg p-1.5">
              <span className="block text-green-300 font-black text-sm">{stats.victoriesByColor.green}</span>
              <span className="text-[9px] text-green-400 font-semibold">Vert</span>
            </div>
          </div>
        </div>

        {/* Recent Games Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-stone-300">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Dernières Parties ({stats.recentGames?.length || 0}) :</span>
            </span>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1 pr-0.5">
            {stats.recentGames && stats.recentGames.length > 0 ? (
              stats.recentGames.map((g) => (
                <div 
                  key={g.id}
                  className="bg-stone-950/70 border border-stone-800/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs hover:border-stone-700"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-400">{g.date}</span>
                    <span className="font-bold text-stone-200 flex items-center gap-1">
                      {g.isAiWinner ? <Bot className="w-3 h-3 text-purple-400" /> : <Award className="w-3 h-3 text-amber-400" />}
                      {g.winnerName}
                    </span>
                    <span className="text-[10px] text-stone-400">({g.playerCount}J • {g.roundsCount} tours)</span>
                  </div>
                  <div className="font-black text-amber-400">{g.winningScore} PV</div>
                </div>
              ))
            ) : (
              <div className="text-center py-3 text-xs text-stone-400">
                Aucune partie récente enregistrée.
              </div>
            )}
          </div>
        </div>

        {/* Reset stats option */}
        <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs">
          {confirmReset ? (
            <div className="flex items-center gap-2 w-full justify-between">
              <span className="text-[11px] text-red-300 font-medium">Réinitialiser tous les records ?</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-stone-100 font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Confirmer
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg cursor-pointer transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="text-stone-400 hover:text-red-400 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Remettre les statistiques à zéro</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
