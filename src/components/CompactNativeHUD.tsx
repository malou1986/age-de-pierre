import React from 'react';
import { GameState, PlayerState, ResourceType } from '../types/game';
import { Users, Wheat, Hammer, Trophy, Sliders, ArrowRight, Bot, Crown, Sparkles, Check, Dices } from 'lucide-react';
import { ResourceIcon } from './Common/ResourceIcon';

interface CompactNativeHUDProps {
  state: GameState;
  activePlayer: PlayerState;
  onOpenTribesDrawer: () => void;
  onOpenSettings: () => void;
  onOpenFirstPlayerDraw?: () => void;
  onPassPlacement?: () => void;
  onResolveNextZone?: () => void;
  canPassPlacement?: boolean;
  canResolveNextZone?: boolean;
}

const PLAYER_COLORS: Record<string, { bg: string; border: string; text: string; disc: string }> = {
  red: { bg: 'bg-red-950/80', border: 'border-red-600/70', text: 'text-red-300', disc: '#dc2626' },
  blue: { bg: 'bg-blue-950/80', border: 'border-blue-600/70', text: 'text-blue-300', disc: '#2563eb' },
  yellow: { bg: 'bg-amber-950/80', border: 'border-amber-500/70', text: 'text-amber-300', disc: '#d97706' },
  green: { bg: 'bg-emerald-950/80', border: 'border-emerald-600/70', text: 'text-emerald-300', disc: '#059669' },
};

