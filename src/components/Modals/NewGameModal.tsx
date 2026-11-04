import React, { useState } from 'react';
import { GameSettings, GameVariants, PlayerColor } from '../../types/game';
import { MeepleIcon } from '../Meeples';
import { Users, Bot, Play, Scale, Check, X, Dices, Sparkles, User, RefreshCw } from 'lucide-react';

interface NewGameModalProps {
  initialSettings?: GameSettings;
  onStart: (settings: GameSettings) => void;
  onClose?: () => void;
}

const COLORS: PlayerColor[] = ['red', 'blue', 'yellow', 'green'];

export const PREHISTORIC_NAMES: string[] = [
  'Rahan',
  'Ayla',
  'Naoh',
  'Crao',
  'Tara',
  'Brout',
  'Tounga',
  'Krom',
  'Silex',
  'Loup-Gris',
  'Lune-Rousse',
  'Feu-Sacré',
  'Mammouth',
  'Aghoo',
  'Dent-de-Sabre',
  'Ouga',
  'Chaka',
  'Gorg',
  'Sapiens',
  'Bison-Blanc',
];

export const NewGameModal: React.FC<NewGameModalProps> = ({
  initialSettings,
  onStart,
  onClose,
}) => {
  const [playerCount, setPlayerCount] = useState<number>(initialSettings?.playerCount || 4);
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState<number>(0);
  
  const [players, setPlayers] = useState(() => {
    const defaultRoster = [
      { name: 'Rahan', color: 'red' as PlayerColor, isAi: false, aiDifficulty: 'normal' as const },
      { name: 'Ayla', color: 'blue' as PlayerColor, isAi: true, aiDifficulty: 'normal' as const },
      { name: 'Naoh', color: 'yellow' as PlayerColor, isAi: true, aiDifficulty: 'hard' as const },
      { name: 'Crao', color: 'green' as PlayerColor, isAi: true, aiDifficulty: 'easy' as const },
    ];
    if (initialSettings?.players && initialSettings.players.length >= 2) {
      return defaultRoster.map((def, idx) => {
        const existing = initialSettings.players[idx];
        if (existing) {
          return {
            name: existing.name || def.name,
            color: existing.color || def.color,
            isAi: existing.isAi ?? (idx > 0),
            aiDifficulty: existing.aiDifficulty || def.aiDifficulty,
          };
        }
        return def;
      });
    }
    return defaultRoster;
  });

  const [variants, setVariants] = useState<GameVariants>(initialSettings?.variants || {
    firstTurnCourtesy: true,
    startingCompensation: true,
    twoPilesEnd: true,
    completeCycleEnd: true,
  });

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    if (selectedPlayerIdx >= count) {
      setSelectedPlayerIdx(0);
    }
  };

  const updatePlayer = (index: number, updates: Partial<(typeof players)[0]>) => {
    setPlayers(players.map((p, i) => (i === index ? { ...p, ...updates } : p)));
  };

  const handleColorChange = (index: number, newColor: PlayerColor) => {
    const currentOwnerIdx = players.findIndex(p => p.color === newColor);
    if (currentOwnerIdx !== -1 && currentOwnerIdx !== index) {
      // Swap colors cleanly so every player has a unique color
      const oldColor = players[index].color;
      setPlayers(players.map((p, i) => {
        if (i === index) return { ...p, color: newColor };
        if (i === currentOwnerIdx) return { ...p, color: oldColor };
        return p;
      }));
    } else {
      updatePlayer(index, { color: newColor });
    }
  };

  // Roll a unique random prehistoric name for a single player
  const rollRandomNameForPlayer = (index: number) => {
    const activeNames = players.slice(0, playerCount).map((p, i) => (i !== index ? p.name : ''));
    const pool = PREHISTORIC_NAMES.filter(n => !activeNames.includes(n));
    const chosen = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : PREHISTORIC_NAMES[Math.floor(Math.random() * PREHISTORIC_NAMES.length)];
    updatePlayer(index, { name: chosen });
  };

  // Roll unique prehistoric names for all active players
  const rollRandomNamesForAll = () => {
    const shuffled = [...PREHISTORIC_NAMES].sort(() => Math.random() - 0.5);
    setPlayers(prev =>
      prev.map((p, i) => {
        if (i < playerCount) {
          return { ...p, name: shuffled[i] || `Chef ${i + 1}` };
        }
        return p;
      })
    );
  };

  // Assign a preset name from the catalog to the currently selected player
  const applyPresetName = (name: string) => {
    const targetIdx = selectedPlayerIdx < playerCount ? selectedPlayerIdx : 0;
    updatePlayer(targetIdx, { name });
  };

  const handleStart = () => {
    // If player name is empty, fallback to a sensible name
    const preparedPlayers = players.slice(0, playerCount).map((p, i) => ({
      ...p,
      name: p.name.trim() || (i === 0 ? 'Chef Tribal' : PREHISTORIC_NAMES[i] || `Joueur ${i + 1}`),
    }));

    onStart({
      playerCount,
      players: preparedPlayers,
      variants,
    });
  };

  const setOfficialRules = () => {
    setVariants({
      firstTurnCourtesy: false,
      startingCompensation: false,
      twoPilesEnd: false,
      completeCycleEnd: false,
    });
  };

  const setBalancedPack = () => {
    setVariants({
      firstTurnCourtesy: true,
      startingCompensation: true,
      twoPilesEnd: true,
      completeCycleEnd: true,
    });
  };

  const activeSelectedPlayer = players[selectedPlayerIdx] || players[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="bg-stone-900 border-2 border-amber-600/80 rounded-2xl sm:rounded-3xl max-w-xl landscape:max-w-4xl w-full text-stone-100 shadow-2xl flex flex-col max-h-[96vh] sm:max-h-[92vh] overflow-hidden">
        
        {/* Pinned Header (Never cut off) */}
        <div className="shrink-0 flex items-center justify-between border-b border-stone-800 px-3.5 py-2.5 sm:px-5 sm:py-3 bg-stone-900/90 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 sm:p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-200 leading-tight">
                Configuration de la Partie
              </h3>
              <p className="text-[10px] sm:text-xs text-stone-400 hidden sm:block">
                Personnalisez vos chefs de tribu, intelligences artificielles et variantes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={rollRandomNamesForAll}
              className="px-2.5 py-1 rounded-lg border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              title="Donner un nom préhistorique aléatoire à tous les chefs de tribu"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Noms aléatoires</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Body (Fits landscape smartphone screen height) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-3.5 landscape:space-y-0 landscape:grid landscape:grid-cols-2 landscape:gap-4 pr-1.5 sm:pr-2">
          
          {/* COLUMN 1: Player Count & Player Roster */}
          <div className="space-y-3">
            {/* Player Count Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                Nombre de joueurs :
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4].map(count => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handlePlayerCountChange(count)}
                    className={`py-2 rounded-xl border font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      playerCount === count
                        ? 'bg-amber-500 border-amber-300 text-stone-950 shadow-md ring-2 ring-amber-400/50'
                        : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{count} Joueurs</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Players List with Name Customization */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Chefs de Tribu & Personnages :
                </label>
                <span className="text-[10px] text-amber-400/90 font-medium">
                  Tapez un nom ou cliquez 🎲
                </span>
              </div>

              <div className="space-y-2">
                {players.slice(0, playerCount).map((p, idx) => {
                  const isSelected = selectedPlayerIdx === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedPlayerIdx(idx)}
                      className={`bg-stone-950 rounded-xl p-2.5 sm:p-3 border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500/80 ring-1 ring-amber-400/40 bg-stone-950/90'
                          : 'border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      {/* Top Row: Avatar, Name Input, Dice button, and Color Pickers */}
                      <div className="flex items-center gap-2">
                        <div className="shrink-0 flex items-center justify-center">
                          <MeepleIcon color={p.color} size={26} />
                        </div>

                        {/* Name Input with Direct Editing */}
                        <div className="flex-1 relative flex items-center">
                          <input
                            type="text"
                            value={p.name}
                            onChange={e => updatePlayer(idx, { name: e.target.value })}
                            onFocus={() => setSelectedPlayerIdx(idx)}
                            placeholder={`Nom du Chef ${idx + 1}...`}
                            maxLength={20}
                            className="w-full bg-stone-900 border border-stone-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 rounded-lg pl-2 pr-7 py-1 text-xs sm:text-sm font-bold text-stone-100 placeholder:text-stone-600 focus:outline-none transition-colors"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              rollRandomNameForPlayer(idx);
                            }}
                            className="absolute right-1 text-stone-400 hover:text-amber-300 p-1 rounded hover:bg-stone-800 transition-colors cursor-pointer"
                            title="Tirer un nom préhistorique au sort pour ce personnage"
                          >
                            <Dices className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Color Picker Swatches */}
                        <div className="flex items-center gap-1 bg-stone-900/90 px-1.5 py-1 rounded-xl border border-stone-800 shrink-0">
                          {COLORS.map(c => {
                            const isColorSelected = p.color === c;
                            const colorBg =
                              c === 'red' ? '#dc2626' : c === 'blue' ? '#2563eb' : c === 'yellow' ? '#eab308' : '#16a34a';
                            const colorName =
                              c === 'red' ? 'Rouge' : c === 'blue' ? 'Bleu' : c === 'yellow' ? 'Jaune' : 'Vert';
                            return (
                              <button
                                key={c}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleColorChange(idx, c);
                                }}
                                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                                  isColorSelected ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-35 hover:opacity-90'
                                }`}
                                style={{ backgroundColor: colorBg }}
                                title={`Attribuer la couleur ${colorName}`}
                              >
                                {isColorSelected && (
                                  <span className="text-stone-950 text-[9px] font-black leading-none">✓</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Bottom Row: Human vs AI and AI Difficulty */}
                      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-stone-900 text-xs">
                        <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
                          <span className="font-semibold text-stone-300">
                            {idx === 0 ? 'Joueur 1 (Principal)' : `Joueur ${idx + 1}`} :
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updatePlayer(idx, { isAi: !p.isAi });
                            }}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                              p.isAi
                                ? 'bg-blue-950/80 border border-blue-700 text-blue-300'
                                : 'bg-emerald-950/80 border border-emerald-700 text-emerald-300'
                            }`}
                          >
                            {p.isAi ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                            <span>{p.isAi ? 'Robot IA' : 'Humain'}</span>
                          </button>

                          {p.isAi && (
                            <select
                              value={p.aiDifficulty}
                              onChange={(e) => {
                                e.stopPropagation();
                                updatePlayer(idx, { aiDifficulty: e.target.value as any });
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-stone-900 border border-stone-700 text-stone-200 text-[11px] rounded-lg px-2 py-0.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                            >
                              <option value="easy">Facile</option>
                              <option value="normal">Équilibré</option>
                              <option value="hard">Malin</option>
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLUMN 2: Prehistoric Name Suggestions & Balancing Variants */}
          <div className="space-y-3">
            {/* Quick Prehistoric Name Chooser Palette */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-2.5 sm:p-3 space-y-2">
              <div className="flex items-center justify-between border-b border-stone-800/80 pb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Suggestions pour : <strong className="text-white underline">{activeSelectedPlayer?.name || 'Joueur'}</strong></span>
                </span>
                <span className="text-[10px] text-stone-500">
                  Cliquez pour appliquer
                </span>
              </div>

              {/* Name Chips Grid */}
              <div className="flex flex-wrap gap-1.5 max-h-24 landscape:max-h-28 overflow-y-auto py-0.5">
                {PREHISTORIC_NAMES.map(name => {
                  const isCurrent = activeSelectedPlayer?.name === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => applyPresetName(name)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-500 text-stone-950 font-black shadow-sm ring-1 ring-amber-300'
                          : 'bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 hover:border-amber-500/50'
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Balanced Variants Section */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-2.5 sm:p-3 space-y-2">
              <div className="flex items-center justify-between border-b border-stone-800/80 pb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  Variantes d'équilibrage
                </span>
                <div className="flex gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={setBalancedPack}
                    className="text-amber-300 hover:underline font-bold cursor-pointer"
                  >
                    Pack Idéal
                  </button>
                  <span className="text-stone-600">•</span>
                  <button
                    type="button"
                    onClick={setOfficialRules}
                    className="text-stone-400 hover:underline cursor-pointer"
                  >
                    Règles Officielles
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                <label className="flex items-start gap-2 bg-stone-900/60 p-2 rounded-xl border border-stone-800/80 cursor-pointer hover:border-stone-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={variants.firstTurnCourtesy}
                    onChange={e => setVariants({ ...variants, firstTurnCourtesy: e.target.checked })}
                    className="mt-0.5 rounded text-amber-500 focus:ring-0"
                  />
                  <div>
                    <strong className="text-stone-200 block text-[11px] leading-tight">Courtoisie Tour 1</strong>
                    <span className="text-stone-400 text-[9px] leading-none">3 cases village ouvertes</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 bg-stone-900/60 p-2 rounded-xl border border-stone-800/80 cursor-pointer hover:border-stone-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={variants.startingCompensation}
                    onChange={e => setVariants({ ...variants, startingCompensation: e.target.checked })}
                    className="mt-0.5 rounded text-amber-500 focus:ring-0"
                  />
                  <div>
                    <strong className="text-stone-200 block text-[11px] leading-tight">Compensation départ</strong>
                    <span className="text-stone-400 text-[9px] leading-none">Bonus ressource pour J2/J3</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 bg-stone-900/60 p-2 rounded-xl border border-stone-800/80 cursor-pointer hover:border-stone-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={variants.twoPilesEnd}
                    onChange={e => setVariants({ ...variants, twoPilesEnd: e.target.checked })}
                    className="mt-0.5 rounded text-amber-500 focus:ring-0"
                  />
                  <div>
                    <strong className="text-stone-200 block text-[11px] leading-tight">Fin à 2 piles vides</strong>
                    <span className="text-stone-400 text-[9px] leading-none">Évite les fins prématurées</span>
                  </div>
                </label>

                <label className="flex items-start gap-2 bg-stone-900/60 p-2 rounded-xl border border-stone-800/80 cursor-pointer hover:border-stone-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={variants.completeCycleEnd}
                    onChange={e => setVariants({ ...variants, completeCycleEnd: e.target.checked })}
                    className="mt-0.5 rounded text-amber-500 focus:ring-0"
                  />
                  <div>
                    <strong className="text-stone-200 block text-[11px] leading-tight">Cycle complet</strong>
                    <span className="text-stone-400 text-[9px] leading-none">Même nombre de tours 1er J</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Pinned Footer (100% accessible on smartphone in landscape) */}
        <div className="shrink-0 p-2.5 sm:p-4 bg-stone-950/95 border-t border-stone-800/90 flex items-center justify-between gap-3 z-10">
          <button
            type="button"
            onClick={rollRandomNamesForAll}
            className="px-3 py-2.5 rounded-xl border border-stone-800 bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
            title="Mélanger tous les noms des joueurs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Mélanger les noms</span>
            <span className="sm:hidden">Noms 🎲</span>
          </button>

          <button
            type="button"
            onClick={handleStart}
            className="flex-1 py-2.5 sm:py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black rounded-xl sm:rounded-2xl shadow-xl transition-transform active:scale-98 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer ring-2 ring-amber-400/40"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            <span>Commencer la Partie</span>
          </button>
        </div>
      </div>
    </div>
  );
};
