import React, { useState } from 'react';
import { 
  GameSettings, 
  GameVariants, 
  GameExpansionsConfig, 
  GraphicEdition, 
  PlayerColor 
} from '../../types/game';
import { MeepleIcon } from '../Meeples';
import { 
  Users, 
  Bot, 
  Play, 
  Scale, 
  X, 
  Dices, 
  Sparkles, 
  User, 
  RefreshCw, 
  Layers, 
  Palette, 
  HelpCircle 
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'roster' | 'expansions'>('roster');
  const [playerCount, setPlayerCount] = useState<number>(initialSettings?.playerCount || 4);
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState<number>(0);
  const [edition, setEdition] = useState<GraphicEdition>(initialSettings?.edition || 'modern');

  const [expansions, setExpansions] = useState<GameExpansionsConfig>(initialSettings?.expansions || {
    newHuts: true,         // Recommandé & activé par défaut
    styleIsTheGoal: false,
    mammothHerd: false,
  });

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

  const rollRandomNameForPlayer = (index: number) => {
    const activeNames = players.slice(0, playerCount).map((p, i) => (i !== index ? p.name : ''));
    const pool = PREHISTORIC_NAMES.filter(n => !activeNames.includes(n));
    const chosen = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : PREHISTORIC_NAMES[Math.floor(Math.random() * PREHISTORIC_NAMES.length)];
    updatePlayer(index, { name: chosen });
  };

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

  const applyPresetName = (name: string) => {
    const targetIdx = selectedPlayerIdx < playerCount ? selectedPlayerIdx : 0;
    updatePlayer(targetIdx, { name });
  };

  const handleStart = () => {
    const preparedPlayers = players.slice(0, playerCount).map((p, i) => ({
      ...p,
      name: p.name.trim() || (i === 0 ? 'Chef Tribal' : PREHISTORIC_NAMES[i] || `Joueur ${i + 1}`),
    }));

    onStart({
      playerCount,
      players: preparedPlayers,
      variants,
      expansions,
      edition,
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
  const activeExpansionsCount = Object.values(expansions).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="bg-stone-900 border-2 border-amber-600/80 rounded-2xl sm:rounded-3xl max-w-xl landscape:max-w-4xl w-full text-stone-100 shadow-2xl flex flex-col max-h-[96vh] sm:max-h-[92vh] overflow-hidden">
        
        {/* Pinned Header */}
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
                Personnalisez vos chefs de tribu, intelligences artificielles et extensions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Tab Switcher Pills */}
        <div className="shrink-0 flex items-center gap-2 border-b border-stone-800 bg-stone-950/70 px-3.5 py-2 sm:px-5">
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-400/50'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>1. Tribus & Chefs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('expansions')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'expansions'
                ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-400/50'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. Extensions & Édition</span>
            {activeExpansionsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-stone-950 text-amber-300 border border-amber-600/60">
                {activeExpansionsCount}
              </span>
            )}
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-3.5 pr-1.5 sm:pr-2">
          
          {/* TAB 1: ROSTER & PLAYERS */}
          {activeTab === 'roster' && (
            <div className="space-y-3.5 landscape:space-y-0 landscape:grid landscape:grid-cols-2 landscape:gap-4">
              {/* COLUMN 1: Player Count & Player Roster */}
              <div className="space-y-3">
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
                      Chefs de Tribu :
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
                          <div className="flex items-center gap-2">
                            <div className="shrink-0 flex items-center justify-center">
                              <MeepleIcon color={p.color} size={26} />
                            </div>

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

                            <div className="flex items-center gap-1 bg-stone-900/90 px-1.5 py-1 rounded-xl border border-stone-800 shrink-0">
                              {COLORS.map(c => {
                                const isColorSelected = p.color === c;
                                const colorBg =
                                  c === 'red' ? '#dc2626' : c === 'blue' ? '#2563eb' : c === 'yellow' ? '#eab308' : '#16a34a';
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
                                  >
                                    {isColorSelected && (
                                      <span className="text-stone-950 text-[9px] font-black leading-none">✓</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

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

              {/* COLUMN 2: Suggestions de noms préhistoriques */}
              <div className="space-y-3">
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

                  <div className="flex flex-wrap gap-1.5 max-h-40 landscape:max-h-52 overflow-y-auto py-0.5">
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
              </div>
            </div>
          )}

          {/* TAB 2: EXTENSIONS & EDITIONS */}
          {activeTab === 'expansions' && (
            <div className="space-y-4 landscape:space-y-0 landscape:grid landscape:grid-cols-2 landscape:gap-4">
              
              {/* Left Column: Extensions Officielles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Extensions Modulaires :</span>
                  </label>
                  <span className="text-[10px] text-stone-400">Activables individuellement</span>
                </div>

                {/* 1. Les Nouvelles Huttes à Pouvoirs */}
                <div className={`p-3 rounded-2xl border transition-all ${
                  expansions.newHuts
                    ? 'bg-purple-950/40 border-purple-500/80 ring-1 ring-purple-400/40'
                    : 'bg-stone-950/80 border-stone-800'
                }`}>
                  <label className="flex items-start justify-between cursor-pointer">
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">🛖</span>
                        <strong className="text-stone-100 text-xs sm:text-sm font-bold">
                          Les Nouvelles Huttes à Pouvoirs
                        </strong>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-stone-300 leading-snug">
                        Ajoute 6 bâtiments spéciaux dotés de pouvoirs permanents ou immédiats (Serre, Crèche, Forge, Huttes de bois/glaise/pierre).
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={expansions.newHuts}
                      onChange={e => setExpansions({ ...expansions, newHuts: e.target.checked })}
                      className="w-5 h-5 rounded text-purple-600 focus:ring-0 mt-1 cursor-pointer"
                    />
                  </label>
                </div>

                {/* 2. Le Style, c'est le But */}
                <div className={`p-3 rounded-2xl border transition-all ${
                  expansions.styleIsTheGoal
                    ? 'bg-amber-950/40 border-amber-500/80 ring-1 ring-amber-400/40'
                    : 'bg-stone-950/80 border-stone-800'
                }`}>
                  <label className="flex items-start justify-between cursor-pointer">
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">💍</span>
                        <strong className="text-stone-100 text-xs sm:text-sm font-bold">
                          Le Style, c'est le But
                        </strong>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-stone-300 leading-snug">
                        Ajoute l'Échoppe du Marchand, la piste de troc (niveaux 0 à 10) et les parures/bijoux échangeables contre des ressources.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={expansions.styleIsTheGoal}
                      onChange={e => setExpansions({ ...expansions, styleIsTheGoal: e.target.checked })}
                      className="w-5 h-5 rounded text-amber-500 focus:ring-0 mt-1 cursor-pointer"
                    />
                  </label>
                </div>

                {/* 3. La Harde de Mammouths */}
                <div className={`p-3 rounded-2xl border transition-all ${
                  expansions.mammothHerd
                    ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-400/40'
                    : 'bg-stone-950/80 border-stone-800'
                }`}>
                  <label className="flex items-start justify-between cursor-pointer">
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">🦣</span>
                        <strong className="text-stone-100 text-xs sm:text-sm font-bold">
                          La Harde de Mammouths
                        </strong>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-stone-300 leading-snug">
                        Apprivoisement des mammouths contre de la nourriture, duels de dés et 16 tuiles récompenses exclusives (+10 VP final).
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={expansions.mammothHerd}
                      onChange={e => setExpansions({ ...expansions, mammothHerd: e.target.checked })}
                      className="w-5 h-5 rounded text-emerald-500 focus:ring-0 mt-1 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Right Column: Édition Graphique & Variantes */}
              <div className="space-y-3">
                {/* Choix d'Édition Graphique */}
                <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-2.5 sm:p-3 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    <span>Style & Édition Graphique :</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEdition('modern')}
                      className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        edition === 'modern'
                          ? 'bg-amber-950/50 border-amber-500 ring-2 ring-amber-400/50 text-amber-200'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <strong className="block text-xs font-bold">✨ Nouvelle Édition</strong>
                      <span className="text-[9px] block text-stone-400 leading-tight">Illustrations HD contemporaines</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEdition('classic')}
                      className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        edition === 'classic'
                          ? 'bg-amber-950/50 border-amber-500 ring-2 ring-amber-400/50 text-amber-200'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <strong className="block text-xs font-bold">📜 Édition Classique</strong>
                      <span className="text-[9px] block text-stone-400 leading-tight">Planches originales 2008</span>
                    </button>
                  </div>
                </div>

                {/* Variantes Compétitives */}
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
                        Standard
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <label className="flex items-start gap-1.5 bg-stone-900/60 p-2 rounded-xl border border-stone-800/80 cursor-pointer hover:border-stone-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={variants.firstTurnCourtesy}
                        onChange={e => setVariants({ ...variants, firstTurnCourtesy: e.target.checked })}
                        className="mt-0.5 rounded text-amber-500 focus:ring-0"
                      />
                      <div>
                        <strong className="text-stone-200 block text-[10px] leading-tight">Courtoisie T1</strong>
                        <span className="text-stone-400 text-[8px] leading-none">3 cases village</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-1.5 bg-stone-900/60 p-2 rounded-xl border border-stone-800/80 cursor-pointer hover:border-stone-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={variants.startingCompensation}
                        onChange={e => setVariants({ ...variants, startingCompensation: e.target.checked })}
                        className="mt-0.5 rounded text-amber-500 focus:ring-0"
                      />
                      <div>
                        <strong className="text-stone-200 block text-[10px] leading-tight">Compensation</strong>
                        <span className="text-stone-400 text-[8px] leading-none">Ressource J2/J3</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-1.5 bg-stone-900/60 p-2 rounded-xl border border-stone-800/80 cursor-pointer hover:border-stone-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={variants.twoPilesEnd}
                        onChange={e => setVariants({ ...variants, twoPilesEnd: e.target.checked })}
                        className="mt-0.5 rounded text-amber-500 focus:ring-0"
                      />
                      <div>
                        <strong className="text-stone-200 block text-[10px] leading-tight">2 Piles Vides</strong>
                        <span className="text-stone-400 text-[8px] leading-none">Fin plus stratégique</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-1.5 bg-stone-900/60 p-2 rounded-xl border border-stone-800/80 cursor-pointer hover:border-stone-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={variants.completeCycleEnd}
                        onChange={e => setVariants({ ...variants, completeCycleEnd: e.target.checked })}
                        className="mt-0.5 rounded text-amber-500 focus:ring-0"
                      />
                      <div>
                        <strong className="text-stone-200 block text-[10px] leading-tight">Cycle Complet</strong>
                        <span className="text-stone-400 text-[8px] leading-none">Tours strictement égaux</span>
                      </div>
                    </label>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Pinned Footer */}
        <div className="shrink-0 p-2.5 sm:p-4 bg-stone-950/95 border-t border-stone-800/90 flex items-center justify-between gap-3 z-10">
          <button
            type="button"
            onClick={rollRandomNamesForAll}
            className="px-3 py-2.5 rounded-xl border border-stone-800 bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
            title="Mélanger tous les noms des joueurs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Noms Aléatoires</span>
            <span className="sm:hidden">🎲</span>
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
