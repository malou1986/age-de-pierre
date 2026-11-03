import React from 'react';
import { ResourceType } from '../../types/game';

export type ExtendedResourceType = ResourceType | 'food' | 'tool' | 'agriculture' | 'building';

interface ResourceIconProps {
  type: ExtendedResourceType;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLabel?: boolean;
}

const SIZE_MAP = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4.5 h-4.5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
};

export const ResourceIcon: React.FC<ResourceIconProps> = ({
  type,
  size = 'md',
  className = '',
  showLabel = false,
}) => {
  const sizeClass = SIZE_MAP[size];

  const renderSvg = () => {
    switch (type) {
      case 'wood':
        // Cut Timber Log with detailed bark and annual growth rings
        return (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClass} ${className} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
            {/* Main Log Cylinder */}
            <path d="M7 11L25 5C27 4.3 29 5.5 29 7.6V23C29 25.2 27 26.4 25 25.7L7 20V11Z" fill="#5c2e0b" />
            <path d="M7 11L25 5C26 4.7 27 5.2 27 6.2V22C27 23 26 23.5 25 23.2L7 18V11Z" fill="#783c12" />
            {/* Bark Texture Highlights & Grooves */}
            <path d="M12 9.5L25 5.5" stroke="#9a521e" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M10 13.5L26 8.5" stroke="#452006" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M9 17L26 12" stroke="#9a521e" strokeWidth="1" strokeLinecap="round" />
            <path d="M12 18.5L25 14.5" stroke="#452006" strokeWidth="1" strokeLinecap="round" />
            {/* Front Cut Face (Ellipse) */}
            <ellipse cx="7.5" cy="15.5" rx="4.5" ry="5" fill="#d97706" stroke="#452006" strokeWidth="1.5" />
            <ellipse cx="7.5" cy="15.5" rx="3.2" ry="3.6" fill="#f59e0b" stroke="#783c12" strokeWidth="1" />
            <ellipse cx="7.5" cy="15.5" rx="1.8" ry="2" fill="#fbbf24" stroke="#9a521e" strokeWidth="0.8" />
            <circle cx="7.5" cy="15.5" r="0.7" fill="#452006" />
          </svg>
        );

      case 'clay':
        // Terracotta Adobe Clay Brick (Isometric 3D)
        return (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClass} ${className} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
            {/* Top Face */}
            <polygon points="18,4 32,11 18,18 4,11" fill="#ea580c" stroke="#9a3412" strokeWidth="1.2" />
            {/* Subtle Brick Surface Pits */}
            <circle cx="14" cy="10" r="0.8" fill="#c2410c" />
            <circle cx="21" cy="12" r="0.9" fill="#c2410c" />
            <circle cx="18" cy="8" r="0.7" fill="#f97316" />
            {/* Right Face (Shadow) */}
            <polygon points="32,11 32,23 18,30 18,18" fill="#9a3412" stroke="#7c2d12" strokeWidth="1.2" />
            {/* Left Face */}
            <polygon points="4,11 18,18 18,30 4,23" fill="#c2410c" stroke="#7c2d12" strokeWidth="1.2" />
            {/* Top Bevel Highlight */}
            <polyline points="4,11 18,4 32,11" stroke="#fdba74" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );

      case 'stone':
        // Chiselled Granite Megalith Stone Cube
        return (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClass} ${className} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
            {/* Top Face */}
            <polygon points="18,4 31,10 18,17 5,10" fill="#94a3b8" stroke="#334155" strokeWidth="1.2" />
            {/* Right Face (Deep Shadow) */}
            <polygon points="31,10 31,23 18,31 18,17" fill="#475569" stroke="#1e293b" strokeWidth="1.2" />
            {/* Left Face (Medium Tone) */}
            <polygon points="5,10 18,17 18,31 5,23" fill="#64748b" stroke="#1e293b" strokeWidth="1.2" />
            {/* Granite Specks / Minerals */}
            <circle cx="15" cy="10" r="0.7" fill="#cbd5e1" />
            <circle cx="22" cy="11" r="0.8" fill="#334155" />
            <circle cx="12" cy="21" r="0.8" fill="#cbd5e1" />
            <circle cx="24" cy="20" r="0.8" fill="#1e293b" />
            {/* Specular Edge Line */}
            <polyline points="5,10 18,4 31,10" stroke="#f1f5f9" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );

      case 'gold':
        // Gleaming Faceted Raw Gold Nugget
        return (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClass} ${className} filter drop-shadow-[0_2px_6px_rgba(234,179,8,0.7)]`}>
            {/* Base Nugget Shape */}
            <polygon points="18,3 28,9 33,20 25,31 11,31 3,20 8,9" fill="#d97706" stroke="#78350f" strokeWidth="1.2" />
            {/* Facets */}
            <polygon points="18,3 28,9 20,17 10,12" fill="#fbbf24" />
            <polygon points="28,9 33,20 23,21 20,17" fill="#f59e0b" />
            <polygon points="33,20 25,31 18,25 23,21" fill="#b45309" />
            <polygon points="25,31 11,31 15,23 18,25" fill="#78350f" />
            <polygon points="11,31 3,20 10,19 15,23" fill="#92400e" />
            <polygon points="3,20 8,9 10,12 10,19" fill="#d97706" />
            <polygon points="10,12 20,17 18,25 15,23 10,19" fill="#fef08a" />
            {/* Star Glint / Shine */}
            <path d="M18 10L19 13L22 14L19 15L18 18L17 15L14 14L17 13Z" fill="#ffffff" />
            <circle cx="26" cy="11" r="1" fill="#ffffff" />
          </svg>
        );

      case 'food':
        // Roasted Game Haunch / Drumstick
        return (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClass} ${className} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
            {/* Bone Handle */}
            <path d="M7 29L13 23" stroke="#f1f5f9" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="6" cy="27" r="2.2" fill="#e2e8f0" />
            <circle cx="8" cy="30" r="2.2" fill="#e2e8f0" />
            {/* Roasted Meat Bulb */}
            <path d="M12 22C10 18 11 12 16 8C22 4 30 7 31 13C32 19 28 26 21 27C16 28 13 25 12 22Z" fill="#9a3412" stroke="#431407" strokeWidth="1.2" />
            <path d="M14 20C13 17 14 13 18 10C22 7 28 9 29 14C30 18 26 23 21 24C17 25 15 22 14 20Z" fill="#c2410c" />
            {/* Crispy Glaze Highlight */}
            <path d="M18 10C21 8 26 10 27 13" stroke="#fed7aa" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      case 'agriculture':
        // Golden Wheat Stalk
        return (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClass} ${className} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
            <path d="M18 32V6" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
            {/* Wheat Grains */}
            <ellipse cx="14" cy="9" rx="3.5" ry="2" transform="rotate(-30 14 9)" fill="#fbbf24" stroke="#854d0e" strokeWidth="0.8" />
            <ellipse cx="22" cy="9" rx="3.5" ry="2" transform="rotate(30 22 9)" fill="#f59e0b" stroke="#854d0e" strokeWidth="0.8" />
            <ellipse cx="13" cy="14" rx="4" ry="2.2" transform="rotate(-25 13 14)" fill="#fbbf24" stroke="#854d0e" strokeWidth="0.8" />
            <ellipse cx="23" cy="14" rx="4" ry="2.2" transform="rotate(25 23 14)" fill="#f59e0b" stroke="#854d0e" strokeWidth="0.8" />
            <ellipse cx="14" cy="19" rx="4" ry="2.2" transform="rotate(-20 14 19)" fill="#fbbf24" stroke="#854d0e" strokeWidth="0.8" />
            <ellipse cx="22" cy="19" rx="4" ry="2.2" transform="rotate(20 22 19)" fill="#f59e0b" stroke="#854d0e" strokeWidth="0.8" />
            <ellipse cx="15" cy="24" rx="3.5" ry="2" transform="rotate(-15 15 24)" fill="#fbbf24" stroke="#854d0e" strokeWidth="0.8" />
            <ellipse cx="21" cy="24" rx="3.5" ry="2" transform="rotate(15 21 24)" fill="#f59e0b" stroke="#854d0e" strokeWidth="0.8" />
            <ellipse cx="18" cy="5" rx="2" ry="3.5" fill="#fef08a" stroke="#854d0e" strokeWidth="0.8" />
          </svg>
        );

      case 'tool':
        // Neolithic Flint Axe with Wood & Cord Bindings
        return (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClass} ${className} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
            {/* Wood Handle */}
            <path d="M10 30L26 8" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
            {/* Flint Axehead */}
            <polygon points="17,6 29,4 32,13 22,17" fill="#64748b" stroke="#1e293b" strokeWidth="1" />
            <polygon points="19,7 28,6 29,12 22,15" fill="#94a3b8" />
            {/* Leather Bindings */}
            <line x1="19" y1="12" x2="25" y2="9" stroke="#b45309" strokeWidth="1.5" />
            <line x1="21" y1="14" x2="26" y2="11" stroke="#b45309" strokeWidth="1.5" />
          </svg>
        );

      case 'building':
        // Prehistoric Timber & Thatched Roof Hut / Building
        return (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClass} ${className} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
            {/* Stone & Earth Foundation */}
            <polygon points="5,32 31,32 33,26 3,26" fill="#475569" stroke="#1e293b" strokeWidth="1" />
            <polygon points="5,30 31,30 32,27 4,27" fill="#64748b" />
            {/* Wooden Timber Walls */}
            <rect x="7" y="19" width="22" height="8" fill="#78350f" stroke="#451a03" strokeWidth="1" />
            <line x1="12" y1="19" x2="12" y2="27" stroke="#451a03" strokeWidth="0.8" />
            <line x1="24" y1="19" x2="24" y2="27" stroke="#451a03" strokeWidth="0.8" />
            {/* Dark Hut Entrance / Door */}
            <path d="M15 27V21C15 20.2 15.8 19.5 16.8 19.5H19.2C20.2 19.5 21 20.2 21 21V27H15Z" fill="#1c0e06" />
            {/* Thatched Roof (Conical straw thatch) */}
            <polygon points="18,3 34,20 2,20" fill="#d97706" stroke="#78350f" strokeWidth="1.2" />
            {/* Roof Layers & Thatch Highlights */}
            <polygon points="18,3 31,16 5,16" fill="#f59e0b" />
            <polygon points="18,3 27,11 9,11" fill="#fbbf24" stroke="#b45309" strokeWidth="0.8" />
            {/* Crossed Roof Apex Beams */}
            <line x1="15" y1="1" x2="21" y2="7" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="21" y1="1" x2="15" y2="7" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      default:
        return null;
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'wood': return 'Bois';
      case 'clay': return 'Glaise';
      case 'stone': return 'Pierre';
      case 'gold': return 'Or';
      case 'food': return 'Nourriture';
      case 'agriculture': return 'Agri';
      case 'tool': return 'Outil';
      case 'building': return 'Bâtiment';
    }
  };

  return (
    <span className="inline-flex items-center gap-1 shrink-0">
      {renderSvg()}
      {showLabel && (
        <span className="text-xs font-bold text-amber-100 drop-shadow">
          {getLabel()}
        </span>
      )}
    </span>
  );
};
