import React from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  BookOpen, 
  Smartphone, 
  Sparkles, 
  Eye, 
  LayoutGrid, 
  History,
  Sliders,
  Crown,
  Music,
  Pause,
  Save
} from 'lucide-react';

interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardView: 'smallworld' | 'virtual' | 'grid';
  onSelectBoardView: (view: 'smallworld' | 'virtual' | 'grid') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  ambientMusicEnabled?: boolean;
  onToggleAmbientMusic?: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onNewGame: () => void;
  onOpenTutorial: () => void;
  onOpenQR: () => void;
  onOpenSummary: () => void;
  onOpenFirstPlayerDraw?: () => void;
  onPauseGame?: () => void;
  onGoHome?: () => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  isOpen,
  onClose,
  boardView,
  onSelectBoardView,
  soundEnabled,
  onToggleSound,
  ambientMusicEnabled = false,
  onToggleAmbientMusic,
  isFullscreen,
  onToggleFullscreen,
  onNewGame,
  onOpenTutorial,
  onOpenQR,
  onOpenSummary,
  onOpenFirstPlayerDraw,
  onPauseGame,
  onGoHome,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        className="relative bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-600/80 rounded-2xl max-w-md w-full p-4 text-stone-100 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/40">
              <Sliders className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-black text-amber-200">
                Options & Paramètres
              </h3>
              <p className="text-[11px] text-stone-400">
                Configuration de l'affichage et du jeu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. CHOIX DE LA MODÉLISATION DU PLATEAU */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Style du Plateau de Jeu
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {/* Small World (Refonte contemporaine épurée) */}
            <button
              onClick={() => {
                onSelectBoardView('smallworld');
                onClose();
              }}
              className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                boardView === 'smallworld'
                  ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-400/40 text-amber-200 shadow-md'
                  : 'bg-stone-900/80 border-stone-800 hover:border-stone-700 text-stone-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-black">Style Small World (Peps & Plein Écran)</div>
                  <div className="text-[10px] text-stone-400">Plateau contemporain vif avec cartes haute visibilité</div>
                </div>
              </div>
              {boardView === 'smallworld' && (
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500 text-stone-950">
                  Actif
                </span>
              )}
            </button>

            {/* Plateau 3D Classique (Michael Menzel authentique) */}
            <button
              onClick={() => {
                onSelectBoardView('virtual');
                onClose();
              }}
              className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                boardView === 'virtual'
                  ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-400/40 text-amber-200 shadow-md'
                  : 'bg-stone-900/80 border-stone-800 hover:border-stone-700 text-stone-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-black">Plateau Classique 3D (Authentique)</div>
                  <div className="text-[10px] text-stone-400">Illustration originale Michael Menzel avec cartes d'époque</div>
                </div>
              </div>
              {boardView === 'virtual' && (
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500 text-stone-950">
                  Actif
                </span>
              )}
            </button>

            {/* Vue Modulaire Synthétique */}
            <button
              onClick={() => {
                onSelectBoardView('grid');
                onClose();
              }}
              className={`p-2 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                boardView === 'grid'
                  ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-400/40 text-amber-200 shadow-md'
                  : 'bg-stone-900/80 border-stone-800 hover:border-stone-700 text-stone-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutGrid className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-black">Vue Modulaire 2D</div>
                  <div className="text-[10px] text-stone-400">Cartes de territoires synthétiques et sobres</div>
                </div>
              </div>
              {boardView === 'grid' && (
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500 text-stone-950">
                  Actif
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 2. CONTRÔLES RAPIDES AUDIO & AFFICHAGE */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Confort de Jeu & Son
          </span>
          <div className="grid grid-cols-2 gap-2">
            {/* Bruitages & Sons tactiles */}
            <button
              onClick={onToggleSound}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs cursor-pointer transition-colors ${
                soundEnabled
                  ? 'bg-stone-900 border-amber-500/60 text-amber-300'
                  : 'bg-stone-900/60 border-stone-800 text-stone-500 line-through'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'Sons : Activés' : 'Sons : Coupés'}</span>
            </button>

            {/* Plein écran */}
            <button
              onClick={() => {
                onToggleFullscreen();
                onClose();
              }}
              className="p-2.5 rounded-xl border border-stone-800 bg-stone-900 hover:border-amber-500/60 hover:text-amber-300 flex items-center justify-center gap-2 font-bold text-xs cursor-pointer transition-colors text-stone-300"
            >
              {isFullscreen ? <Minimize className="w-4 h-4 text-amber-400" /> : <Maximize className="w-4 h-4 text-amber-400" />}
              <span>{isFullscreen ? 'Fenêtré' : 'Plein écran'}</span>
            </button>

            {/* Musique d'ambiance celtique & aventure facultative */}
            {onToggleAmbientMusic && (
              <button
                onClick={onToggleAmbientMusic}
                className={`col-span-2 p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs cursor-pointer transition-all ${
                  ambientMusicEnabled
                    ? 'bg-amber-950/70 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : 'bg-stone-900/70 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <Music className={`w-4 h-4 ${ambientMusicEnabled ? 'text-amber-400 animate-pulse' : 'text-stone-500'}`} />
                <span>
                  {ambientMusicEnabled ? '🎶 Ambiance Celtique & Aventure : Active' : '🎵 Ambiance Celtique : Désactivée (Facultatif)'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* 3. ACTIONS DE PARTIE & SAUVEGARDE */}
        <div className="space-y-1.5 pt-1 border-t border-stone-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Partie, Pause & Sauvegarde
          </span>
          <div className="grid grid-cols-2 gap-2">
            {/* Pause & Sauvegarder */}
            {onPauseGame && (
              <button
                onClick={() => {
                  onClose();
                  onPauseGame();
                }}
                className="col-span-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 text-stone-950 flex items-center justify-center gap-2 text-xs font-black cursor-pointer transition-transform active:scale-98 shadow-md border border-amber-300"
              >
                <Pause className="w-4 h-4 fill-stone-950 text-stone-950" />
                <span>⏸️ Mettre en Pause & Sauvegarder la partie</span>
              </button>
            )}

            {/* Nouvelle Partie */}
            <button
              onClick={() => {
                onClose();
                onNewGame();
              }}
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white flex items-center gap-2 text-xs font-bold cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Nouvelle partie</span>
            </button>

            {/* Règles & Tutoriel */}
            <button
              onClick={() => {
                onClose();
                onOpenTutorial();
              }}
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white flex items-center gap-2 text-xs font-bold cursor-pointer transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Règles du jeu</span>
            </button>

            {/* QR Code Smartphone */}
            <button
              onClick={() => {
                onClose();
                onOpenQR();
              }}
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white flex items-center gap-2 text-xs font-bold cursor-pointer transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Jouer sur mobile</span>
            </button>

            {/* Résumé de manche */}
            <button
              onClick={() => {
                onClose();
                onOpenSummary();
              }}
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white flex items-center gap-2 text-xs font-bold cursor-pointer transition-colors"
            >
              <History className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Bilan manche</span>
            </button>

            {/* Revoir le tirage au sort */}
            {onOpenFirstPlayerDraw && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFirstPlayerDraw();
                }}
                className="col-span-2 p-2 rounded-xl bg-amber-950/40 hover:bg-amber-950/70 border border-amber-600/50 text-amber-200 flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>🎲 Revoir le tirage au sort du Premier Joueur</span>
              </button>
            )}

            {/* Retour Menu / Accueil */}
            {onGoHome && (
              <button
                onClick={() => {
                  onClose();
                  onGoHome();
                }}
                className="col-span-2 p-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-stone-200 flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>🏠 Retour à l'Écran d'Accueil</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
