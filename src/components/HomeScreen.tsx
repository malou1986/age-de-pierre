import React from 'react';
import { Play, RotateCcw, BookOpen, Volume2, VolumeX, Maximize2, Minimize2, Sparkles, Users, Award, Music, Pause, Sliders, BarChart3 } from 'lucide-react';

interface HomeScreenProps {
  onStartNewGame: () => void;
  onResumeGame?: () => void;
  onOpenTutorial: () => void;
  onOpenStats?: () => void;
  onOpenZoneEditor?: () => void;
  hasActiveGame: boolean;
  savedRound?: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  ambientMusicEnabled?: boolean;
  onToggleAmbientMusic?: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartNewGame,
  onResumeGame,
  onOpenTutorial,
  onOpenStats,
  onOpenZoneEditor,
  hasActiveGame,
  savedRound,
  soundEnabled,
  onToggleSound,
  ambientMusicEnabled = false,
  onToggleAmbientMusic,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 flex flex-col items-center justify-between select-none">
      {/* Background with splash image and atmospheric prehistoric vignette */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url('/splash.jpg')` }}
      >
        {/* Gradients to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-stone-950/80" />
        <div className="absolute inset-0 bg-radial from-transparent via-stone-950/30 to-stone-950/90" />
      </div>

      {/* Top Bar: Controls */}
      <header className="relative z-10 w-full max-w-6xl px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/80 border border-amber-600/30 backdrop-blur-md shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-amber-200">
            Édition Complète Smartphone & Tablette
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Ambient Celtic Music Toggle */}
          {onToggleAmbientMusic && (
            <button
              onClick={onToggleAmbientMusic}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer backdrop-blur-md shadow-md active:scale-95 flex items-center gap-1.5 ${
                ambientMusicEnabled
                  ? 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                  : 'bg-stone-900/80 border-stone-700/80 hover:border-stone-600 text-stone-400'
              }`}
              title={ambientMusicEnabled ? 'Ambiance Celtique : Activée' : 'Ambiance Celtique : Coupée (Facultatif)'}
              aria-label="Toggle Ambient Music"
            >
              <Music className={`w-4 h-4 sm:w-5 sm:h-5 ${ambientMusicEnabled ? 'text-amber-400' : 'text-stone-400'}`} />
              <span className="text-[10px] sm:text-xs font-bold hidden md:inline">
                {ambientMusicEnabled ? 'Celtique ON' : 'Ambiance OFF'}
              </span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 sm:p-2.5 rounded-xl bg-stone-900/80 border border-stone-700/80 hover:border-amber-500 text-stone-200 hover:text-amber-300 transition-all cursor-pointer backdrop-blur-md shadow-md active:scale-95"
            title={soundEnabled ? 'Couper les effets sonores' : 'Activer les effets sonores'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            className="p-2 sm:p-2.5 rounded-xl bg-stone-900/80 border border-stone-700/80 hover:border-amber-500 text-stone-200 hover:text-amber-300 transition-all cursor-pointer backdrop-blur-md shadow-md active:scale-95"
            title="Plein écran (Paysage)"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-stone-200" />}
          </button>
        </div>
      </header>

      {/* Central Hero: Title & Action Buttons */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-2xl my-auto space-y-4 sm:space-y-6">
        
        {/* Title Badge */}
        <div className="space-y-1 sm:space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-widest shadow-inner">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            2 à 4 Joueurs • Humains & Robots IA
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] tracking-tight leading-none uppercase">
            L'Âge de Pierre
          </h1>

          <p className="text-xs sm:text-sm md:text-base font-medium text-stone-300/90 max-w-lg mx-auto drop-shadow-md">
            Guide ta tribu préhistorique, chasse, récolte les ressources et bâtis la plus grande civilisation du Néolithique !
          </p>
        </div>

        {/* Action Buttons Menu */}
        <div className="w-full max-w-xs sm:max-w-sm flex flex-col gap-2.5 sm:gap-3">
          {/* Main Primary Button: Nouvelle Partie / Configurer */}
          <button
            onClick={onStartNewGame}
            className="group relative w-full py-3 sm:py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-black text-sm sm:text-base tracking-wide uppercase transition-all duration-200 transform hover:scale-[1.02] active:scale-95 shadow-[0_0_25px_rgba(245,158,11,0.45)] border-2 border-amber-300 cursor-pointer flex items-center justify-center gap-3"
          >
            <Play className="w-5 h-5 fill-current text-stone-950 transition-transform group-hover:scale-110" />
            <span>Nouvelle Partie</span>
          </button>

          {/* Resume Game Button (if game already started or saved) */}
          {hasActiveGame && onResumeGame && (
            <button
              onClick={onResumeGame}
              className="w-full py-3 sm:py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-stone-900/90 to-emerald-950/90 hover:bg-stone-800 text-emerald-300 font-black text-xs sm:text-sm tracking-wide transition-all border-2 border-emerald-500/60 hover:border-emerald-400 backdrop-blur-md cursor-pointer flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>Reprendre la Partie {savedRound ? `(Manche ${savedRound})` : 'en cours'}</span>
            </button>
          )}

          {/* Rules & Stats Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenTutorial}
              className="py-2.5 px-3 rounded-2xl bg-stone-950/80 hover:bg-stone-900 text-stone-300 hover:text-white font-semibold text-xs tracking-wide transition-all border border-stone-800 hover:border-stone-700 backdrop-blur-md cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400/80" />
              <span>Règles & Aide</span>
            </button>

            {onOpenStats && (
              <button
                onClick={onOpenStats}
                className="py-2.5 px-3 rounded-2xl bg-stone-950/80 hover:bg-stone-900 text-stone-300 hover:text-white font-semibold text-xs tracking-wide transition-all border border-stone-800 hover:border-amber-500/50 backdrop-blur-md cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95"
              >
                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Statistiques</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-4 py-2.5 flex items-center justify-center text-center">
        <p className="text-[10px] sm:text-xs text-stone-500 font-medium">
          D'après le célèbre jeu de Bernd Brunnhofer • Optimisé pour mobiles en mode paysage
        </p>
      </footer>
    </div>
  );
};
