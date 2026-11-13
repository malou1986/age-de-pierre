import React, { useEffect } from 'react';
import { GameState, PlayerState, ResourceType, GreenCultureSymbol } from '../../types/game';
import { ResourceIcon } from '../Common/ResourceIcon';
import { CultureIcon } from '../Common/CultureIcon';
import { GameLog } from '../GameLog';
import { 
  Users, 
  Wheat, 
  Hammer, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Trophy, 
  Shield, 
  Crown, 
  Bot, 
  User, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  X,
  Scroll
} from 'lucide-react';

interface SmallWorldLeftBandeauProps {
  state: GameState;
  activePlayer: PlayerState;
  isOpen: boolean;
  onToggle: () => void;
  onPassPlacement?: () => void;
  onResolveNextZone?: () => void;
  canPassPlacement?: boolean;
  canResolveNextZone?: boolean;
}

const PLAYER_THEMES: Record<string, {
  name: string;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
  ribbonColor: string;
  textColor: string;
  badgeBg: string;
}> = {
  red: {
    name: 'Tribu du Feu (Rouge)',
    bgGradient: 'from-red-950/95 via-stone-900/95 to-red-950/90',
    borderColor: 'border-red-600/80',
    glowColor: 'shadow-red-600/30',
    ribbonColor: 'bg-gradient-to-r from-red-600 to-amber-600 text-white',
    textColor: 'text-red-300',
    badgeBg: 'bg-red-900/80 text-red-100 border-red-700',
  },
  blue: {
    name: 'Tribu de l\'Onde (Bleu)',
    bgGradient: 'from-blue-950/95 via-stone-900/95 to-blue-950/90',
    borderColor: 'border-blue-600/80',
    glowColor: 'shadow-blue-600/30',
    ribbonColor: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white',
    textColor: 'text-blue-300',
    badgeBg: 'bg-blue-900/80 text-blue-100 border-blue-700',
  },
  yellow: {
    name: 'Tribu du Soleil (Jaune)',
    bgGradient: 'from-amber-950/95 via-stone-900/95 to-amber-950/90',
    borderColor: 'border-amber-500/80',
    glowColor: 'shadow-amber-500/30',
    ribbonColor: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black',
    textColor: 'text-amber-300',
    badgeBg: 'bg-amber-900/80 text-amber-100 border-amber-600',
  },
  green: {
    name: 'Tribu de la Forêt (Vert)',
    bgGradient: 'from-emerald-950/95 via-stone-900/95 to-emerald-950/90',
    borderColor: 'border-emerald-600/80',
    glowColor: 'shadow-emerald-600/30',
    ribbonColor: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white',
    textColor: 'text-emerald-300',
    badgeBg: 'bg-emerald-900/80 text-emerald-100 border-emerald-700',
  },
};

const ALL_GREEN_SYMBOLS: { id: GreenCultureSymbol; label: string; icon: string }[] = [
  { id: 'writing', label: 'Écriture', icon: '📜' },
  { id: 'pottery', label: 'Poterie', icon: '🏺' },
  { id: 'transport', label: 'Roue', icon: '🛞' },
  { id: 'weaving', label: 'Tissage', icon: '🧶' },
  { id: 'art', label: 'Art', icon: '🎨' },
  { id: 'music', label: 'Musique', icon: '🎵' },
  { id: 'medicine', label: 'Médecine', icon: '🌿' },
  { id: 'sundial', label: 'Cadran', icon: '☀️' },
];