export const CompactNativeHUD: React.FC<CompactNativeHUDProps> = ({
  state,
  activePlayer,
  onOpenTribesDrawer,
  onOpenSettings,
  onOpenFirstPlayerDraw,
  onPassPlacement,
  onResolveNextZone,
  canPassPlacement = false,
  canResolveNextZone = false,
}) => {
  const pColor = PLAYER_COLORS[activePlayer.color] || PLAYER_COLORS.red;
  const isHuman = !activePlayer.isAi;
  const isStartPlayer = state.firstPlayerIndex === state.activePlayerIndex;

  // Net hunger calculation
  const netHunger = Math.max(0, activePlayer.totalMeeples - activePlayer.agriculture);
  const isFoodSafe = activePlayer.food >= netHunger;

  // Phase translation
  const phaseLabel = 
    state.phase === 'placement' ? 'Pose des ouvriers' :
    state.phase === 'resolution' ? 'Résolution des actions' :
    state.phase === 'feeding' ? 'Nourrir la tribu' : 'Fin de partie';

  return (
    <header className="w-full h-10 sm:h-11 bg-stone-950/95 border-b border-amber-900/60 shadow-[0_4px_12px_rgba(0,0,0,0.8)] px-2 sm:px-3 flex items-center justify-between text-xs select-none shrink-0 z-40 backdrop-blur-md">
      {/* --- GAUCHE : JOUEUR ACTIF & INVENTAIRE RAPIDE --- */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
        {/* Avatar Disc + Name */}
        <div 
          onClick={onOpenTribesDrawer}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full border cursor-pointer hover:brightness-125 transition-all shadow-sm ${pColor.bg} ${pColor.border}`}
          title="Cliquer pour ouvrir le coffre de tribu & les scores des rivaux"
        >
          <div 
            onClick={(e) => {
              if (onOpenFirstPlayerDraw) {
                e.stopPropagation();
                onOpenFirstPlayerDraw();
              }
            }}
            className="w-4 h-4 rounded-full border border-white/80 shadow-xs flex items-center justify-center text-[9px] font-black text-white shrink-0 cursor-pointer"
            style={{ backgroundColor: pColor.disc }}
            title={isStartPlayer ? "👑 Premier Joueur (Cliquer pour revoir le tirage au sort)" : activePlayer.name}
          >
            {isStartPlayer ? '👑' : activePlayer.name.charAt(0)}
          </div>
          <span className={`font-black text-[11px] sm:text-xs truncate max-w-[85px] sm:max-w-[120px] ${pColor.text}`}>
            {activePlayer.name}
          </span>
          {activePlayer.isAi && (
            <Bot className="w-3 h-3 text-stone-400 shrink-0" />
          )}
        </div>

        {/* Available Meeples */}
        <div 
          className="flex items-center gap-1 bg-stone-900/90 border border-amber-500/50 px-1.5 sm:px-2 py-1 rounded-xl font-black text-amber-300 text-[10px] sm:text-[11px] shadow-xs"
          title={`Ouvriers prêts : ${activePlayer.availableMeeples} sur ${activePlayer.totalMeeples}`}
        >
          <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{activePlayer.availableMeeples} ouv.</span>
        </div>

        {/* Food & Hunger Status with authentic Food Icon */}
        <div 
          className={`flex items-center gap-1.5 px-2 py-0.5 sm:py-1 rounded-xl text-[10px] sm:text-[11px] font-bold border shadow-xs ${
            isFoodSafe
              ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
              : 'bg-red-950/80 border-red-600 text-red-200 animate-pulse'
          }`}
          title={`Stock de nourriture : ${activePlayer.food} • Besoin net : ${netHunger} (Total ${activePlayer.totalMeeples} ouvriers - Agri ${activePlayer.agriculture})`}
        >
          <ResourceIcon type="food" size="sm" className="w-4.5 h-4.5 sm:w-5 sm:h-5 drop-shadow" />
          <span className="text-xs sm:text-sm font-black text-amber-200">{activePlayer.food}</span>
          <span className="text-stone-500 font-normal">|</span>
          <span className="text-[10px] sm:text-[11px] text-stone-300">Faim: {netHunger}</span>
        </div>

        {/* Resource Inventory: Authentic HD vector icons and LARGER numbers! */}
        <div className="flex items-center gap-2 bg-stone-900/90 px-2 py-0.5 sm:py-1 rounded-xl border border-stone-800 shadow-inner">
          {/* Wood */}
          <div className="flex items-center gap-1" title="Bois">
            <ResourceIcon type="wood" size="sm" className="w-4.5 h-4.5 sm:w-5 sm:h-5 drop-shadow" />
            <span className="text-xs sm:text-sm font-black text-amber-100">{activePlayer.resources.wood}</span>
          </div>

          {/* Clay */}
          <div className="flex items-center gap-1" title="Glaise">
            <ResourceIcon type="clay" size="sm" className="w-4.5 h-4.5 sm:w-5 sm:h-5 drop-shadow" />
            <span className="text-xs sm:text-sm font-black text-amber-100">{activePlayer.resources.clay}</span>
          </div>

          {/* Stone */}
          <div className="flex items-center gap-1" title="Pierre">
            <ResourceIcon type="stone" size="sm" className="w-4.5 h-4.5 sm:w-5 sm:h-5 drop-shadow" />
            <span className="text-xs sm:text-sm font-black text-amber-100">{activePlayer.resources.stone}</span>
          </div>

          {/* Gold */}
          <div className="flex items-center gap-1" title="Or">
            <ResourceIcon type="gold" size="sm" className="w-4.5 h-4.5 sm:w-5 sm:h-5 drop-shadow" />
            <span className="text-xs sm:text-sm font-black text-yellow-300">{activePlayer.resources.gold}</span>
          </div>

          <span className="text-stone-700 hidden sm:inline">•</span>

          {/* Agriculture (visible on sm+) */}
          <div className="hidden sm:flex items-center gap-1" title={`Agriculture : niveau ${activePlayer.agriculture}`}>
            <ResourceIcon type="agriculture" size="sm" className="w-4.5 h-4.5 sm:w-5 sm:h-5 drop-shadow" />
            <span className="text-xs sm:text-sm font-black text-emerald-300">{activePlayer.agriculture}</span>
          </div>

          {/* Tools (visible on sm+) */}
          <div className="hidden sm:flex items-center gap-1" title="Outils totaux">
            <ResourceIcon type="tool" size="sm" className="w-4.5 h-4.5 sm:w-5 sm:h-5 drop-shadow" />
            <span className="text-xs sm:text-sm font-black text-cyan-300">{activePlayer.toolTiles.reduce((a, b) => a + b, 0)}</span>
          </div>

          {/* Buildings (visible on sm+ / landscape) */}
          <div className="hidden sm:flex items-center gap-1" title="Bâtiments construits (multiplicateur Bâtisseurs des cartes civilisation)">
            <ResourceIcon type="building" size="sm" className="w-4.5 h-4.5 sm:w-5 sm:h-5 drop-shadow" />
            <span className="text-xs sm:text-sm font-black text-amber-300">{activePlayer.buildings.length}</span>
          </div>
        </div>
      </div>

      {/* --- CENTRE : MANCHE, PHASE & ACTION CONTEXTUELLE --- */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Round & Phase Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-stone-900/90 border border-stone-800 text-[10px] sm:text-[11px] text-stone-300 shadow-xs">
          <span className="font-black text-amber-400">M{state.round}</span>
          <span className="text-stone-600">•</span>
          <span className="font-semibold text-stone-300">{phaseLabel}</span>
        </div>

        {/* Contextual Action Button (Passer ou Résoudre) */}
        {isHuman && state.phase === 'placement' && canPassPlacement && onPassPlacement && (
          <button
            onClick={onPassPlacement}
            className="px-2.5 sm:px-3 py-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-stone-950 font-black text-[10px] sm:text-xs shadow-[0_2px_8px_rgba(245,158,11,0.4)] transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
            title="Passer son tour de placement"
          >
            <span>Passer</span>
            <ArrowRight className="w-3 h-3 text-stone-950" />
          </button>
        )}

        {isHuman && state.phase === 'resolution' && canResolveNextZone && onResolveNextZone && (
          <button
            onClick={onResolveNextZone}
            className="px-2.5 sm:px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-stone-950 font-black text-[10px] sm:text-xs shadow-[0_2px_10px_rgba(16,185,129,0.5)] transition-transform active:scale-95 cursor-pointer flex items-center gap-1 animate-pulse"
            title="Résoudre automatiquement le prochain lieu occupé"
          >
            <span>Résoudre zone</span>
            <ArrowRight className="w-3 h-3 text-stone-950" />
          </button>
        )}

        {!isHuman && (
          <span className="text-[10px] text-stone-400 italic flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>IA réfléchit...</span>
          </span>
        )}
      </div>

      {/* --- DROITE : BOUTON TRIBUS & BOUTON PARAMÈTRES --- */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Button Tribus (Ouvre le tiroir des tribus, cartes et scores) */}
        <button
          onClick={onOpenTribesDrawer}
          className="px-2 sm:px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 hover:text-white border border-stone-800 hover:border-amber-500/50 flex items-center gap-1.5 font-bold text-[10px] sm:text-xs shadow-xs transition-colors cursor-pointer"
          title="Voir les scores des autres tribus et mon coffre complet"
        >
          <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
          <span>{activePlayer.victoryPoints} PV</span>
          <span className="text-stone-500 font-normal hidden xs:inline">|</span>
          <span className="text-stone-400 hidden xs:inline">Tribus</span>
        </button>

        {/* Button Paramètres / Options */}
        <button
          onClick={onOpenSettings}
          className="p-1 sm:p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-800 hover:border-stone-700 transition-colors cursor-pointer"
          title="Paramètres de jeu (Vue de plateau, Son, Nouvelle partie, Règles)"
        >
          <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </header>
  );
};
