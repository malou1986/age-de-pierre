import React, { useState } from 'react';
import { GameState, PlayerState, ResourceType } from '../../types/game';
import { RESOURCE_NAMES, RESOURCE_VALUES } from '../../data/buildings';
import { GREEN_SYMBOLS, SAND_FIGURES } from '../../data/cards';
import { ResourceIcon } from '../Common/ResourceIcon';
import { 
  X, 
  Crown, 
  Wheat, 
  Wrench, 
  Users, 
  Scroll, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles,
  Layers,
  ChevronLeft
} from 'lucide-react';

interface MobileTribalDrawerProps {
  state: GameState;
  activePlayer: PlayerState;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const MobileTribalDrawer: React.FC<MobileTribalDrawerProps> = ({
  state,
  activePlayer,
  isOpen,
  onToggle,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'resources' | 'engine' | 'cards' | 'rivals'>('resources');

  // Human player or active player
  const humanPlayer = state.players.find(p => !p.isAi) || activePlayer;
  const p = activePlayer;

  // Tools calculation
  const totalTools = p.toolTiles.reduce((sum, t) => sum + t, 0);
  const usedTools = (p.toolsUsedThisRound || []).reduce((sum, used, idx) => {
    return sum + (used ? (p.toolTiles[idx] || 0) : 0);
  }, 0);
  const availableTools = totalTools - usedTools;

  // Food calculation
  const foodDemand = p.totalMeeples;
  const foodFromFields = p.agriculture;
  const netFoodNeeded = Math.max(0, foodDemand - foodFromFields);
  const foodSurplus = p.food - netFoodNeeded;
  const isFoodSafe = foodSurplus >= 0;

  // Green symbols
  const distinctGreenSymbols = new Set(
    p.civilizationCards
      .filter(c => c.bottomBonus.type === 'green')
      .map(c => c.bottomBonus.greenSymbol)
  );
  const greenScorePreview = Math.pow(distinctGreenSymbols.size, 2);

  // Sand multipliers
  const sandStats = {
    shaman: p.civilizationCards
      .filter(c => c.bottomBonus.type === 'sand' && c.bottomBonus.sandType === 'shaman')
      .reduce((s, c) => s + (c.bottomBonus.sandMultiplier || 1), 0),
    farmer: p.civilizationCards
      .filter(c => c.bottomBonus.type === 'sand' && c.bottomBonus.sandType === 'farmer')
      .reduce((s, c) => s + (c.bottomBonus.sandMultiplier || 1), 0),
    tool_maker: p.civilizationCards
      .filter(c => c.bottomBonus.type === 'sand' && c.bottomBonus.sandType === 'tool_maker')
      .reduce((s, c) => s + (c.bottomBonus.sandMultiplier || 1), 0),
    builder: p.civilizationCards
      .filter(c => c.bottomBonus.type === 'sand' && c.bottomBonus.sandType === 'builder')
      .reduce((s, c) => s + (c.bottomBonus.sandMultiplier || 1), 0),
  };

  const rivalPlayers = state.players.filter(other => other.id !== p.id);

  return (
    <>
      {/* 1. COMPACT DOCKED MINI-HUD (VISIBLE WHEN DRAWER IS CLOSED) */}
      {!isOpen && (
        <div className="fixed top-16 right-2 sm:right-4 z-40 flex items-center gap-1.5 bg-stone-950/90 backdrop-blur-md border-2 border-amber-500/70 py-1.5 px-3 rounded-2xl shadow-2xl">
          {/* Quick resource chips */}
          <div className="flex items-center gap-2 text-xs font-black">
            <span className="flex items-center gap-0.5 text-amber-200">
              <span>🪵</span>{p.resources.wood}
            </span>
            <span className="flex items-center gap-0.5 text-orange-300">
              <span>🧱</span>{p.resources.clay}
            </span>
            <span className="flex items-center gap-0.5 text-stone-300">
              <span>🪨</span>{p.resources.stone}
            </span>
            <span className="flex items-center gap-0.5 text-yellow-300">
              <span>✨</span>{p.resources.gold}
            </span>
            <span className="text-stone-600">|</span>
            <span className="flex items-center gap-0.5 text-emerald-400">
              <span>🍗</span>{p.food}
            </span>
            <span className="flex items-center gap-0.5 text-purple-300 hidden xs:flex">
              <span>👥</span>{p.availableMeeples}/{p.totalMeeples}
            </span>
          </div>

          {/* Slide-out Trigger Button */}
          <button
            onClick={onToggle}
            className="ml-1 px-2.5 py-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
            title="Ouvrir le coffre et les réserves de tribu"
          >
            <span>Tribu</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. BACKDROP OVERLAY WHEN OPEN */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        />
      )}

      {/* 3. SLIDE-OUT TRIBAL DRAWER */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[410px] bg-stone-950/95 backdrop-blur-md border-l-2 border-amber-600/70 shadow-2xl flex flex-col text-stone-100 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <span
              className="w-4 h-4 rounded-full border border-stone-300 shadow"
              style={{
                backgroundColor:
                  p.color === 'red' ? '#dc2626' : p.color === 'blue' ? '#2563eb' : p.color === 'yellow' ? '#d97706' : '#16a34a',
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-amber-200">{p.name}</h3>
                {state.firstPlayerIndex === state.players.findIndex(pl => pl.id === p.id) && (
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />
                )}
              </div>
              <span className="text-[11px] text-stone-400">
                ⭐ {p.victoryPoints} pts de victoire • {p.availableMeeples} ouvrier(s) libre(s)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 border-b border-stone-800 bg-stone-950/80 text-xs font-bold text-center">
          <button
            onClick={() => setActiveTab('resources')}
            className={`py-2.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'resources'
                ? 'border-amber-500 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Matières
          </button>
          <button
            onClick={() => setActiveTab('engine')}
            className={`py-2.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'engine'
                ? 'border-amber-500 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Village
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`py-2.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'cards'
                ? 'border-amber-500 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Cartes ({p.civilizationCards.length})
          </button>
          <button
            onClick={() => setActiveTab('rivals')}
            className={`py-2.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'rivals'
                ? 'border-amber-500 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Rivaux ({rivalPlayers.length})
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: RESSOURCES & NOURRITURE */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              {/* 4 Primary Resources Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {(['wood', 'clay', 'stone', 'gold'] as ResourceType[]).map(r => {
                  const meta = RESOURCE_NAMES[r];
                  const count = p.resources[r];
                  const val = RESOURCE_VALUES[r];

                  return (
                    <div
                      key={r}
                      className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 flex items-center justify-between shadow"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{meta.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-stone-200">{meta.name}</div>
                          <div className="text-[10px] text-stone-400">Diviseur: ÷{val}</div>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-amber-400">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Hunger & Food Meter */}
              <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-2.5 shadow">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-300 flex items-center gap-1.5">
                    <span>🍗</span>
                    <span>Nourriture de la Tribu</span>
                  </span>
                  <span className={`font-black ${isFoodSafe ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isFoodSafe ? 'Sécurité alimentaire' : 'Famine imminente !'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs bg-stone-950 p-2.5 rounded-xl border border-stone-800/80">
                  <div className="text-stone-400">
                    Stock : <strong className="text-amber-300">{p.food}</strong>
                  </div>
                  <div className="text-stone-400">
                    Champs : <strong className="text-emerald-400">+{p.agriculture}</strong>
                  </div>
                  <div className="text-stone-400">
                    Bouche(s) : <strong className="text-stone-200">{foodDemand}</strong>
                  </div>
                </div>

                <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                  {isFoodSafe ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{foodSurplus} nourriture(s) en réserve après le repas.</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="text-red-300">
                        Déficit de {Math.abs(foodSurplus)} nourriture ! Prévoyez des ressources ou perdez 10 PV.
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VILLAGE & OUTILS */}
          {activeTab === 'engine' && (
            <div className="space-y-4">
              {/* Meeples & Population */}
              <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-2 shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Population de la Tribu</span>
                  </span>
                  <span className="text-xs font-black text-amber-400">
                    {p.availableMeeples} libre(s) / {p.totalMeeples} total
                  </span>
                </div>

                {p.newMeepleNextRound && (
                  <div className="bg-emerald-950/70 border border-emerald-700/80 p-2 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Un nouvel ouvrier rejoindra votre tribu au prochain tour !</span>
                  </div>
                )}
              </div>

              {/* Agriculture Track */}
              <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-2.5 shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                    <Wheat className="w-4 h-4 text-emerald-400" />
                    <span>Piste d’Agriculture</span>
                  </span>
                  <span className="text-sm font-black text-emerald-400">{p.agriculture} / 10</span>
                </div>

                <div className="w-full bg-stone-950 h-3 rounded-full overflow-hidden border border-stone-800">
                  <div
                    className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(p.agriculture / 10) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-stone-400">
                  Fournit {p.agriculture} nourriture(s) gratuite(s) à chaque phase de repas.
                </div>
              </div>

              {/* Tool Tiles */}
              <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-3 shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-blue-400" />
                    <span>Atelier d’Outils ({availableTools} dispo)</span>
                  </span>
                  <span className="text-xs font-mono text-stone-400">Valeur: {totalTools}</span>
                </div>

                <div className="flex gap-2">
                  {p.toolTiles.map((val, idx) => {
                    const isUsed = p.toolsUsedThisRound[idx];
                    return (
                      <div
                        key={idx}
                        className={`flex-1 p-2.5 rounded-xl border text-center font-bold text-xs ${
                          val === 0
                            ? 'bg-stone-950/40 border-stone-800 text-stone-600'
                            : isUsed
                            ? 'bg-stone-950 border-stone-800 text-stone-500 opacity-60'
                            : 'bg-stone-900 border-blue-500/70 text-blue-200 shadow'
                        }`}
                      >
                        <div className="text-[10px] uppercase text-stone-400">Tuile #{idx + 1}</div>
                        <div className="text-lg font-black">{val > 0 ? `+${val}` : '-'}</div>
                        <div className="text-[9px] text-stone-400">{isUsed ? 'Utilisée' : 'Prête'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CARTES CIVILISATION & BÂTIMENTS */}
          {activeTab === 'cards' && (
            <div className="space-y-4">
              {/* Culture Symbols (Green Cards) */}
              <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-2.5 shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Scroll className="w-4 h-4 text-emerald-400" />
                    <span>Symboles Verts ({distinctGreenSymbols.size} / 8)</span>
                  </span>
                  <span className="text-xs font-black text-amber-400">+{greenScorePreview} VP fin de partie</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {GREEN_SYMBOLS.map(sym => {
                    const hasSymbol = distinctGreenSymbols.has(sym.id);
                    return (
                      <div
                        key={sym.id}
                        className={`p-1.5 rounded-xl border text-center text-[10px] font-semibold ${
                          hasSymbol
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-200 shadow'
                            : 'bg-stone-950 border-stone-800 text-stone-600 opacity-50'
                        }`}
                      >
                        <div className="text-base">{sym.icon}</div>
                        <div className="truncate">{sym.label.split(' ')[0]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sand Multipliers */}
              <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-2 shadow">
                <span className="text-xs font-bold text-amber-300">Multiplicateurs de Personnages (Sable)</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-stone-950 p-2 rounded-xl border border-stone-800">
                    <div className="text-stone-400">🧙 Chamans (x Ouvriers)</div>
                    <div className="text-sm font-bold text-amber-400">{sandStats.shaman}x = {sandStats.shaman * p.totalMeeples} VP</div>
                  </div>
                  <div className="bg-stone-950 p-2 rounded-xl border border-stone-800">
                    <div className="text-stone-400 flex items-center gap-1">
                      <ResourceIcon type="agriculture" size="xs" />
                      <span>Fermiers (x Agri)</span>
                    </div>
                    <div className="text-sm font-bold text-amber-400">{sandStats.farmer}x = {sandStats.farmer * p.agriculture} VP</div>
                  </div>
                  <div className="bg-stone-950 p-2 rounded-xl border border-stone-800">
                    <div className="text-stone-400 flex items-center gap-1">
                      <ResourceIcon type="tool" size="xs" />
                      <span>Fabricants (x Outils)</span>
                    </div>
                    <div className="text-sm font-bold text-amber-400">{sandStats.tool_maker}x = {sandStats.tool_maker * totalTools} VP</div>
                  </div>
                  <div className="bg-stone-950 p-2 rounded-xl border border-stone-800">
                    <div className="text-stone-400 flex items-center gap-1">
                      <ResourceIcon type="building" size="xs" />
                      <span>Bâtisseurs (x Bâtiments)</span>
                    </div>
                    <div className="text-sm font-bold text-amber-400">{sandStats.builder}x = {sandStats.builder * p.buildings.length} VP</div>
                  </div>
                </div>
              </div>

              {/* Built Buildings */}
              <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-2 shadow">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-300 flex items-center gap-1.5">
                    <ResourceIcon type="building" size="xs" />
                    <span>Bâtiments Construits ({p.buildings.length})</span>
                  </span>
                  <span className="font-bold text-amber-400">
                    {p.buildings.reduce((sum, b) => sum + (b.victoryPoints || 0), 0)} VP
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRIBUS RIVALES */}
          {activeTab === 'rivals' && (
            <div className="space-y-3">
              {rivalPlayers.map(r => (
                <div
                  key={r.id}
                  className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3.5 space-y-2 shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-stone-400"
                        style={{
                          backgroundColor:
                            r.color === 'red' ? '#dc2626' : r.color === 'blue' ? '#2563eb' : r.color === 'yellow' ? '#d97706' : '#16a34a',
                        }}
                      />
                      <span className="font-bold text-sm text-stone-200">{r.name}</span>
                    </div>
                    <span className="text-xs font-black text-amber-400">⭐ {r.victoryPoints} VP</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-[11px] bg-stone-950 p-2 rounded-xl text-center border border-stone-800/80">
                    <div>👥 {r.totalMeeples}</div>
                    <div>🌾 {r.agriculture}</div>
                    <div>🔨 {r.toolTiles.reduce((a, b) => a + b, 0)}</div>
                    <div>📜 {r.civilizationCards.length}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
