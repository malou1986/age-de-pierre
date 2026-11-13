import React from 'react';
import { GamePhase, PlayerState } from '../types/game';
import { MeepleIcon } from './Meeples';
import { sound } from '../logic/audio';
import { 
  Flame, 
  Smartphone, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Sliders,
  Maximize,
  Minimize
} from 'lucide-react';

interface GameHeaderProps {
  round: number;
  phase: GamePhase;
  activePlayer: PlayerState;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenTutorial: () => void;
  onOpenQR: () => void;
  onNewGame: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  round,
  phase,
  activePlayer,
  soundEnabled,
  onToggleSound,
  onOpenTutorial,
  onOpenQR,
  onNewGame,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const getPhaseName = () => {
    switch (phase) {
      case 'placement':
        return { label: 'Phase 1 : Pose des ouvriers', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'resolution':
        return { label: 'Phase 2 : Résolution des actions', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'feeding':
        return { label: 'Phase 3 : Nourrir la tribu', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
      case 'game_over':
        return { label: 'Fin de partie', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      default:
        return { label: 'En cours', color: 'bg-stone-800 text-stone-300 border-stone-700' };
    }
  };

  const phaseMeta = getPhaseName();

  return (
    <header className="w-full max-w-6xl mx-auto bg-stone-950/95 border-b border-stone-800 px-4 py-3 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 select-none">
      {/* Brand & Round */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl shadow-md border border-amber-500/50">
          <Flame className="w-5 h-5 text-amber-200 animate-pulse" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-black tracking-tight text-amber-200">
            Tribus
          </h1>
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span className="font-bold text-stone-200">Manche {round}</span>
            <span>•</span>
            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${phaseMeta.color}`}>
              {phaseMeta.label}
            </span>
          </div>
        </div>
      </div>

      {/* Active Player Turn Banner */}
      <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 px-3.5 py-1.5 rounded-xl">
        <span className="text-xs text-stone-400">Tour :</span>
        <div className="flex items-center gap-1.5 font-bold text-sm text-stone-100">
          <MeepleIcon color={activePlayer.color} size={20} glow />
          <span className="text-amber-300">{activePlayer.name}</span>
          {activePlayer.isAi && (
            <span className="text-[10px] text-stone-400 bg-stone-800 px-1 py-0.2 rounded font-normal">
              (IA)
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Smartphone QR button */}
        <button
          onClick={onOpenQR}
          title="Jouer sur smartphone via QR Code"
          className="p-2 bg-stone-900 hover:bg-stone-800 text-amber-400 border border-stone-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
        >
          <Smartphone className="w-4 h-4" />
          <span className="hidden sm:inline">Smartphone</span>
        </button>

        {/* Tutorial button */}
        <button
          onClick={onOpenTutorial}
          title="Ouvrir le didacticiel de jeu"
          className="p-2 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
        >
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span className="hidden sm:inline">Tutoriel</span>
        </button>

        {/* Sound toggle button */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Désactiver les sons' : 'Activer les sons'}
          className="p-2 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 rounded-xl transition-colors cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
        </button>

        {/* Fullscreen Landscape toggle button */}
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Quitter le mode plein écran' : 'Plein écran (mode paysage)'}
            className="p-2 bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            {isFullscreen ? <Minimize className="w-4 h-4 text-amber-400" /> : <Maximize className="w-4 h-4 text-amber-400" />}
            <span className="hidden md:inline">{isFullscreen ? 'Réduire' : 'Plein écran'}</span>
          </button>
        )}

        {/* New game button */}
        <button
          onClick={onNewGame}
          title="Nouvelle partie"
          className="p-2 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 rounded-xl transition-colors cursor-pointer"
        >
          <Sliders className="w-4 h-4 text-amber-400" />
        </button>
      </div>
    </header>
  );
};
