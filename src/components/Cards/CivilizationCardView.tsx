import React from 'react';
import { CivilizationCard, ResourceType } from '../../types/game';
import { ResourceIcon } from '../Common/ResourceIcon';
import { haptic } from '../../logic/haptics';

interface CivilizationCardViewProps {
  card: CivilizationCard;
  cost?: number; // 1, 2, 3, 4 resources
  size?: 'mini' | 'normal' | 'large';
  showCost?: boolean;
  className?: string;
}

const GREEN_SYMBOLS: Record<string, { label: string; icon: string }> = {
  writing: { label: 'Écriture', icon: '📜' },
  pottery: { label: 'Poterie', icon: '🏺' },
  transport: { label: 'Roue & Chariot', icon: '🪵' },
  weaving: { label: 'Tissage', icon: '🧶' },
  art: { label: 'Art Rupestre', icon: '🎨' },
  music: { label: 'Flûte & Musique', icon: '🎵' },
  medicine: { label: 'Médecine & Herbes', icon: '🌿' },
  sundial: { label: 'Astronomie & Cadran', icon: '☀️' },
};

const SAND_FIGURES: Record<string, { label: string; pluralLabel: string; icon: string; target: string; ruleText: string }> = {
  shaman: { 
    label: 'Chaman', 
    pluralLabel: 'Chamans', 
    icon: '🧙', 
    target: '× Ouvriers',
    ruleText: 'Multiplie le nombre total d’ouvriers (meeples) de votre tribu.'
  },
  farmer: { 
    label: 'Fermier', 
    pluralLabel: 'Fermiers', 
    icon: '🌾', 
    target: '× Agriculture',
    ruleText: 'Multiplie votre niveau sur la piste d’agriculture (0 à 10).'
  },
  tool_maker: { 
    label: 'Fabricant d’outils', 
    pluralLabel: 'Fabricants d’outils', 
    icon: '🔨', 
    target: '× Outils',
    ruleText: 'Multiplie la valeur totale combinée de vos tuiles d’outils (0 à 12).'
  },
  builder: { 
    label: 'Bâtisseur', 
    pluralLabel: 'Bâtisseurs', 
    icon: '🏛️', 
    target: '× Bâtiments',
    ruleText: 'Multiplie le nombre total de tuiles de bâtiments construits.'
  },
};

const getCardArtFallback = (card: CivilizationCard): string => {
  if (card.imageUrl) return card.imageUrl;
  if (card.id && card.id.startsWith('c_')) {
    return `/cards/peps/card_peps_${card.id.replace('c_', '')}.jpg`;
  }
  return '/cards/peps/card_peps_00.jpg';
};

