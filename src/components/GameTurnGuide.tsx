import React from 'react';
import { GamePhase, PlayerState, BoardLocationId } from '../types/game';
import { getLocationInfo, getPlayerUnresolvedLocations } from '../logic/gameEngine';
import { MeepleIcon } from './Meeples';
import { TribeHungerMeter } from './TribeHungerMeter';
import { ArrowRight, Bot, CheckCircle2, FastForward, Play, Sparkles, Award } from 'lucide-react';

interface GameTurnGuideProps {
  phase: GamePhase;
  round: number;
  activePlayer: PlayerState;
  state: any;
  onPassPlacement: () => void;
  onResolveNextZone: (locationId: BoardLocationId) => void;
  onOpenSummary?: () => void;
}

export const GameTurnGuide: React.FC<GameTurnGuideProps> = ({
  phase,
  round,
  activePlayer,
  state,
  onPassPlacement,
  onResolveNextZone,
  onOpenSummary,
}) => {
  const unresolved = getPlayerUnresolvedLocations(activePlayer);
  const isHuman = !activePlayer.isAi;

  return (
    <div className="w-full max-w-5xl mx-auto select-none">
      <div className={`p-3 sm:p-4 rounded-2xl border-2 shadow-xl transition-all flex flex-wrap items-center justify-between gap-3 ${
        isHuman
          ? 'bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/40 border-amber-500/80 ring-2 ring-amber-400/20'
          : 'bg-stone-900/90 border-stone-800'
      }`}>
        {/* Left: Active Player & Phase badge */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <MeepleIcon color={activePlayer.color} size={32} glow={isHuman} />
            {activePlayer.isAi && (
              <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5">
                <Bot className="w-3 h-3" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-stone-400">
                Manche {round}
              </span>
              <span className="text-stone-600">•</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                phase === 'placement'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : phase === 'resolution'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {phase === 'placement' ? 'Phase 1 : Pose' : phase === 'resolution' ? 'Phase 2 : Résolution' : 'Phase 3 : Nourriture'}
              </span>
              {onOpenSummary && (
                <button
                  onClick={onOpenSummary}
                  className="text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-950/60 hover:bg-amber-900/80 px-2 py-0.5 rounded-lg border border-amber-600/40 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Consulter le récapitulatif de la manche"
                >
                  <Award className="w-3 h-3" />
                  <span>Bilan Manche</span>
                </button>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-black text-stone-100 flex items-center gap-2 mt-0.5">
              <span>{isHuman ? 'C’est à votre tour !' : `${activePlayer.name} (IA) réfléchit...`}</span>
              {isHuman && <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />}
            </h3>
          </div>
        </div>

        {/* Global Tribe Hunger & Food Requirement Bar */}
        <div className="hidden md:block">
          <TribeHungerMeter player={activePlayer} compact />
        </div>

        {/* Middle / Right: Contextual Instructions & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* PLACEMENT PHASE */}
          {phase === 'placement' && isHuman && (
            <>
              <div className="text-xs text-stone-300 hidden sm:block">
                <span>Ouvriers disponibles : </span>
                <span className="font-bold text-amber-300 text-sm">{activePlayer.availableMeeples}</span>
                <span className="text-stone-400"> / {activePlayer.totalMeeples}</span>
              </div>

              <button
                onClick={onPassPlacement}
                title="Terminer vos poses d'ouvriers pour cette manche si vous ne pouvez ou ne voulez plus poser"
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl border border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow"
              >
                <FastForward className="w-3.5 h-3.5 text-amber-400" />
                <span>Passer la pose</span>
              </button>
            </>
          )}

          {/* RESOLUTION PHASE */}
          {phase === 'resolution' && isHuman && (
            <>
              <div className="text-xs text-stone-300">
                <span className="text-stone-400">À résoudre : </span>
                <span className="font-bold text-emerald-400 text-sm">{unresolved.length}</span>
                <span className="text-stone-400"> zone(s)</span>
              </div>

              {unresolved.length > 0 && (
                <button
                  onClick={() => onResolveNextZone(unresolved[0])}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Résoudre : {getLocationInfo(unresolved[0], state).name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {/* AI Thinking Animation */}
          {!isHuman && (
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 py-1 px-3 bg-stone-950/80 rounded-xl border border-stone-800">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>L'intelligence artificielle joue son coup...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
