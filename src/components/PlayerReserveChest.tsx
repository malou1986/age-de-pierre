import React, { useState } from 'react';
import { GameState, PlayerState, ResourceType } from '../types/game';
import { RESOURCE_NAMES, RESOURCE_VALUES } from '../data/buildings';
import { GREEN_SYMBOLS, SAND_FIGURES } from '../data/cards';
import { MeepleIcon } from './Meeples';
import { ResourceIcon } from './Common/ResourceIcon';
import { 
  Crown, 
  Wheat, 
  Wrench, 
  Scroll, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Bot, 
  AlertTriangle, 
  CheckCircle2, 
  Layers,
  ShieldCheck,
  TrendingUp,
  Users
} from 'lucide-react';

interface PlayerReserveChestProps {
  state: GameState;
  activePlayer: PlayerState;
  onUseTool?: (toolIndex: number) => void;
}

export const PlayerReserveChest: React.FC<PlayerReserveChestProps> = ({
  state,
  activePlayer,
}) => {
  const [showRivals, setShowRivals] = useState(false);
  const [showCardsDetail, setShowCardsDetail] = useState(false);

  // Human player is usually the non-AI player (or current active player)
  const humanPlayer = state.players.find(p => !p.isAi) || activePlayer;
  // If active player is human, display active player; otherwise allow viewing active or human
  const displayPlayer = activePlayer;

  const totalTools = displayPlayer.toolTiles.reduce((sum: number, t: number) => sum + t, 0);
  const usedTools = (displayPlayer.toolsUsedThisRound || []).reduce((sum: number, used: boolean, idx: number) => {
    return sum + (used ? (displayPlayer.toolTiles[idx] || 0) : 0);
  }, 0);
  const availableTools = totalTools - usedTools;

  // Food calculation
  const foodDemand = displayPlayer.totalMeeples;
  const foodFromFields = displayPlayer.agriculture;
  const netFoodNeeded = Math.max(0, foodDemand - foodFromFields);
  const foodSurplus = displayPlayer.food - netFoodNeeded;
  const isFoodSafe = foodSurplus >= 0;

  // Green symbols collected
  const distinctGreenSymbols = new Set(
    displayPlayer.civilizationCards
      .filter(c => c.bottomBonus.type === 'green')
      .map(c => c.bottomBonus.greenSymbol)
  );

  // Sand multipliers count
  const sandStats = {
    shaman: displayPlayer.civilizationCards
      .filter(c => c.bottomBonus.type === 'sand' && c.bottomBonus.sandType === 'shaman')
      .reduce((sum, c) => sum + (c.bottomBonus.sandMultiplier || 1), 0),
    farmer: displayPlayer.civilizationCards
      .filter(c => c.bottomBonus.type === 'sand' && c.bottomBonus.sandType === 'farmer')
      .reduce((sum, c) => sum + (c.bottomBonus.sandMultiplier || 1), 0),
    tool_maker: displayPlayer.civilizationCards
      .filter(c => c.bottomBonus.type === 'sand' && c.bottomBonus.sandType === 'tool_maker')
      .reduce((sum, c) => sum + (c.bottomBonus.sandMultiplier || 1), 0),
    builder: displayPlayer.civilizationCards
      .filter(c => c.bottomBonus.type === 'sand' && c.bottomBonus.sandType === 'builder')
      .reduce((sum, c) => sum + (c.bottomBonus.sandMultiplier || 1), 0),
  };

  // Other players
  const rivalPlayers = state.players.filter(p => p.id !== displayPlayer.id);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-3">
      {/* GRAND COFFRE DE TRIBU */}
      <div className="relative rounded-3xl bg-gradient-to-b from-stone-900 via-stone-925 to-stone-950 border-3 border-amber-600/60 shadow-2xl overflow-hidden p-4 sm:p-5 text-stone-100 ring-2 ring-amber-500/20">
        {/* Subtle decorative prehistoric background patterns */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600/5 rounded-full blur-2xl pointer-events-none" />

        {/* TOP BAR: Player identity, Victory points, Tribe population & Hunger status */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-amber-900/40 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div 
                className="w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg border-2"
                style={{
                  backgroundColor: displayPlayer.color === 'red' ? '#7f1d1d' : displayPlayer.color === 'blue' ? '#1e3a8a' : displayPlayer.color === 'yellow' ? '#78350f' : '#14532d',
                  borderColor: displayPlayer.color === 'red' ? '#f87171' : displayPlayer.color === 'blue' ? '#60a5fa' : displayPlayer.color === 'yellow' ? '#facc15' : '#4ade80'
                }}
              >
                <MeepleIcon color={displayPlayer.color} size={30} glow />
              </div>
              {state.firstPlayerIndex === state.players.findIndex(p => p.id === displayPlayer.id) && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-stone-950 p-1 rounded-full shadow-md" title="Premier Joueur de la manche">
                  <Crown className="w-3.5 h-3.5 fill-current" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-wide text-amber-200">
                  {displayPlayer.name}
                </h2>
                {displayPlayer.isAi && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full border border-stone-700">
                    <Bot className="w-3 h-3" /> IA
                  </span>
                )}
                <span className="text-xs uppercase font-extrabold tracking-wider bg-amber-500/15 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Coffre de Tribu
                </span>
              </div>
              <p className="text-xs text-stone-400 font-medium">
                Gérez vos matières premières, vos outils et l'approvisionnement de votre clan
              </p>
            </div>
          </div>

          {/* Quick Tribe Summary Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Victory points */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-600/30 border-2 border-amber-400/60 px-3.5 py-1.5 rounded-2xl shadow-lg">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <span className="text-[10px] text-amber-300/80 font-bold uppercase block leading-none">Score</span>
                <span className="text-xl font-black text-amber-300 leading-none">{displayPlayer.victoryPoints} VP</span>
              </div>
            </div>

            {/* Meeples count */}
            <div className="flex items-center gap-2 bg-stone-800/80 border border-stone-700 px-3 py-1.5 rounded-2xl shadow">
              <Users className="w-4 h-4 text-stone-300" />
              <div className="text-left">
                <span className="text-[10px] text-stone-400 font-medium uppercase block leading-none">Ouvriers</span>
                <span className="text-sm font-bold text-stone-100 leading-none">
                  <span className="text-amber-400 font-black">{displayPlayer.availableMeeples}</span>
                  <span className="text-stone-400 text-xs"> / {displayPlayer.totalMeeples}</span>
                </span>
              </div>
            </div>

            {/* Tribe Food / Hunger status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border shadow ${
              isFoodSafe 
                ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300' 
                : 'bg-red-950/40 border-red-600/50 text-red-300 animate-pulse'
            }`}>
              {isFoodSafe ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
              <div className="text-left">
                <span className="text-[10px] opacity-80 font-medium uppercase block leading-none">Nourriture Tribu</span>
                <span className="text-xs font-bold leading-none flex items-center gap-1">
                  <span>{displayPlayer.food}</span>
                  <ResourceIcon type="food" size="xs" />
                  <span className="text-[10px] opacity-80 font-normal">(Besoin: {netFoodNeeded})</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RESOURCE TILES (Wood, Clay, Stone, Gold, Food) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
          {/* 🪵 BOIS */}
          <div className="group relative rounded-2xl bg-gradient-to-b from-stone-800/90 to-stone-900 border-2 border-amber-800/60 p-3 shadow-md hover:border-amber-600 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <ResourceIcon type="wood" size="sm" /> Bois
              </span>
              <span className="text-[10px] font-mono font-bold bg-amber-900/60 text-amber-200 px-1.5 py-0.2 rounded border border-amber-700/50">
                ÷3
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-amber-300 tracking-tight">
                {displayPlayer.resources.wood}
              </span>
              <span className="text-[10px] text-stone-400 font-medium">
                = {displayPlayer.resources.wood * RESOURCE_VALUES.wood} VP
              </span>
            </div>
            <div className="w-full bg-stone-950 h-1 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-amber-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (displayPlayer.resources.wood / 10) * 100)}%` }}
              />
            </div>
          </div>

          {/* 🧱 GLAISE */}
          <div className="group relative rounded-2xl bg-gradient-to-b from-stone-800/90 to-stone-900 border-2 border-orange-800/60 p-3 shadow-md hover:border-orange-500 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <ResourceIcon type="clay" size="sm" /> Glaise
              </span>
              <span className="text-[10px] font-mono font-bold bg-orange-950/80 text-orange-200 px-1.5 py-0.2 rounded border border-orange-700/50">
                ÷4
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-orange-400 tracking-tight">
                {displayPlayer.resources.clay}
              </span>
              <span className="text-[10px] text-stone-400 font-medium">
                = {displayPlayer.resources.clay * RESOURCE_VALUES.clay} VP
              </span>
            </div>
            <div className="w-full bg-stone-950 h-1 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-orange-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (displayPlayer.resources.clay / 8) * 100)}%` }}
              />
            </div>
          </div>

          {/* 🪨 PIERRE */}
          <div className="group relative rounded-2xl bg-gradient-to-b from-stone-800/90 to-stone-900 border-2 border-slate-700 p-3 shadow-md hover:border-slate-400 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <ResourceIcon type="stone" size="sm" /> Pierre
              </span>
              <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-200 px-1.5 py-0.2 rounded border border-slate-600">
                ÷5
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-200 tracking-tight">
                {displayPlayer.resources.stone}
              </span>
              <span className="text-[10px] text-stone-400 font-medium">
                = {displayPlayer.resources.stone * RESOURCE_VALUES.stone} VP
              </span>
            </div>
            <div className="w-full bg-stone-950 h-1 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-slate-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (displayPlayer.resources.stone / 6) * 100)}%` }}
              />
            </div>
          </div>

          {/* 🪙 OR */}
          <div className="group relative rounded-2xl bg-gradient-to-b from-stone-800/90 to-stone-900 border-2 border-yellow-700/60 p-3 shadow-md hover:border-yellow-400 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <ResourceIcon type="gold" size="sm" /> Or
              </span>
              <span className="text-[10px] font-mono font-bold bg-yellow-950/80 text-yellow-200 px-1.5 py-0.2 rounded border border-yellow-600/50">
                ÷6
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-yellow-300 tracking-tight">
                {displayPlayer.resources.gold}
              </span>
              <span className="text-[10px] text-stone-400 font-medium">
                = {displayPlayer.resources.gold * RESOURCE_VALUES.gold} VP
              </span>
            </div>
            <div className="w-full bg-stone-950 h-1 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-yellow-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (displayPlayer.resources.gold / 5) * 100)}%` }}
              />
            </div>
          </div>

          {/* 🍗 NOURRITURE */}
          <div className="col-span-2 sm:col-span-1 rounded-2xl bg-gradient-to-b from-amber-950/40 to-stone-900 border-2 border-amber-700/40 p-3 shadow-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <ResourceIcon type="food" size="sm" /> Nourriture
              </span>
              <span className="text-[10px] text-stone-400">Rations</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-amber-400 tracking-tight">
                {displayPlayer.food}
              </span>
              <span className="text-[10px] text-stone-400 font-medium">
                ÷2 (Chasse)
              </span>
            </div>
            <div className="w-full bg-stone-950 h-1 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (displayPlayer.food / 15) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* SECOND ROW: OUTILS & AGRICULTURE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* 🔨 OUTILS TACTILES */}
          <div className="rounded-2xl bg-stone-950/80 border border-stone-800 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-stone-200">Piste d'Outils</span>
                <span className="text-[10px] text-blue-300 font-bold bg-blue-950/80 px-2 py-0.2 rounded-full border border-blue-800/50">
                  Valeur totale : +{totalTools}
                </span>
              </div>
              <span className="text-[11px] text-stone-400 font-medium">
                Disponibles ce tour : <span className="text-amber-400 font-bold">+{availableTools}</span>
              </span>
            </div>

            {/* Tool Tiles */}
            <div className="flex items-center gap-2.5">
              {[0, 1, 2].map((idx) => {
                const val = displayPlayer.toolTiles[idx] || 0;
                const isUsed = !!(displayPlayer.toolsUsedThisRound && displayPlayer.toolsUsedThisRound[idx]);

                if (val === 0) {
                  return (
                    <div
                      key={idx}
                      className="h-11 px-3 rounded-2xl border-2 border-dashed border-stone-800 bg-stone-950/50 flex items-center gap-2 text-stone-600"
                      title="Emplacement d'outil libre (obtenez des outils chez le Fabricant d'outils)"
                    >
                      <Wrench className="w-3.5 h-3.5 opacity-30" />
                      <span className="text-[10px] font-bold tracking-wider opacity-40">VIDE</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className={`group relative flex items-center gap-2 p-1 pr-3 rounded-2xl transition-all shadow-md ${
                      isUsed
                        ? 'bg-stone-900/90 text-stone-500 border border-stone-800 opacity-60 grayscale'
                        : 'bg-gradient-to-b from-stone-800 to-stone-900 border-2 border-amber-500/70 shadow-amber-950/40 hover:scale-105'
                    }`}
                    title={isUsed ? `Outil (+${val}) déjà utilisé pour un lancer ce tour` : `Outil (+${val}) disponible pour votre prochain lancer`}
                  >
                    <img
                      src={`/tools/tool_${val}.png`}
                      alt={`Outil +${val}`}
                      className="w-9 h-9 rounded-xl object-contain shadow border border-amber-900/60"
                    />
                    <div className="flex flex-col">
                      <span className={`text-xs font-black tracking-tight ${isUsed ? 'text-stone-500' : 'text-amber-300'}`}>
                        +{val}
                      </span>
                      <span className="text-[8px] uppercase tracking-wider font-bold text-stone-400">
                        {isUsed ? 'Épuisé' : 'Prêt'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🌾 AGRICULTURE / CHAMPS */}
          <div className="rounded-2xl bg-stone-950/80 border border-stone-800 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wheat className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-stone-200">Piste d'Agriculture</span>
                <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.2 rounded-full border border-emerald-800/50">
                  Niveau {displayPlayer.agriculture} / 10
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">
                🌾 +{displayPlayer.agriculture} ration(s) auto
              </span>
            </div>

            {/* Stepped Agriculture Progress Bar */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 10 }).map((_, i) => {
                const step = i + 1;
                const isReached = displayPlayer.agriculture >= step;
                return (
                  <div
                    key={i}
                    className={`flex-1 h-3 rounded transition-all ${
                      isReached
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        : 'bg-stone-900 border border-stone-800'
                    }`}
                    title={`Niveau d'agriculture ${step}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: CIVILIZATION CARDS & BUILDINGS QUICK SUMMARY TOGGLE */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs">
          <button
            onClick={() => setShowCardsDetail(!showCardsDetail)}
            className="flex items-center gap-2 text-stone-300 hover:text-amber-300 font-bold transition-colors cursor-pointer"
          >
            <Scroll className="w-4 h-4 text-amber-400" />
            <span>Patrimoine : {displayPlayer.civilizationCards.length} Cartes Civilisation & {displayPlayer.buildings.length} Bâtiments</span>
            {showCardsDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setShowRivals(!showRivals)}
            className="flex items-center gap-2 text-stone-300 hover:text-amber-300 font-bold transition-colors cursor-pointer bg-stone-900/90 border border-stone-700/70 px-3 py-1 rounded-xl shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-stone-400" />
            <span>Tribus Rivales ({rivalPlayers.length})</span>
            {showRivals ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* EXPANDABLE: CIVILIZATION CARDS & MULTIPLIERS DETAIL */}
        {showCardsDetail && (
          <div className="mt-3 pt-3 border-t border-amber-900/30 grid grid-cols-1 md:grid-cols-2 gap-3 bg-stone-950/60 p-3 rounded-2xl animate-fadeIn">
            {/* Culture Green Symbols */}
            <div>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide block mb-1.5">
                🏛️ Symboles Culturels Verts ({distinctGreenSymbols.size}/8 différents)
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {GREEN_SYMBOLS.map(sym => {
                  const count = displayPlayer.civilizationCards.filter(
                    c => c.bottomBonus.type === 'green' && c.bottomBonus.greenSymbol === sym.id
                  ).length;
                  const has = count > 0;
                  return (
                    <div
                      key={sym.id}
                      className={`p-1.5 rounded-lg border text-center transition-all ${
                        has
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                          : 'bg-stone-900/40 border-stone-800 text-stone-600 opacity-50'
                      }`}
                      title={`${sym.label} (${count} possédé${count > 1 ? 's' : ''})`}
                    >
                      <span className="text-base block">{sym.icon}</span>
                      <span className="text-[10px] font-bold block truncate">{sym.label}</span>
                      {has && <span className="text-[9px] font-mono font-bold text-emerald-400">x{count}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sand Multipliers */}
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide block mb-1.5">
                📜 Personnages Multiplicateurs de Fin de Partie
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-stone-900/80 border border-stone-800 p-2 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🧙</span>
                    <div>
                      <span className="font-bold text-stone-200 block text-[11px]">Chamans</span>
                      <span className="text-[9px] text-stone-400">x {displayPlayer.totalMeeples} Ouvriers</span>
                    </div>
                  </div>
                  <span className="font-black text-amber-300 text-sm">
                    {sandStats.shaman}
                    <span className="text-[10px] text-stone-400 font-normal"> (= {sandStats.shaman * displayPlayer.totalMeeples} VP)</span>
                  </span>
                </div>

                <div className="bg-stone-900/80 border border-stone-800 p-2 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ResourceIcon type="agriculture" size="sm" />
                    <div>
                      <span className="font-bold text-stone-200 block text-[11px]">Fermiers</span>
                      <span className="text-[9px] text-stone-400">x {displayPlayer.agriculture} Champs</span>
                    </div>
                  </div>
                  <span className="font-black text-amber-300 text-sm">
                    {sandStats.farmer}
                    <span className="text-[10px] text-stone-400 font-normal"> (= {sandStats.farmer * displayPlayer.agriculture} VP)</span>
                  </span>
                </div>

                <div className="bg-stone-900/80 border border-stone-800 p-2 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ResourceIcon type="tool" size="sm" />
                    <div>
                      <span className="font-bold text-stone-200 block text-[11px]">Fabricants</span>
                      <span className="text-[9px] text-stone-400">x {totalTools} Outils</span>
                    </div>
                  </div>
                  <span className="font-black text-amber-300 text-sm">
                    {sandStats.tool_maker}
                    <span className="text-[10px] text-stone-400 font-normal"> (= {sandStats.tool_maker * totalTools} VP)</span>
                  </span>
                </div>

                <div className="bg-stone-900/80 border border-stone-800 p-2 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ResourceIcon type="building" size="sm" />
                    <div>
                      <span className="font-bold text-stone-200 block text-[11px]">Bâtisseurs</span>
                      <span className="text-[9px] text-stone-400">x {displayPlayer.buildings.length} Bâtiments</span>
                    </div>
                  </div>
                  <span className="font-black text-amber-300 text-sm">
                    {sandStats.builder}
                    <span className="text-[10px] text-stone-400 font-normal"> (= {sandStats.builder * displayPlayer.buildings.length} VP)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Gallery of Owned Civilization Cards with End-Game Effects */}
            {displayPlayer.civilizationCards.length > 0 && (
              <div className="col-span-1 md:col-span-2 pt-2.5 border-t border-amber-900/30">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wide block mb-2 flex items-center justify-between">
                  <span>📜 Cartes Civilisation de la Tribu ({displayPlayer.civilizationCards.length})</span>
                  <span className="text-[10px] text-stone-400 font-normal">Effets de fin de partie actifs</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
                  {displayPlayer.civilizationCards.map((c, idx) => {
                    const isGreenCard = c.bottomBonus.type === 'green';
                    const greenMeta = isGreenCard ? GREEN_SYMBOLS.find(s => s.id === c.bottomBonus.greenSymbol) : null;
                    const multType = c.bottomBonus.sandType;
                    const multIcon = multType === 'shaman' ? '🧙' : multType === 'farmer' ? '🌾' : multType === 'tool_maker' ? '🔨' : '🏛️';

                    return (
                      <div
                        key={`${c.id}-${idx}`}
                        className={`p-2 rounded-xl border flex flex-col justify-between text-xs transition-all ${
                          isGreenCard 
                            ? 'bg-emerald-950/60 border-emerald-600/70 hover:border-emerald-400' 
                            : 'bg-amber-950/60 border-amber-600/70 hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="font-black text-[11px] text-stone-100 truncate" title={c.name}>{c.name}</span>
                          <span className={`text-[9px] font-mono font-bold px-1 rounded ${
                            isGreenCard ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            #{idx + 1}
                          </span>
                        </div>
                        <div className="pt-1 border-t border-stone-800/80 flex items-center gap-1.5">
                          {isGreenCard ? (
                            <>
                              <span className="text-base">{greenMeta?.icon || '🌿'}</span>
                              <div className="min-w-0">
                                <span className="text-[9px] text-emerald-400 font-bold block truncate">Vert (K²)</span>
                                <span className="text-[10px] font-bold text-stone-200 truncate block">{greenMeta?.label}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <span className="text-base">{multIcon}</span>
                              <div className="min-w-0">
                                <span className="text-[9px] text-amber-400 font-bold block truncate">
                                  ×{c.bottomBonus.sandMultiplier || 1} {c.bottomBonus.sandType === 'shaman' ? 'Chaman' : c.bottomBonus.sandType === 'farmer' ? 'Fermier' : c.bottomBonus.sandType === 'tool_maker' ? 'Outils' : 'Bâtisseur'}
                                </span>
                                <span className="text-[9px] text-stone-300 truncate block">
                                  {c.bottomBonus.sandType === 'shaman' ? 'Population' : c.bottomBonus.sandType === 'farmer' ? 'Agriculture' : c.bottomBonus.sandType === 'tool_maker' ? 'Outils' : 'Bâtiments'}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* COLLAPSIBLE RIVAL TRIBES BAR */}
      {showRivals && (
        <div className="rounded-2xl bg-stone-950/90 border border-stone-800 p-3 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Tribus Adversaires (Surveillance)
            </span>
            <span className="text-[10px] text-stone-500">
              Cliquez à nouveau pour replier
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {rivalPlayers.map(p => (
              <div 
                key={p.id}
                className="bg-stone-900/80 border border-stone-800 rounded-xl p-2.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MeepleIcon color={p.color} size={20} />
                    <span className="font-bold text-sm text-stone-200">{p.name}</span>
                    {p.isAi && <Bot className="w-3 h-3 text-stone-500" />}
                  </div>
                  <span className="bg-amber-500/15 text-amber-300 font-black text-xs px-2 py-0.5 rounded-full border border-amber-500/30">
                    {p.victoryPoints} VP
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1 text-center text-xs">
                  <div className="bg-stone-950/60 p-1 rounded border border-stone-800/80">
                    <span className="text-[9px] text-stone-500 block">Bois</span>
                    <span className="font-bold text-amber-300">{p.resources.wood}</span>
                  </div>
                  <div className="bg-stone-950/60 p-1 rounded border border-stone-800/80">
                    <span className="text-[9px] text-stone-500 block">Glaise</span>
                    <span className="font-bold text-orange-400">{p.resources.clay}</span>
                  </div>
                  <div className="bg-stone-950/60 p-1 rounded border border-stone-800/80">
                    <span className="text-[9px] text-stone-500 block">Pierre</span>
                    <span className="font-bold text-slate-300">{p.resources.stone}</span>
                  </div>
                  <div className="bg-stone-950/60 p-1 rounded border border-stone-800/80">
                    <span className="text-[9px] text-stone-500 block">Or</span>
                    <span className="font-bold text-yellow-300">{p.resources.gold}</span>
                  </div>
                  <div className="bg-stone-950/60 p-1 rounded border border-stone-800/80">
                    <span className="text-[9px] text-stone-500 block">Nourr.</span>
                    <span className="font-bold text-amber-400">{p.food}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-400 mt-2 pt-1.5 border-t border-stone-800/60">
                  <span>👥 {p.availableMeeples}/{p.totalMeeples} ouvriers</span>
                  <span>🌾 Champs : {p.agriculture}</span>
                  <span>🔨 Outils : +{p.toolTiles.reduce((s, t) => s + t, 0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