export const CivilizationCardView: React.FC<CivilizationCardViewProps> = ({
  card,
  cost,
  size = 'normal',
  showCost = true,
  className = '',
}) => {
  const isMini = size === 'mini';
  const isLarge = size === 'large';
  const cardImage = card.imageUrl || card.classicImageUrl || getCardArtFallback(card);

  const isGreen = card.bottomBonus.type === 'green';
  const greenInfo = isGreen 
    ? (GREEN_SYMBOLS[card.bottomBonus.greenSymbol || ''] || { label: 'Culture', icon: '🌿' })
    : null;
  const sandInfo = !isGreen 
    ? (SAND_FIGURES[card.bottomBonus.sandType || ''] || { 
        label: 'Personnage', 
        pluralLabel: 'Personnages', 
        icon: '⏳', 
        target: '× Score',
        ruleText: 'Multiplie votre catégorie correspondante en fin de partie.'
      })
    : null;
  const mult = card.bottomBonus.sandMultiplier || 1;

  // --------------------------------------------------------------------------
  // TOP IMMEDIATE REWARD VISUAL
  // --------------------------------------------------------------------------
  const renderTopVisual = () => {
    const tb = card.topBonus;
    switch (tb.type) {
      case 'resource_fixed': {
        const resEntries = Object.entries(tb.resources || {}) as [ResourceType, number][];
        return (
          <div className="flex items-center justify-center gap-1.5 font-bold">
            {resEntries.map(([res, qty]) => (
              <span key={res} className="inline-flex items-center gap-1.5 bg-stone-900/95 px-2.5 py-1 rounded-xl text-amber-200 border border-amber-500/50 shadow-md">
                <ResourceIcon type={res} size="sm" />
                <span className="text-sm font-black text-amber-100">+{qty} {res === 'wood' ? 'Bois' : res === 'clay' ? 'Glaise' : res === 'stone' ? 'Pierre' : 'Or'}</span>
              </span>
            ))}
          </div>
        );
      }
      case 'food_fixed':
        return (
          <div className="inline-flex items-center gap-1.5 bg-amber-950/90 px-3 py-1.5 rounded-xl text-amber-200 font-bold border border-amber-600/70 shadow-md">
            <ResourceIcon type="food" size="sm" />
            <span className="text-sm font-black">+{tb.value} Nourritures immédiates</span>
          </div>
        );
      case 'agriculture':
        return (
          <div className="inline-flex items-center gap-1.5 bg-emerald-950/90 px-3 py-1.5 rounded-xl text-emerald-200 font-bold border border-emerald-500/70 shadow-md">
            <ResourceIcon type="agriculture" size="sm" />
            <span className="text-sm font-black">+1 Niveau d’Agriculture (Champ)</span>
          </div>
        );
      case 'tool_upgrade':
        return (
          <div className="inline-flex items-center gap-1.5 bg-cyan-950/90 px-3 py-1.5 rounded-xl text-cyan-200 font-bold border border-cyan-500/70 shadow-md">
            <ResourceIcon type="tool" size="sm" />
            <span className="text-sm font-black">+1 Outil permanent (Atelier)</span>
          </div>
        );
      case 'temp_tool':
        return (
          <div className="inline-flex items-center gap-1.5 bg-indigo-950/90 px-3 py-1.5 rounded-xl text-indigo-200 font-bold border border-indigo-500/70 shadow-md">
            <span className="text-base font-black">📯</span>
            <span className="text-sm font-black">+{tb.value} Outil temporaire (usage unique)</span>
          </div>
        );
      case 'victory_points':
        return (
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 px-3 py-1.5 rounded-xl text-amber-300 font-black border border-amber-400/60 shadow-md">
            <span className="text-base">⭐</span>
            <span className="text-sm font-black">+{tb.value} Points de Victoire directs</span>
          </div>
        );
      case 'dice_roll': {
        const rType = (tb.resourceType || 'wood') as ResourceType;
        const resLabel = rType === 'wood' ? 'Bois' : rType === 'clay' ? 'Glaise' : rType === 'stone' ? 'Pierre' : rType === 'gold' ? 'Or' : 'Nourriture';
        const div = rType === 'wood' ? '3' : rType === 'clay' ? '4' : rType === 'stone' ? '5' : rType === 'gold' ? '6' : '2';
        return (
          <div className="inline-flex items-center gap-2 bg-stone-900/90 px-3 py-1.5 rounded-xl text-amber-200 font-bold border border-amber-500/60 shadow-md">
            <span className="text-base">🎲🎲</span>
            <span className="text-sm font-black flex items-center gap-1">
              <span>Lancer 2 dés pour récolter :</span>
              <ResourceIcon type={rType} size="xs" />
              <span>{resLabel} (÷{div})</span>
            </span>
          </div>
        );
      }
      case 'dice_all_players':
        return (
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-950/90 to-indigo-950/90 px-3 py-1.5 rounded-xl text-purple-200 font-bold border border-purple-500/70 shadow-md">
            <span className="text-base">🎲</span>
            <span className="text-sm font-black">Dés pour tous les joueurs (Draft de dés) !</span>
          </div>
        );
      case 'draw_card':
        return (
          <div className="inline-flex items-center gap-2 bg-stone-900/90 px-3 py-1.5 rounded-xl text-amber-200 font-bold border border-amber-500/60 shadow-md">
            <span className="text-base">🎴</span>
            <span className="text-sm font-black">+1 Carte Civilisation piochée immédiatement</span>
          </div>
        );
      default:
        return <span className="text-xs text-stone-300">{tb.description}</span>;
    }
  };

  // --------------------------------------------------------------------------
  // BOTTOM END-GAME SCORING VISUAL
  // --------------------------------------------------------------------------
  const renderBottomVisual = () => {
    if (isGreen && greenInfo) {
      return (
        <div className="bg-gradient-to-r from-emerald-950/90 via-stone-900 to-emerald-950/90 border border-emerald-500/70 rounded-2xl p-3 shadow-inner space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl filter drop-shadow">{greenInfo.icon}</span>
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider block text-emerald-400 font-black">
                Collection Verte (Série Culturelle K²)
              </span>
              <div className="text-base font-black text-emerald-100 flex items-center gap-2">
                <span>{greenInfo.label}</span>
                <span className="text-xs bg-emerald-800/80 text-emerald-200 px-1.5 py-0.2 rounded font-black">
                  1 des 8 symboles
                </span>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-stone-300 bg-stone-950/60 p-2 rounded-xl border border-stone-800 leading-snug">
            Chaque symbole vert unique s'associe en série. Chaque série rapporte son nombre au carré : <br />
            <span className="font-mono text-emerald-300 font-bold">1=1, 2=4, 3=9, 4=16, 5=25, 6=36, 7=49, 8=64 PV !</span>
          </div>
        </div>
      );
    } else if (sandInfo) {
      return (
        <div className="bg-gradient-to-r from-amber-950/90 via-stone-900 to-amber-950/90 border border-amber-500/70 rounded-2xl p-3 shadow-inner space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl filter drop-shadow">{sandInfo.icon}</span>
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider block text-amber-400 font-black">
                Figure Sablée (Multiplicateur de Fin de Partie)
              </span>
              <div className="text-base font-black text-amber-100 flex items-center gap-2">
                <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-stone-950 font-black px-2 py-0.5 rounded-lg text-xs shadow">
                  {mult}×
                </span>
                <span>{mult > 1 ? sandInfo.pluralLabel : sandInfo.label}</span>
                <span className="text-xs text-amber-300/80">({sandInfo.target})</span>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-stone-300 bg-stone-950/60 p-2 rounded-xl border border-stone-800 leading-snug">
            {sandInfo.ruleText}
          </div>
        </div>
      );
    }
    return null;
  };

  // --------------------------------------------------------------------------
  // MINI TABLETOP / GRID / EMBEDDED VIEW
  // --------------------------------------------------------------------------
  if (isMini) {
    return (
      <div 
        onClick={() => haptic.tap()}
        className={`relative w-full h-full rounded-xl overflow-hidden select-none border-2 shadow-xl group transition-all duration-200 cursor-pointer ${
          isGreen ? 'border-emerald-500/80 hover:border-emerald-300' : 'border-amber-500/80 hover:border-amber-300'
        } ${className}`}
        style={{
          backgroundImage: `url(${cardImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#1c1917',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-transparent to-stone-950/90 pointer-events-none" />

        {/* Top bar: Reward & Cost */}
        <div className="absolute top-1 inset-x-1 flex items-center justify-between z-10 pointer-events-none">
          <div className="bg-stone-950/92 backdrop-blur-xs text-amber-300 border border-amber-500/70 px-1 py-0.5 rounded text-[8px] font-black shadow-md flex items-center gap-0.5">
            {card.topBonus.type === 'resource_fixed' && (
              <span className="flex items-center gap-0.5">
                {Object.entries(card.topBonus.resources || {}).map(([r, q]) => (
                  <span key={r} className="inline-flex items-center gap-0.5">
                    <ResourceIcon type={r as ResourceType} size="xs" className="w-2.5 h-2.5" />
                    <span className="text-[9px] font-black text-amber-200">+{q}</span>
                  </span>
                ))}
              </span>
            )}
            {card.topBonus.type === 'food_fixed' && (
              <span className="inline-flex items-center gap-0.5">
                <ResourceIcon type="food" size="xs" className="w-2.5 h-2.5" />
                <span className="text-[9px] font-black text-amber-200">+{card.topBonus.value}</span>
              </span>
            )}
            {card.topBonus.type === 'agriculture' && (
              <span className="inline-flex items-center gap-0.5">
                <ResourceIcon type="agriculture" size="xs" className="w-2.5 h-2.5" />
                <span className="text-[9px] font-black text-emerald-200">+1</span>
              </span>
            )}
            {card.topBonus.type === 'tool_upgrade' && (
              <span className="inline-flex items-center gap-0.5">
                <ResourceIcon type="tool" size="xs" className="w-2.5 h-2.5" />
                <span className="text-[9px] font-black text-cyan-200">+1</span>
              </span>
            )}
            {card.topBonus.type === 'temp_tool' && (
              <span className="inline-flex items-center gap-0.5">
                <span className="text-[9px]">📯</span>
                <span className="text-[9px] font-black text-indigo-200">+{card.topBonus.value}</span>
              </span>
            )}
            {card.topBonus.type === 'victory_points' && (
              <span className="inline-flex items-center gap-0.5">
                <span className="text-[9px]">⭐</span>
                <span className="text-[9px] font-black text-amber-200">+{card.topBonus.value}</span>
              </span>
            )}
            {card.topBonus.type === 'dice_roll' && (
              <span className="inline-flex items-center gap-0.5">
                <span className="text-[8px]">🎲</span>
                <ResourceIcon type={(card.topBonus.resourceType || 'wood') as ResourceType} size="xs" className="w-2.5 h-2.5" />
              </span>
            )}
            {card.topBonus.type === 'dice_all_players' && (
              <span className="inline-flex items-center gap-0.5">
                <span className="text-[8px]">🎲</span>
                <span className="text-[7px] font-black text-purple-200 uppercase">DRAFT</span>
              </span>
            )}
            {card.topBonus.type === 'draw_card' && (
              <span className="inline-flex items-center gap-0.5">
                <span className="text-[8px]">🎴</span>
                <span className="text-[7px] font-black text-amber-200 uppercase">+1</span>
              </span>
            )}
          </div>

          {showCost && cost !== undefined && (
            <div className="bg-amber-500 text-stone-950 font-black px-1.5 py-0.5 rounded-full text-[9px] shadow-lg leading-none">
              🪙{cost}
            </div>
          )}
        </div>

        {/* Bottom bar: Scoring family */}
        <div className="absolute bottom-0 inset-x-0 bg-stone-950/92 backdrop-blur-xs px-1 py-0.5 text-[8px] font-black text-center truncate border-t border-stone-700/80 z-10 pointer-events-none">
          {isGreen && greenInfo ? (
            <span className="text-emerald-300 flex items-center justify-center gap-1">
              <span>{greenInfo.icon}</span>
              <span>{greenInfo.label}</span>
              <span className="text-[7px] font-mono bg-emerald-900/80 px-1 rounded">K²</span>
            </span>
          ) : sandInfo ? (
            <span className="text-amber-300 flex items-center justify-center gap-1">
              <span>{mult}×</span>
              <span>{sandInfo.icon}</span>
              <span>{sandInfo.target}</span>
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // FULL EXPANDED / INSPECTION MODAL VIEW
  // --------------------------------------------------------------------------
  return (
    <div className={`rounded-3xl border-2 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 shadow-2xl p-4 sm:p-5 select-none relative overflow-hidden flex flex-col justify-between ${
      isGreen ? 'border-emerald-500/80 ring-1 ring-emerald-400/40' : 'border-amber-500/80 ring-1 ring-amber-400/40'
    } ${isLarge ? 'max-w-xl w-full' : 'w-full'} ${className}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-2.5 relative z-10">
        <div>
          <span className="text-[10px] uppercase font-black tracking-wider text-stone-400 block">
            {isGreen ? '🌿 Collection de Culture' : '⏳ Multiplicateur de Fin de Partie'}
          </span>
          <h4 className="text-base sm:text-lg font-black text-amber-200 leading-tight">
            {card.name}
          </h4>
        </div>
        {showCost && cost !== undefined && (
          <div className="flex items-center gap-1.5 bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-500/40 text-amber-300 text-xs font-black">
            <span>Coût :</span>
            <span className="font-mono text-sm">{cost} ressource{cost > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Main Body: Card Preview (left) + 2 Standardized Bonus Panels (right) */}
      <div className="my-3 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center relative z-10">
        {/* Left: Card Artwork */}
        <div className="sm:col-span-4 flex justify-center">
          <div className="w-24 sm:w-28 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-2xl">
            <img 
              src={cardImage} 
              alt={card.name} 
              className="w-full h-auto object-cover" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = getCardArtFallback(card);
              }}
            />
          </div>
        </div>

        {/* Right: Harmonized 2-Zone Panels */}
        <div className="sm:col-span-8 space-y-2.5">
          {/* 1. Immediate Gain */}
          <div className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800 text-center">
            <span className="text-[10px] uppercase tracking-wider text-amber-400 font-black block mb-1.5">
              ⚡ Gain Immédiat (Dès l'achat)
            </span>
            <div className="flex items-center justify-center">
              {renderTopVisual()}
            </div>
          </div>

          {/* 2. End-game Scoring */}
          <div>
            {renderBottomVisual()}
          </div>
        </div>
      </div>
    </div>
  );
};
