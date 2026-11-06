import React from 'react';
import { CivilizationCard, ResourceType } from '../../types/game';
import { ResourceIcon } from '../Common/ResourceIcon';

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
  transport: { label: 'Roue', icon: '🪵' },
  weaving: { label: 'Tissage', icon: '🧶' },
  art: { label: 'Art', icon: '🎨' },
  music: { label: 'Musique', icon: '🎵' },
  medicine: { label: 'Médecine', icon: '🌿' },
  sundial: { label: 'Cadran', icon: '☀️' },
};

const SAND_FIGURES: Record<string, { label: string; pluralLabel: string; icon: string; target: string }> = {
  shaman: { label: 'Chaman', pluralLabel: 'Chamans', icon: '🧙', target: '× Ouvriers' },
  farmer: { label: 'Fermier', pluralLabel: 'Fermiers', icon: '🌾', target: '× Agri' },
  tool_maker: { label: 'Fabricant d’outils', pluralLabel: 'Fabricants d’outils', icon: '🔨', target: '× Outils' },
  builder: { label: 'Bâtisseur', pluralLabel: 'Bâtisseurs', icon: '🏛️', target: '× Bâtiments' },
};

// Fallback high-res thematic artwork matching exact card
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
  // Classic views use authentic classic scans
  const cardImage = card.classicImageUrl || card.imageUrl || getCardArtFallback(card);

  // Render top bonus visual
  const renderTopVisual = () => {
    const tb = card.topBonus;
    switch (tb.type) {
      case 'resource_fixed': {
        const resEntries = Object.entries(tb.resources || {}) as [ResourceType, number][];
        return (
          <div className="flex items-center justify-center gap-1 font-bold">
            {resEntries.map(([res, qty]) => (
              <span key={res} className="inline-flex items-center gap-1 bg-stone-900/90 px-1.5 py-0.5 rounded text-amber-200 border border-stone-700">
                <ResourceIcon type={res} size="xs" />
                <span className="text-xs">x{qty}</span>
              </span>
            ))}
          </div>
        );
      }
      case 'food_fixed':
        return (
          <div className="inline-flex items-center gap-1 bg-amber-950/90 px-2 py-0.5 rounded text-amber-300 font-bold border border-amber-800 text-xs">
            <ResourceIcon type="food" size="xs" />
            <span>+{tb.value} Nourriture</span>
          </div>
        );
      case 'agriculture':
        return (
          <div className="inline-flex items-center gap-1 bg-emerald-950/90 px-2 py-0.5 rounded text-emerald-300 font-bold border border-emerald-800 text-xs">
            <ResourceIcon type="agriculture" size="xs" />
            <span>+1 Champ (Agriculture)</span>
          </div>
        );
      case 'tool_upgrade':
        return (
          <div className="inline-flex items-center gap-1 bg-blue-950/90 px-2 py-0.5 rounded text-blue-300 font-bold border border-blue-800 text-xs">
            <ResourceIcon type="tool" size="xs" />
            <span>+1 Outil permanent</span>
          </div>
        );
      case 'temp_tool':
        return (
          <div className="inline-flex items-center gap-1 bg-indigo-950/90 px-2 py-0.5 rounded text-indigo-300 font-bold border border-indigo-800 text-xs">
            <span className="text-xs font-black">📯</span>
            <span>+{tb.value} Outil temporaire</span>
          </div>
        );
      case 'victory_points':
        return (
          <div className="inline-flex items-center gap-1 bg-amber-500/30 px-2 py-0.5 rounded text-amber-300 font-black border border-amber-500/50 text-xs">
            <span>⭐</span>
            <span>+{tb.value} PV directs</span>
          </div>
        );
      case 'dice_roll': {
        const rType = (tb.resourceType || 'wood') as ResourceType;
        const resLabel = rType === 'wood' ? 'Bois' : rType === 'clay' ? 'Glaise' : rType === 'stone' ? 'Pierre' : rType === 'gold' ? 'Or' : 'Nourriture';
        return (
          <div className="inline-flex items-center gap-1.5 bg-amber-950/90 px-2 py-0.5 rounded text-amber-200 font-bold border border-amber-700/80 text-xs shadow-sm">
            <span>🎲🎲</span>
            <span className="flex items-center gap-0.5">
              <span>2 Dés</span>
              <ResourceIcon type={rType} size="xs" />
              <span>{resLabel}</span>
            </span>
          </div>
        );
      }
      case 'dice_all_players':
        return (
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-950/90 to-indigo-950/90 px-2 py-0.5 rounded text-purple-200 font-bold border border-purple-600/80 text-xs shadow-sm">
            <span className="text-sm">🎲</span>
            <span>Dés pour tous (Draft) !</span>
          </div>
        );
      case 'draw_card':
        return (
          <div className="inline-flex items-center gap-1.5 bg-stone-900/90 px-2 py-0.5 rounded text-amber-300 font-bold border border-amber-600/60 text-xs shadow-sm">
            <span className="text-sm">🎴</span>
            <span>+1 Carte supplémentaire</span>
          </div>
        );
      default:
        return <span className="text-xs text-stone-300">{tb.description}</span>;
    }
  };

  // Render bottom bonus visual
  const renderBottomVisual = () => {
    const bb = card.bottomBonus;
    if (bb.type === 'green') {
      const info = GREEN_SYMBOLS[bb.greenSymbol || ''] || { label: 'Culture', icon: '🌿' };

      return (
        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-500/70 shadow-inner">
          <span className="text-xl sm:text-2xl">{info.icon}</span>
          <div className="text-left leading-none">
            <span className="text-[9px] uppercase tracking-wider block text-emerald-400 font-black">
              Collection Verte (K²)
            </span>
            <span className="text-sm font-black text-emerald-100">{info.label}</span>
          </div>
        </div>
      );
    } else {
      const info = SAND_FIGURES[bb.sandType || ''] || { label: 'Multiplicateur', target: '', icon: '⏳', pluralLabel: 'Personnages' };
      const mult = bb.sandMultiplier || 1;

      return (
        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 px-3 py-1.5 rounded-xl border border-amber-500/70 shadow-inner">
          {bb.sandType === 'builder' ? (
            <ResourceIcon type="building" size="md" className="w-6 h-6 shrink-0 drop-shadow" />
          ) : bb.sandType === 'farmer' ? (
            <ResourceIcon type="agriculture" size="md" className="w-6 h-6 shrink-0 drop-shadow" />
          ) : bb.sandType === 'tool_maker' ? (
            <ResourceIcon type="tool" size="md" className="w-6 h-6 shrink-0 drop-shadow" />
          ) : (
            <span className="text-xl sm:text-2xl">{info.icon}</span>
          )}
          <div className="text-left leading-none">
            <div className="flex items-center gap-1.5">
              <span className="text-xs bg-amber-500 text-stone-950 font-black px-1.5 py-0.2 rounded">
                x{mult}
              </span>
              <span className="text-sm font-black text-amber-200">
                {mult > 1 ? info.pluralLabel : info.label}
              </span>
            </div>
            <div className="text-[10px] text-stone-300 flex items-center gap-1 mt-0.5">
              {bb.sandType === 'builder' && <ResourceIcon type="building" size="xs" className="w-3 h-3 shrink-0" />}
              <span>{info.target}</span>
            </div>
          </div>
        </div>
      );
    }
  };

  // Mini board version: Card artwork + cost pill + clear badges
  if (isMini) {
    const renderMiniBadge = () => {
      const tb = card.topBonus;
      switch (tb.type) {
        case 'resource_fixed': {
          const resEntries = Object.entries(tb.resources || {}) as [ResourceType, number][];
          return (
            <span className="flex items-center gap-0.5">
              {resEntries.map(([r, q]) => (
                <span key={r} className="inline-flex items-center gap-0.5">
                  <ResourceIcon type={r} size="xs" className="w-2.5 h-2.5" />
                  <span className="text-[9px] font-black text-amber-200">+{q}</span>
                </span>
              ))}
            </span>
          );
        }
        case 'food_fixed':
          return (
            <span className="inline-flex items-center gap-0.5">
              <ResourceIcon type="food" size="xs" className="w-2.5 h-2.5" />
              <span className="text-[9px] font-black text-amber-200">+{tb.value}</span>
            </span>
          );
        case 'agriculture':
          return (
            <span className="inline-flex items-center gap-0.5">
              <ResourceIcon type="agriculture" size="xs" className="w-2.5 h-2.5" />
              <span className="text-[9px] font-black text-emerald-200">+1</span>
            </span>
          );
        case 'tool_upgrade':
          return (
            <span className="inline-flex items-center gap-0.5">
              <ResourceIcon type="tool" size="xs" className="w-2.5 h-2.5" />
              <span className="text-[9px] font-black text-cyan-200">+1</span>
            </span>
          );
        case 'temp_tool':
          return (
            <span className="inline-flex items-center gap-0.5">
              <span className="text-[9px]">📯</span>
              <span className="text-[9px] font-black text-indigo-200">+{tb.value}</span>
            </span>
          );
        case 'victory_points':
          return (
            <span className="inline-flex items-center gap-0.5">
              <span className="text-[9px]">⭐</span>
              <span className="text-[9px] font-black text-amber-200">+{tb.value}</span>
            </span>
          );
        case 'dice_roll': {
          const res = tb.resourceType || 'wood';
          return (
            <span className="inline-flex items-center gap-0.5">
              <span className="text-[8px]">🎲</span>
              <span className="text-[7px] font-black text-amber-300 uppercase">JET</span>
              <ResourceIcon type={res} size="xs" className="w-2.5 h-2.5" />
            </span>
          );
        }
        case 'dice_all_players':
          return (
            <span className="inline-flex items-center gap-0.5">
              <span className="text-[8px]">🎲</span>
              <span className="text-[7px] font-black text-purple-200 uppercase">DRAFT</span>
            </span>
          );
        case 'draw_card':
          return (
            <span className="inline-flex items-center gap-0.5">
              <span className="text-[8px]">🎴</span>
              <span className="text-[7px] font-black text-amber-200 uppercase">+1 CARTE</span>
            </span>
          );
        default:
          return <span className="text-[8px]">⭐</span>;
      }
    };

    return (
      <div 
        className={`relative w-full h-full rounded-lg overflow-hidden select-none border-2 shadow-xl group transition-all duration-200 ${
          card.bottomBonus.type === 'green' ? 'border-emerald-500/80 hover:border-emerald-300' : 'border-amber-500/80 hover:border-amber-300'
        } ${className}`}
        style={{
          backgroundImage: `url(${cardImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#1c1917',
        }}
      >
        {/* Subtle Dark Vignette overlay so text/icons pop */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-transparent to-stone-950/90 pointer-events-none" />

        {/* Top: Cost badge and Immediate Bonus Preview */}
        <div className="absolute top-1 inset-x-1 flex items-center justify-between z-10 pointer-events-none">
          {/* Top Bonus Icon Badge */}
          <div className="bg-stone-950/90 text-amber-300 border border-amber-500/70 px-1 py-0.5 rounded text-[8px] font-black shadow-md flex items-center gap-0.5">
            {renderMiniBadge()}
          </div>

          {/* Cost Tag */}
          {showCost && cost !== undefined && (
            <div className="bg-amber-500 text-stone-950 font-black px-1.5 py-0.5 rounded-full text-[9px] shadow-lg leading-none">
              🪙{cost}
            </div>
          )}
        </div>

        {/* Bottom pill showing culture type / multiplier */}
        <div className="absolute bottom-0 inset-x-0 bg-stone-950/92 backdrop-blur-sm px-1 py-0.5 text-[8px] font-black text-center truncate border-t border-stone-700 z-10">
          {card.bottomBonus.type === 'green' ? (
            <span className="text-emerald-300 flex items-center justify-center gap-0.5">
              <span>{GREEN_SYMBOLS[card.bottomBonus.greenSymbol || '']?.icon || '🌿'}</span>
              <span>{GREEN_SYMBOLS[card.bottomBonus.greenSymbol || '']?.label || 'Culture'}</span>
            </span>
          ) : (
            <span className="text-amber-300 flex items-center justify-center gap-0.5">
              <span>{card.bottomBonus.sandMultiplier || 1}×</span>
              {card.bottomBonus.sandType === 'builder' ? (
                <ResourceIcon type="building" size="xs" className="w-2.5 h-2.5 shrink-0 drop-shadow" />
              ) : card.bottomBonus.sandType === 'farmer' ? (
                <ResourceIcon type="agriculture" size="xs" className="w-2.5 h-2.5 shrink-0 drop-shadow" />
              ) : card.bottomBonus.sandType === 'tool_maker' ? (
                <ResourceIcon type="tool" size="xs" className="w-2.5 h-2.5 shrink-0 drop-shadow" />
              ) : (
                <span>🧙</span>
              )}
              <span>{SAND_FIGURES[card.bottomBonus.sandType || '']?.target || ''}</span>
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full / Modal version with authentic artwork + game mechanics
  return (
    <div className={`rounded-3xl border-2 bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-950 shadow-2xl p-4 select-none relative overflow-hidden flex flex-col justify-between ${
      card.bottomBonus.type === 'green' ? 'border-emerald-600/80' : 'border-amber-600/80'
    } ${isLarge ? 'w-80 min-h-[340px]' : 'w-full min-h-[180px]'} ${className}`}>
      {/* Decorative texture background */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800/80 pb-2 relative z-10">
        <div>
          <span className="text-[10px] uppercase font-black tracking-wider text-stone-400 block">
            Carte Civilisation Authentique
          </span>
          <h4 className="text-base sm:text-lg font-black text-amber-200">
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

      {/* Middle row: Card artwork + Top bonus */}
      <div className="my-3 flex items-center gap-3 relative z-10">
        <div className="w-20 sm:w-24 shrink-0 rounded-xl overflow-hidden border-2 border-stone-700 shadow-lg">
          <img 
            src={cardImage} 
            alt={card.name} 
            className="w-full h-auto object-cover" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = getCardArtFallback(card);
            }}
          />
        </div>

        <div className="flex-1 space-y-2">
          <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800 text-center">
            <span className="text-[10px] uppercase tracking-wider text-amber-400 font-black block mb-1">
              ⚡ Gain Immédiat
            </span>
            <div className="flex items-center justify-center">
              {renderTopVisual()}
            </div>
          </div>

          {/* Bottom Bonus */}
          <div className="pt-1">
            {renderBottomVisual()}
          </div>
        </div>
      </div>
    </div>
  );
};