export const SmallWorldLeftBandeau: React.FC<SmallWorldLeftBandeauProps> = ({
  state,
  activePlayer,
  isOpen,
  onToggle,
  onPassPlacement,
  onResolveNextZone,
  canPassPlacement = false,
  canResolveNextZone = false,
}) => {
  const activeTheme = PLAYER_THEMES[activePlayer.color] || PLAYER_THEMES.red;
  const isHumanTurn = !activePlayer.isAi;

  // Green culture symbols statistics
  const distinctGreenSymbols = new Set(
    activePlayer.civilizationCards
      .filter(c => c.bottomBonus.type === 'green' && c.bottomBonus.greenSymbol)
      .map(c => c.bottomBonus.greenSymbol)
  );

  // Multiplier stats
  const totalTools = activePlayer.toolTiles.reduce((a, b) => a + b, 0);
  const sandStats = {
    shaman: activePlayer.civilizationCards.reduce((acc, c) => acc + (c.bottomBonus.type === 'sand' && c.bottomBonus.sandType === 'shaman' ? (c.bottomBonus.sandMultiplier || 1) : 0), 0),
    farmer: activePlayer.civilizationCards.reduce((acc, c) => acc + (c.bottomBonus.type === 'sand' && c.bottomBonus.sandType === 'farmer' ? (c.bottomBonus.sandMultiplier || 1) : 0), 0),
    tool_maker: activePlayer.civilizationCards.reduce((acc, c) => acc + (c.bottomBonus.type === 'sand' && c.bottomBonus.sandType === 'tool_maker' ? (c.bottomBonus.sandMultiplier || 1) : 0), 0),
    builder: activePlayer.civilizationCards.reduce((acc, c) => acc + (c.bottomBonus.type === 'sand' && c.bottomBonus.sandType === 'builder' ? (c.bottomBonus.sandMultiplier || 1) : 0), 0),
  };

  // Close drawer on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle]);

  return (
    <>
      {/* Semi-transparent Backdrop Overlay: clicking anywhere outside closes the drawer! */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn cursor-pointer"
          title="Cliquer pour fermer le panneau des Tribus"
        />
      )}

      {/* Sleek Minimalist Edge Tab (Quick access to tribes & drawer) */}
      <button
        onClick={onToggle}
        className={`fixed left-0 top-12 z-40 bg-stone-900/95 hover:bg-stone-850 text-amber-300 border-y border-r border-amber-500/60 rounded-r-xl px-1.5 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.85)] flex items-center gap-1 cursor-pointer transition-all duration-300 ${
          isOpen ? '-translate-x-full' : 'translate-x-0 hover:translate-x-1'
        }`}
        title="Ouvrir le panneau des Tribus & Joueurs"
      >
        <span className="text-xs">👥</span>
        <ChevronRight className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
      </button>

      {/* Main Bandeau Container (Slide-over drawer so it never squashes the board!) */}
      <aside
        className={`fixed top-0 left-0 z-50 h-[100dvh] max-h-[100dvh] w-80 max-w-[85vw] flex flex-col justify-between bg-stone-950/95 backdrop-blur-2xl border-r-2 border-amber-900/70 shadow-[0_0_60px_rgba(0,0,0,0.95)] transition-transform duration-300 ease-out select-none overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundImage: 'radial-gradient(ellipse at top left, rgba(70, 40, 20, 0.3), transparent 70%)',
        }}
      >
        {/* Bandeau Header / Title */}
        <div className="p-2.5 border-b border-stone-800/80 bg-gradient-to-r from-stone-900 to-stone-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/60 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-amber-200">
                Tribus & Ressources
              </h2>
              <p className="text-[10px] text-stone-400">
                Manche {state.round} • {state.players.length} Joueurs
              </p>
            </div>
          </div>

          {/* Explicit, always visible Close Button */}
          <button
            onClick={onToggle}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700/80 cursor-pointer transition-all shadow-sm active:scale-95 text-xs font-bold"
            title="Fermer le panneau (Échap)"
          >
            <X className="w-3.5 h-3.5 text-amber-400" />
            <span>Fermer</span>
          </button>
        </div>

        {/* Scrollable Content: Player Ribbons + Active Tribe Chest */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2.5 space-y-3 custom-scrollbar overscroll-contain">
          {/* 1. SMALL WORLD PLAYER RIBBONS STACK */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              <span>Bannières des Joueurs</span>
              <span>Score / PV</span>
            </div>

            {state.players.map((p, idx) => {
              const isActive = idx === state.activePlayerIndex;
              const isStartPlayer = idx === state.firstPlayerIndex;
              const theme = PLAYER_THEMES[p.color] || PLAYER_THEMES.red;

              return (
                <div
                  key={p.id}
                  className={`relative rounded-xl p-2 transition-all duration-200 border ${
                    isActive
                      ? `bg-gradient-to-r ${theme.bgGradient} ${theme.borderColor} shadow-lg ${theme.glowColor} ring-2 ring-amber-400/80`
                      : 'bg-stone-900/70 border-stone-800 hover:border-stone-700 text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Left: Player Avatar + Name + AI Badge */}
                    <div className="flex items-center gap-2">
                      <div className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        isActive ? 'border-amber-400 shadow-md' : 'border-stone-700 bg-stone-800'
                      } ${theme.ribbonColor}`}>
                        {p.isAi ? (
                          <Bot className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                        {isStartPlayer && (
                          <Crown className="w-3.5 h-3.5 text-amber-300 absolute -top-1.5 -right-1 drop-shadow" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-black truncate max-w-[100px] ${
                            isActive ? 'text-amber-200' : 'text-stone-200'
                          }`}>
                            {p.name}
                          </span>
                          {p.isAi && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-stone-800 text-stone-400 font-medium">
                              IA
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-stone-400">
                          <span className="flex items-center gap-0.5" title="Ouvriers disponibles / Total">
                            <Users className="w-3 h-3 text-stone-400" />
                            <span>{p.availableMeeples}/{p.totalMeeples}</span>
                          </span>
                          <span className="flex items-center gap-0.5" title="Champs d'agriculture">
                            <Wheat className="w-3 h-3 text-emerald-400" />
                            <span>+{p.agriculture}</span>
                          </span>
                          <span 
                            className={`flex items-center gap-1 font-bold ${
                              p.food + p.agriculture >= p.totalMeeples ? 'text-emerald-300' : 'text-red-400'
                            }`}
                            title={`Nourriture disponible : ${p.food} • Besoin fin de manche : ${p.totalMeeples} ouvriers (Agri : +${p.agriculture})`}
                          >
                            <ResourceIcon type="food" size="xs" />
                            <span>{p.food}</span>
                            <span className="text-stone-500 font-normal">/</span>
                            <span>{p.totalMeeples}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Score Ribbon Pill */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-950/80 border border-stone-700/80 shadow">
                        <Trophy className="w-3 h-3 text-amber-400" />
                        <span className="text-xs font-black text-amber-300">
                          {p.victoryPoints}
                        </span>
                        <span className="text-[9px] text-stone-400 font-bold">PV</span>
                      </div>
                      {isActive && (
                        <span className="text-[9px] font-black text-amber-400 flex items-center gap-0.5 mt-0.5 animate-pulse">
                          <span>À son tour</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. ACTIVE PLAYER'S TACTICAL TRAY (SMALL WORLD RESERVE PANEL) */}
          <div className="rounded-2xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-600/60 p-2.5 shadow-xl relative overflow-hidden">
            {/* Header of Active Tribe Tray */}
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-stone-800">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                  Mon Coffre de Tribu
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeTheme.badgeBg}`}>
                {activePlayer.name}
              </span>
            </div>

            {/* A. Meeples in Hand (Grand badge tactile) */}
            <div className="bg-stone-950/90 rounded-xl p-2 border border-stone-800 mb-2.5 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-[10px] text-stone-400 font-bold uppercase">
                    Ouvriers en Main
                  </div>
                  <div className="text-base font-black text-amber-200">
                    {activePlayer.availableMeeples}{' '}
                    <span className="text-xs text-stone-500 font-semibold">
                      / {activePlayer.totalMeeples} au total
                    </span>
                  </div>
                </div>
              </div>

              {/* Meeple visual figures indicator */}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: Math.min(8, activePlayer.totalMeeples) }).map((_, i) => {
                  const isAvailable = i < activePlayer.availableMeeples;
                  return (
                    <div
                      key={i}
                      className={`w-2.5 h-4 rounded-sm transition-all ${
                        isAvailable
                          ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                          : 'bg-stone-800 border border-stone-700 opacity-40'
                      }`}
                      title={isAvailable ? 'Ouvrier prêt' : 'Ouvrier placé sur le plateau'}
                    />
                  );
                })}
              </div>
            </div>

            {/* B. Stock of 4 Resources (Wood, Clay, Stone, Gold) */}
            <div className="mb-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1 px-0.5 flex justify-between">
                <span>Ressources en Stock</span>
                <span className="text-[9px] text-stone-500">Valeur / Diviseur dés</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {/* Wood */}
                <div className="bg-stone-950/90 rounded-xl p-2 border border-amber-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ResourceIcon type="wood" size="md" />
                    <div>
                      <div className="text-[10px] text-stone-400 font-semibold">Bois</div>
                      <div className="text-[9px] text-stone-500">Div ÷3</div>
                    </div>
                  </div>
                  <span className="text-base font-black text-amber-200 px-2 py-0.5 bg-amber-950/60 border border-amber-800/60 rounded-lg">
                    {activePlayer.resources.wood}
                  </span>
                </div>

                {/* Clay */}
                <div className="bg-stone-950/90 rounded-xl p-2 border border-amber-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ResourceIcon type="clay" size="md" />
                    <div>
                      <div className="text-[10px] text-stone-400 font-semibold">Glaise</div>
                      <div className="text-[9px] text-stone-500">Div ÷4</div>
                    </div>
                  </div>
                  <span className="text-base font-black text-amber-200 px-2 py-0.5 bg-amber-950/60 border border-amber-800/60 rounded-lg">
                    {activePlayer.resources.clay}
                  </span>
                </div>

                {/* Stone */}
                <div className="bg-stone-950/90 rounded-xl p-2 border border-stone-700/40 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ResourceIcon type="stone" size="md" />
                    <div>
                      <div className="text-[10px] text-stone-400 font-semibold">Pierre</div>
                      <div className="text-[9px] text-stone-500">Div ÷5</div>
                    </div>
                  </div>
                  <span className="text-base font-black text-stone-200 px-2 py-0.5 bg-stone-900/80 border border-stone-700/60 rounded-lg">
                    {activePlayer.resources.stone}
                  </span>
                </div>

                {/* Gold */}
                <div className="bg-stone-950/90 rounded-xl p-2 border border-yellow-600/40 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ResourceIcon type="gold" size="md" />
                    <div>
                      <div className="text-[10px] text-stone-400 font-semibold">Or</div>
                      <div className="text-[9px] text-yellow-500/80">Div ÷6</div>
                    </div>
                  </div>
                  <span className="text-base font-black text-yellow-300 px-2 py-0.5 bg-yellow-950/60 border border-yellow-600/60 rounded-lg">
                    {activePlayer.resources.gold}
                  </span>
                </div>
              </div>
            </div>

            {/* C. Food & Agriculture status */}
            <div className="mb-2.5 space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                {/* Food */}
                <div className="bg-stone-950/90 rounded-xl p-2 border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ResourceIcon type="food" size="md" />
                    <div>
                      <div className="text-[10px] text-stone-400 font-semibold">Nourriture</div>
                      <div className="text-[9px] text-amber-400">Stock dispo</div>
                    </div>
                  </div>
                  <span className="text-base font-black text-amber-300">
                    {activePlayer.food}
                  </span>
                </div>

                {/* Agriculture */}
                <div className="bg-stone-950/90 rounded-xl p-2 border border-emerald-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ResourceIcon type="agriculture" size="md" />
                    <div>
                      <div className="text-[10px] text-stone-400 font-semibold">Agriculture</div>
                      <div className="text-[9px] text-emerald-400">+{activePlayer.agriculture} / tour</div>
                    </div>
                  </div>
                  <span className="text-base font-black text-emerald-300">
                    Nv.{activePlayer.agriculture}
                  </span>
                </div>
              </div>

              {/* Explicit Food Needs & Hunger Banner */}
              {(() => {
                const totalNeed = activePlayer.totalMeeples;
                const coveredByAgri = activePlayer.agriculture;
                const netNeededFromStock = Math.max(0, totalNeed - coveredByAgri);
                const isFed = activePlayer.food >= netNeededFromStock;
                const deficit = Math.max(0, netNeededFromStock - activePlayer.food);

                return (
                  <div className={`p-2 rounded-xl border text-[10px] flex items-center justify-between ${
                    isFed
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                      : 'bg-red-950/40 border-red-800/80 text-red-200'
                  }`}>
                    <div>
                      <div className="font-bold flex items-center gap-1">
                        <span>{isFed ? '✅ Tribu rassasiée' : '⚠️ Risque de famine'}</span>
                        <span className="text-stone-400 font-normal">
                          (Faim: {totalNeed} - Agri: {coveredByAgri} = {netNeededFromStock})
                        </span>
                      </div>
                      <div className="text-[9px] text-stone-400">
                        {isFed
                          ? `Reste après repas : +${activePlayer.food - netNeededFromStock} ration(s)`
                          : `Déficit à combler en Phase 3 : ${deficit} matière(s) ou -10 PV`}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg font-black text-xs ${
                      isFed ? 'bg-emerald-900/80 text-emerald-200' : 'bg-red-900/90 text-red-100 animate-pulse'
                    }`}>
                      {isFed ? 'OK' : `-${deficit}`}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* D. Tool Tiles Rack */}
            <div className="bg-stone-950/80 rounded-xl p-2 border border-stone-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                  <Hammer className="w-3 h-3 text-blue-400" />
                  <span>Outils Disponibles</span>
                </span>
                <span className="text-[10px] text-stone-400">
                  {activePlayer.toolTiles.reduce(
                    (sum, val, idx) => sum + (activePlayer.toolsUsedThisRound[idx] ? 0 : val),
                    0
                  ) + activePlayer.temporaryTools} pts prêts
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {activePlayer.toolTiles.map((val, idx) => {
                  const isUsed = activePlayer.toolsUsedThisRound[idx];
                  if (val === 0) {
                    return (
                      <div
                        key={idx}
                        className="py-1 px-1.5 rounded-lg border border-dashed border-stone-800 text-center bg-stone-950/40 text-stone-600"
                        title="Emplacement d'outil vide"
                      >
                        <div className="text-[9px] text-stone-600 font-medium">Slot {idx + 1}</div>
                        <div className="text-xs font-bold text-stone-700">-</div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={idx}
                      className={`py-1 px-1.5 rounded-lg border text-center transition-all ${
                        isUsed
                          ? 'bg-stone-900/50 border-stone-800 text-stone-600 line-through'
                          : 'bg-blue-950/60 border-blue-600/70 text-blue-300 font-black shadow-sm'
                      }`}
                      title={isUsed ? `Tuile ${val} (utilisée ce tour)` : `Tuile +${val} prête`}
                    >
                      <div className="text-[9px] font-semibold text-stone-400">Tuile {idx + 1}</div>
                      <div className="text-xs font-black">+{val}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Extensions Panel (Style & Mammouths) */}
            {(state.expansions?.styleIsTheGoal || state.expansions?.mammothHerd) && (
              <div className="bg-stone-950/90 rounded-xl p-2.5 border border-purple-500/40 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center justify-between">
                  <span>Trésors & Expéditions</span>
                  <span className="text-[9px] text-stone-400">Extensions</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {state.expansions?.styleIsTheGoal && (
                    <div className="bg-purple-950/40 rounded-lg p-1.5 border border-purple-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-base">📿</span>
                        <div>
                          <div className="text-[9px] text-stone-400 font-semibold">Parures</div>
                          <div className="text-[8px] text-purple-300">Troc: Niv.{activePlayer.merchantLevel || 0}/5</div>
                        </div>
                      </div>
                      <span className="text-xs font-black text-purple-200 px-1.5 py-0.5 bg-purple-900/60 rounded">
                        {activePlayer.jewelry || 0}
                      </span>
                    </div>
                  )}

                  {state.expansions?.mammothHerd && (
                    <div className="bg-amber-950/40 rounded-lg p-1.5 border border-amber-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-base">🦣</span>
                        <div>
                          <div className="text-[9px] text-stone-400 font-semibold">Mammouths</div>
                          <div className="text-[8px] text-amber-300">Trophées</div>
                        </div>
                      </div>
                      <span className="text-xs font-black text-amber-200 px-1.5 py-0.5 bg-amber-900/60 rounded">
                        {(activePlayer.mammothTiles || []).length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* E. Synthèse des Cartes Civilisation : Symboles Verts (Possédés & Non) & Coefficients */}
            <div className="bg-stone-950/90 rounded-xl p-2.5 border border-stone-800 space-y-2">
              {/* Header Symboles Verts */}
              <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Scroll className="w-3.5 h-3.5 text-amber-400" />
                  <span>Symboles Culturels Verts</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.5 rounded shadow-xs">
                  {distinctGreenSymbols.size}/8 ({distinctGreenSymbols.size * distinctGreenSymbols.size} PV)
                </span>
              </div>

              {/* 8 Green Symbols Matrix (4 colonnes x 2 lignes : possédés et non possédés) */}
              <div className="grid grid-cols-4 gap-1">
                {ALL_GREEN_SYMBOLS.map(sym => {
                  const count = activePlayer.civilizationCards.filter(
                    c => c.bottomBonus.type === 'green' && c.bottomBonus.greenSymbol === sym.id
                  ).length;
                  const isOwned = count > 0;

                  return (
                    <div
                      key={sym.id}
                      className={`p-1 rounded-lg border text-center transition-all flex flex-col items-center justify-between ${
                        isOwned
                          ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                          : 'bg-stone-900/30 border-dashed border-stone-800 text-stone-600 opacity-40'
                      }`}
                      title={`${sym.label} : ${isOwned ? `Possédé (${count}x)` : 'Non possédé'}`}
                    >
                      <div className="flex items-center justify-center my-0.5">
                        <CultureIcon type={sym.id} size="sm" className={isOwned ? '' : 'grayscale opacity-50'} />
                      </div>
                      <div className="text-[8px] font-bold truncate leading-tight mt-0.5">{sym.label}</div>
                      {isOwned && (
                        <div className="text-[8px] font-mono font-black text-emerald-300 leading-tight">
                          {count > 1 ? `x${count}` : '✓'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Header Coefficients / Multiplicateurs */}
              <div className="pt-2 border-t border-stone-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    📜 Coefficients Multiplicateurs
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Total : <strong className="text-amber-300 font-mono font-black">
                      {sandStats.shaman * activePlayer.totalMeeples +
                       sandStats.farmer * activePlayer.agriculture +
                       sandStats.tool_maker * totalTools +
                       sandStats.builder * activePlayer.buildings.length} PV
                    </strong>
                  </span>
                </div>

                {/* 2x2 Grid of Multipliers */}
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {/* Chamans */}
                  <div className="bg-stone-900/80 border border-stone-800 rounded-lg p-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-sm">🧙</span>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-stone-200 truncate">Chamans</div>
                        <div className="text-[8px] text-stone-400 truncate">×{activePlayer.totalMeeples} ouv.</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono font-black text-amber-300">
                        {sandStats.shaman}×
                      </span>
                      <div className="text-[9px] font-mono text-stone-400">
                        ={sandStats.shaman * activePlayer.totalMeeples}
                      </div>
                    </div>
                  </div>

                  {/* Fermiers */}
                  <div className="bg-stone-900/80 border border-stone-800 rounded-lg p-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-sm">🌾</span>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-stone-200 truncate">Fermiers</div>
                        <div className="text-[8px] text-stone-400 truncate">×{activePlayer.agriculture} agri</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono font-black text-amber-300">
                        {sandStats.farmer}×
                      </span>
                      <div className="text-[9px] font-mono text-stone-400">
                        ={sandStats.farmer * activePlayer.agriculture}
                      </div>
                    </div>
                  </div>

                  {/* Fabricants d'outils */}
                  <div className="bg-stone-900/80 border border-stone-800 rounded-lg p-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-sm">🔨</span>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-stone-200 truncate">Artisans</div>
                        <div className="text-[8px] text-stone-400 truncate">×{totalTools} outils</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono font-black text-amber-300">
                        {sandStats.tool_maker}×
                      </span>
                      <div className="text-[9px] font-mono text-stone-400">
                        ={sandStats.tool_maker * totalTools}
                      </div>
                    </div>
                  </div>

                  {/* Bâtisseurs */}
                  <div className="bg-stone-900/80 border border-stone-800 rounded-lg p-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1 min-w-0">
                      <ResourceIcon type="building" size="xs" />
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-stone-200 truncate">Bâtisseurs</div>
                        <div className="text-[8px] text-stone-400 truncate">×{activePlayer.buildings.length} bât.</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono font-black text-amber-300">
                        {sandStats.builder}×
                      </span>
                      <div className="text-[9px] font-mono text-stone-400">
                        ={sandStats.builder * activePlayer.buildings.length}
                      </div>
                    </div>
                  </div>

                  {/* Ressources restantes (1 PV par ressource) */}
                  {(() => {
                    const totalRes = activePlayer.resources.wood + activePlayer.resources.clay + activePlayer.resources.stone + activePlayer.resources.gold;
                    return (
                      <div className="bg-amber-950/30 border border-amber-900/40 rounded-lg p-1.5 flex items-center justify-between col-span-2">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-xs">💎</span>
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold text-amber-200 truncate">Ressources en stock</div>
                            <div className="text-[8px] text-stone-400 truncate">1 point par ressource en fin de partie</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-mono font-black text-amber-300">
                            +{totalRes} VP
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Journal des actions */}
            <div className="pt-2 border-t border-stone-800/80">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1.5">
                📜 Journal d'évènements
              </span>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-stone-800">
                <GameLog entries={state.log} />
              </div>
            </div>
          </div>
        </div>

        {/* Tactical Action Footer (Buttons directly inside the bandeau for smooth play) */}
        {isHumanTurn && (
          <div className="p-2.5 border-t border-stone-800 bg-stone-950 space-y-1.5">
            {state.phase === 'placement' && canPassPlacement && (
              <button
                onClick={onPassPlacement}
                className="w-full py-2 px-3 rounded-xl font-black text-xs bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 hover:from-amber-500 hover:to-amber-600 shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <span>Passer mon tour de pose</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {state.phase === 'resolution' && canResolveNextZone && (
              <button
                onClick={onResolveNextZone}
                className="w-full py-2 px-3 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-600 shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-95 animate-pulse"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Résoudre la zone suivante</span>
              </button>
            )}
          </div>
        )}

        {/* Bottom Close Button */}
        <div className="p-2 border-t border-stone-800/80 bg-stone-950 flex items-center justify-center">
          <button
            onClick={onToggle}
            className="w-full py-1.5 px-3 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-900 border border-stone-800/80 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Fermer le panneau</span>
          </button>
        </div>
      </aside>
    </>
  );
};
