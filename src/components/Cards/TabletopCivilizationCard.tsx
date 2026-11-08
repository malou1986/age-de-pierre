import React from 'react';
import { CivilizationCard, ResourceType } from '../../types/game';
import { ResourceIcon } from '../Common/ResourceIcon';
import { haptic } from '../../logic/haptics';

interface TabletopCivilizationCardProps {
  card: CivilizationCard;
  cost?: number; // 1, 2, 3, 4
  showCost?: boolean;
  isInteractive?: boolean;
  size?: 'compact' | 'large';
  onClick?: () => void;
  className?: string;
}

// High-resolution modular civilization card artwork
const getPepsArtwork = (card: CivilizationCard): string => {
  if (card.imageUrl) {
    return card.imageUrl;
  }
  if (card.id && card.id.startsWith('c_')) {
    return `/cards/peps/card_peps_${card.id.replace('c_', '')}.jpg`;
  }
  return '/cards/peps/card_peps_00.jpg';
};

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

export const TabletopCivilizationCard: React.FC<TabletopCivilizationCardProps> = ({
  card,
  cost,
  showCost = false,
  isInteractive = false,
  size = 'compact',
  onClick,
  className = '',
}) => {
  const artSrc = card.imageUrl || getPepsArtwork(card);
  const isGreen = card.bottomBonus.type === 'green';
  const greenInfo = isGreen 
    ? (GREEN_SYMBOLS[card.bottomBonus.greenSymbol || ''] || { label: 'Culture', icon: '🌿' }) 
    : null;
  const sandInfo = !isGreen 
    ? (SAND_FIGURES[card.bottomBonus.sandType || ''] || { label: 'Figure', icon: '⏳', target: '' }) 
    : null;
  const mult = card.bottomBonus.sandMultiplier || 1;
  const isLarge = size === 'large';

  // --------------------------------------------------------------------------
  // FLOATING VISUAL REWARD BADGE: High-contrast, polished prehistoric plinth
  // --------------------------------------------------------------------------
  const renderImmediateOrganicBadge = () => {
    const tb = card.topBonus;

    switch (tb.type) {
      case 'resource_fixed': {
        const entries = Object.entries(tb.resources || {}) as [ResourceType, number][];
        return (
          <div className="flex items-center gap-1 bg-stone-950/92 backdrop-blur-xs border border-amber-400/90 rounded-b-lg px-1.5 py-0.5 shadow-[0_4px_10px_rgba(0,0,0,0.95)] max-w-full overflow-hidden shrink-0">
            {entries.map(([res, qty]) => (
              <div key={res} className="flex items-center gap-0.5 shrink-0">
                <ResourceIcon type={res} size={isLarge ? 'md' : 'xs'} />
                <span className={`font-black text-amber-200 drop-shadow ${isLarge ? 'text-base' : 'text-[10px] sm:text-xs'}`}>
                  +{qty}
                </span>
              </div>
            ))}
          </div>
        );
      }

      case 'food_fixed':
        return (
          <div className="flex items-center gap-0.5 bg-stone-950/92 backdrop-blur-xs border border-amber-400/90 rounded-b-lg px-1.5 py-0.5 shadow-[0_4px_10px_rgba(0,0,0,0.95)] text-amber-300 font-black shrink-0">
            <ResourceIcon type="food" size={isLarge ? 'md' : 'xs'} />
            <span className={`font-black text-amber-200 drop-shadow ${isLarge ? 'text-base' : 'text-[10px] sm:text-xs'}`}>
              +{tb.value}
            </span>
          </div>
        );

      case 'agriculture':
        return (
          <div className="flex items-center gap-0.5 bg-stone-950/92 backdrop-blur-xs border border-emerald-400/90 rounded-b-lg px-1.5 py-0.5 shadow-[0_4px_10px_rgba(0,0,0,0.95)] text-emerald-300 font-black shrink-0">
            <ResourceIcon type="agriculture" size={isLarge ? 'md' : 'xs'} />
            <span className={`font-black text-emerald-200 drop-shadow ${isLarge ? 'text-sm' : 'text-[9px] sm:text-xs'}`}>
              +1 AGRI
            </span>
          </div>
        );

      case 'tool_upgrade':
        return (
          <div className="flex items-center gap-0.5 bg-stone-950/92 backdrop-blur-xs border border-cyan-400/90 rounded-b-lg px-1.5 py-0.5 shadow-[0_4px_10px_rgba(0,0,0,0.95)] text-cyan-300 font-black shrink-0">
            <ResourceIcon type="tool" size={isLarge ? 'md' : 'xs'} />
            <span className={`font-black text-cyan-200 drop-shadow ${isLarge ? 'text-sm' : 'text-[9px] sm:text-xs'}`}>
              +1 OUTIL
            </span>
          </div>
        );

      case 'temp_tool':
        return (
          <div className="flex items-center gap-0.5 bg-stone-950/92 backdrop-blur-xs border border-indigo-400/90 rounded-b-lg px-1.5 py-0.5 shadow-[0_4px_10px_rgba(0,0,0,0.95)] text-indigo-300 font-black shrink-0">
            <span className="text-xs">📯</span>
            <span className={`font-black text-indigo-200 drop-shadow ${isLarge ? 'text-sm' : 'text-[9px] sm:text-xs'}`}>
              +{tb.value} OUTIL
            </span>
          </div>
        );

      case 'victory_points':
        return (
          <div className="flex items-center gap-0.5 bg-stone-950/92 backdrop-blur-xs border border-yellow-400/90 rounded-b-lg px-1.5 py-0.5 shadow-[0_4px_10px_rgba(0,0,0,0.95)] text-yellow-300 font-black shrink-0">
            <span className="text-xs">⭐</span>
            <span className={`font-black text-amber-200 drop-shadow ${isLarge ? 'text-base' : 'text-[10px] sm:text-xs'}`}>
              +{tb.value} PV
            </span>
          </div>
        );

      case 'dice_roll': {
        const res = tb.resourceType || 'wood';
        const div = res === 'wood' ? '3' : res === 'clay' ? '4' : res === 'stone' ? '5' : res === 'gold' ? '6' : '2';
        return (
          <div className="flex items-center gap-0.5 bg-stone-950/92 backdrop-blur-xs border border-amber-400/90 rounded-b-lg px-1.5 py-0.5 shadow-[0_4px_10px_rgba(0,0,0,0.95)] text-amber-200 font-black shrink-0">
            <span className="text-[10px] leading-none">🎲</span>
            <span className="text-[8px] sm:text-[9px] font-black text-amber-300 uppercase">2D</span>
            <ResourceIcon type={res} size={isLarge ? 'md' : 'xs'} />
            <span className="text-[8px] font-mono text-amber-300">÷{div}</span>
          </div>
        );
      }

      case 'dice_all_players':
        return (
          <div className="flex items-center gap-0.5 bg-stone-950/92 backdrop-blur-xs border border-purple-400/90 rounded-b-lg px-1.5 py-0.5 shadow-[0_4px_10px_rgba(0,0,0,0.95)] text-purple-200 font-black shrink-0">
            <span className="text-[10px] leading-none">🎲</span>
            <span className={`${isLarge ? 'text-xs' : 'text-[8px] sm:text-[9px]'} font-black text-purple-200 uppercase tracking-tight`}>DRAFT</span>
          </div>
        );

      case 'draw_card':
        return (
          <div className="flex items-center gap-0.5 bg-stone-950/92 backdrop-blur-xs border border-amber-400/90 rounded-b-lg px-1.5 py-0.5 shadow-[0_4px_10px_rgba(0,0,0,0.95)] text-amber-300 font-black shrink-0">
            <span className="text-[10px] leading-none">🎴</span>
            <span className={`${isLarge ? 'text-xs' : 'text-[8px] sm:text-[9px]'} font-black text-amber-200 uppercase tracking-tight`}>+1 CARTE</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      onClick={() => {
        if (onClick) {
          haptic.tap();
          onClick();
        }
      }}
      className={`group relative w-full h-full min-w-0 flex flex-col justify-between rounded-xl overflow-hidden select-none transition-all duration-200 ${
        isInteractive 
          ? 'cursor-pointer hover:-translate-y-2 hover:scale-[1.04] shadow-[0_16px_32px_rgba(245,158,11,0.7)] ring-2 ring-amber-400' 
          : 'shadow-[0_8px_20px_rgba(0,0,0,0.85)] hover:-translate-y-1.5 hover:shadow-[0_14px_28px_rgba(0,0,0,0.95)]'
      } ${className}`}
      style={{
        backgroundColor: '#18110b',
        border: isGreen ? '2px solid rgba(16, 185, 129, 0.8)' : '2px solid rgba(245, 158, 11, 0.8)',
        boxShadow: isGreen ? '0 6px 18px rgba(16,185,129,0.35)' : '0 6px 18px rgba(245,158,11,0.35)',
      }}
      title={`${card.name}\n• Gain immédiat : ${card.topBonus.description}\n• Décompte final : ${card.bottomBonus.description}${cost !== undefined ? `\n• Coût : ${cost} ressource(s)` : ''}\n(Cliquer pour inspecter la carte)`}
    >
      {/* 1. BACKGROUND DIGITAL ARTWORK (PURE, FULL VISIBILITY, NO OPAQUE OVERLAY) */}
      <img 
        src={artSrc} 
        alt={card.name} 
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none filter contrast-[1.04] saturate-[1.10]" 
        onError={(e) => {
          // Graceful fallback to avoid any pitch black card
          (e.target as HTMLImageElement).src = '/cards/peps/card_peps_00.jpg';
        }}
      />

      {/* 2. VERY SUBTLE CORNER VIGNETTE ONLY (Ensures pure icon readability, NO box) */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-stone-950/50 pointer-events-none" />

      {/* 3. TOP ROW: Floating Organic Reward (Left) & Optional Cost Coin if showCost is true */}
      <div className="relative z-10 px-1 pt-0.5 flex items-start justify-between w-full min-w-0 pointer-events-none">
        {/* Floating Reward Plinth */}
        <div className="flex items-center min-w-0 max-w-full">
          {renderImmediateOrganicBadge()}
        </div>

        {/* Floating Golden Wax / Coin Cost Seal (Only if explicitly shown) */}
        {showCost && cost !== undefined && (
          <div 
            className="bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 text-stone-950 font-black px-1.5 py-0.5 rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.9)] border border-yellow-200 flex items-center gap-0.5 text-[8px] sm:text-[9px] leading-none shrink-0"
            title={`Coût : ${cost} ressource(s)`}
          >
            <span>🪙</span>
            <span>{cost}</span>
          </div>
        )}
      </div>

      {/* 5. BOTTOM ROW: High-contrast culture symbol or sand figure plinth */}
      <div className="relative z-10 w-full min-w-0 p-0.5 sm:p-1 flex items-center justify-between pointer-events-none">
        {isGreen && greenInfo ? (
          <div className="flex items-center justify-between w-full min-w-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] bg-emerald-950/90 backdrop-blur-xs px-1.5 py-0.5 rounded border border-emerald-400/70 overflow-hidden shadow-inner">
            <span className={`${isLarge ? 'text-xl' : 'text-xs sm:text-sm'} shrink-0 leading-none filter drop-shadow`}>
              {greenInfo.icon}
            </span>
            <span className={`${isLarge ? 'text-xs' : 'text-[8px] sm:text-[9px]'} font-black uppercase text-emerald-200 tracking-wider truncate mx-0.5`}>
              {greenInfo.label}
            </span>
            <span className="text-[7px] font-mono bg-emerald-800/80 text-emerald-200 px-1 rounded font-black shrink-0">
              K²
            </span>
          </div>
        ) : sandInfo ? (
          <div className="flex items-center justify-between w-full min-w-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] bg-amber-950/90 backdrop-blur-xs px-1.5 py-0.5 rounded border border-amber-400/70 overflow-hidden shadow-inner">
            <div className="flex items-center gap-1 shrink-0">
              <span 
                className={`${isLarge ? 'text-lg' : 'text-xs sm:text-sm'} leading-none filter drop-shadow flex items-center justify-center`}
                title={mult > 1 ? `${mult} ${sandInfo.pluralLabel}` : sandInfo.label}
              >
                {card.bottomBonus.sandType === 'builder' ? (
                  <ResourceIcon type="building" size={isLarge ? 'sm' : 'xs'} className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow" />
                ) : card.bottomBonus.sandType === 'farmer' ? (
                  <ResourceIcon type="agriculture" size={isLarge ? 'sm' : 'xs'} className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow" />
                ) : card.bottomBonus.sandType === 'tool_maker' ? (
                  <ResourceIcon type="tool" size={isLarge ? 'sm' : 'xs'} className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow" />
                ) : (
                  sandInfo.icon
                )}
              </span>
              <span className={`font-black rounded px-1 py-0.2 shrink-0 ${
                mult >= 2 
                  ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-stone-950 border border-yellow-200 shadow text-[8px]' 
                  : 'bg-amber-800/80 text-amber-200 text-[8px]'
              }`}>
                {mult}×
              </span>
            </div>
            <div className="flex items-center gap-0.5 min-w-0 overflow-hidden">
              <span className={`${isLarge ? 'text-xs' : 'text-[8px] sm:text-[9px]'} font-black text-amber-200 tracking-tight truncate ml-0.5`}>
                {sandInfo.target}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
