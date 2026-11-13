import React from 'react';
import { GreenCultureSymbol } from '../../types/game';

interface CultureIconProps {
  type: GreenCultureSymbol;
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

export const CultureIcon: React.FC<CultureIconProps> = ({
  type,
  size = 'md',
  className = '',
  showLabel = false,
}) => {
  const sizeClass = SIZE_MAP[size];

  const renderSvg = () => {
    switch (type) {
      case 'writing':
        // Prehistoric engraved tablet with glowing pictographs & ivory stylus
        return (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClass} ${className} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
            {/* Tablet Slab */}
            <rect x="5" y="4" width="22" height="28" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.2" />
            <rect x="7" y="6" width="18" height="24" rx="1.5" fill="#1e293b" />
            {/* Pictographic Glyphs with golden glow */}
            <path d="M10 10H22M10 14H18M10 18H20M10 22H16M10 26H21" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1.5 2" />
            {/* Ivory Stylus */}
            <path d="M22 26L31 8L33 10L24 28L22 26Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.8" />
            <polygon points="21,29 23,26 21,25" fill="#d97706" />
          </svg>
        );

      case 'pottery':
        // Terracotta Neolithic Vase with turquoise geometric spiral motifs
        return (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClass} ${className} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
            {/* Vase Rim */}
            <ellipse cx="18" cy="7" rx="6" ry="2" fill="#ea580c" stroke="#9a3412" strokeWidth="1" />
            <ellipse cx="18" cy="7" rx="4.5" ry="1.2" fill="#7c2d12" />
            {/* Neck */}
            <path d="M12 7L13 11C13 11 8 15 8 22C8 28 12 31 18 31C24 31 28 28 28 22C28 15 23 11 23 11L24 7" fill="#ea580c" stroke="#9a3412" strokeWidth="1.2" />
            {/* Handles */}
            <path d="M10 13C6 15 6 21 10 23" stroke="#c2410c" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M26 13C30 15 30 21 26 23" stroke="#c2410c" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            {/* Turquoise Tribal Band */}
            <path d="M10 18C12 19 15 19.5 18 19.5C21 19.5 24 19 26 18C26 21 23 23 18 23C13 23 10 21 10 18Z" fill="#06b6d4" stroke="#0891b2" strokeWidth="0.8" />
            {/* Decorative Chevron in Turquoise Band */}
            <path d="M12 20.5L14 19L16 20.5L18 19L20 20.5L22 19L24 20.5" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Specular Highlight */}
            <path d="M13 14C11 18 11 25 13 28" stroke="#fed7aa" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" fill="none" />
          </svg>
        );

      case 'transport':
        // Prehistoric Solid Wooden Wheel with bronze hubcap, axle & studs (TRUE WHEEL)
        return (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClass} ${className} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
            {/* Outer Wood / Bronze Rim */}
            <circle cx="18" cy="18" r="14" fill="#78350f" stroke="#d97706" strokeWidth="1.5" />
            {/* Inner Recessed Wood Wheel Face */}
            <circle cx="18" cy="18" r="11" fill="#92400e" stroke="#451a03" strokeWidth="1" />
            {/* 4 Wooden Segment Planks (Cross bracing) */}
            <line x1="7" y1="18" x2="29" y2="18" stroke="#451a03" strokeWidth="1.2" />
            <line x1="18" y1="7" x2="18" y2="29" stroke="#451a03" strokeWidth="1.2" />
            <line x1="10" y1="10" x2="26" y2="26" stroke="#b45309" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <line x1="26" y1="10" x2="10" y2="26" stroke="#b45309" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            {/* Bronze Studs on Rim */}
            <circle cx="18" cy="5.5" r="1.1" fill="#fbbf24" />
            <circle cx="18" cy="30.5" r="1.1" fill="#fbbf24" />
            <circle cx="5.5" cy="18" r="1.1" fill="#fbbf24" />
            <circle cx="30.5" cy="18" r="1.1" fill="#fbbf24" />
            <circle cx="9" cy="9" r="1" fill="#f59e0b" />
            <circle cx="27" cy="9" r="1" fill="#f59e0b" />
            <circle cx="9" cy="27" r="1" fill="#f59e0b" />
            <circle cx="27" cy="27" r="1" fill="#f59e0b" />
            {/* Bronze Center Hubcap & Axle Hole */}
            <circle cx="18" cy="18" r="4" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
            <circle cx="18" cy="18" r="1.8" fill="#1c1917" />
          </svg>
        );

      case 'weaving':
        // Bone Shuttle & Woven Tapestry with vibrant crimson & indigo threads
        return (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClass} ${className} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
            {/* Woven Warp Threads (vertical) */}
            <line x1="8" y1="6" x2="8" y2="30" stroke="#f59e0b" strokeWidth="1" />
            <line x1="12" y1="6" x2="12" y2="30" stroke="#38bdf8" strokeWidth="1" />
            <line x1="16" y1="6" x2="16" y2="30" stroke="#f43f5e" strokeWidth="1" />
            <line x1="20" y1="6" x2="20" y2="30" stroke="#a855f7" strokeWidth="1" />
            <line x1="24" y1="6" x2="24" y2="30" stroke="#10b981" strokeWidth="1" />
            <line x1="28" y1="6" x2="28" y2="30" stroke="#fbbf24" strokeWidth="1" />
            {/* Woven Weft Band (horizontal criss-cross) */}
            <rect x="6" y="14" width="24" height="8" rx="1" fill="#e11d48" opacity="0.85" />
            <line x1="6" y1="16" x2="30" y2="16" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="6" y1="20" x2="30" y2="20" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" />
            {/* Bone Weaving Shuttle (diagonal) */}
            <path d="M4 27L29 7C30.5 5.8 32.5 7.5 31.5 9L11 31C9.5 32.2 7.5 30.5 8.5 29L4 27Z" fill="#f8fafc" stroke="#64748b" strokeWidth="0.8" />
            {/* Thread Spool Hole in Shuttle */}
            <ellipse cx="20" cy="18" rx="2" ry="3.5" transform="rotate(-40 20 18)" fill="#e11d48" />
          </svg>
        );

      case 'art':
        // Cave Painting: Charging Ochre-Red Bison with Golden Tribal Hand Stencil
        return (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClass} ${className} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
            {/* Cave Rock Disc Background */}
            <circle cx="18" cy="18" r="14" fill="#44403c" stroke="#d97706" strokeWidth="1.2" />
            {/* Sacred Hand Stencil (Negative silhouette in warm amber) */}
            <path d="M22 8C21.5 8 21 8.5 21 9V13H20V10C20 9.5 19.5 9 19 9C18.5 9 18 9.5 18 10V13H17V11C17 10.5 16.5 10 16 10C15.5 10 15 10.5 15 11V14C15 15.5 16 17 17.5 17.5L19 18V21H23V16C24 15 24 13.5 24 12V9C24 8.5 23.5 8 23 8C22.6 8 22.3 8.3 22 8.7V8Z" fill="#f59e0b" opacity="0.45" />
            {/* Charging Red Ochre Bison Silhouette */}
            <path d="M8 22C9 19 11 16 14 15C16 14.5 18 14 20 15C22 14.2 25 15 27 17C29 18 29.5 20 28 21.5C26.5 22 25 21.5 23 22C21 22.5 19 25 18 26L16 26L16.5 23L13 23L12 26L10 26L10.5 22.5C9.5 22.8 8.8 22.8 8 22Z" fill="#dc2626" />
            {/* Bison Horn & Hump Accent */}
            <path d="M27 16C28 14 29 13 30 14" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="26" cy="17.5" r="0.7" fill="#fbbf24" />
          </svg>
        );

      case 'music':
        // Carved Mammoth Bone Flute with drilled tone holes & acoustic sound aura
        return (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClass} ${className} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
            {/* Acoustic Resonance Rings (Music Aura) */}
            <path d="M26 9C29 12 29 18 26 21" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M29 6C33 11 33 21 29 25" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" opacity="0.6" fill="none" />
            {/* Bone Flute Shaft (diagonal) */}
            <path d="M7 29L26 9L29 12L10 32C8.5 33 6 31 7 29Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
            {/* Mouthpiece */}
            <ellipse cx="27.5" cy="10.5" rx="1.5" ry="2.2" transform="rotate(-45 27.5 10.5)" fill="#475569" />
            {/* Drilled Finger Holes */}
            <circle cx="13" cy="24" r="1" fill="#0f172a" />
            <circle cx="16" cy="20.5" r="1" fill="#0f172a" />
            <circle cx="19" cy="17" r="1" fill="#0f172a" />
            <circle cx="22" cy="13.5" r="1" fill="#0f172a" />
            {/* Musical Note Accent */}
            <path d="M21 4V7M21 5.5H24V8" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'medicine':
        // Healing Herbalism: Stone Mortar & Pestle with vivid medicinal herbs & glowing elixir
        return (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClass} ${className} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
            {/* Stone Mortar Bowl */}
            <path d="M7 16H29C29 24 25 29 18 29C11 29 7 24 7 16Z" fill="#475569" stroke="#1e293b" strokeWidth="1.2" />
            {/* Bowl Rim */}
            <ellipse cx="18" cy="16" rx="11" ry="3" fill="#64748b" stroke="#334155" strokeWidth="1" />
            {/* Glowing Green Herbal Ointment */}
            <ellipse cx="18" cy="17" rx="8" ry="2" fill="#10b981" />
            {/* Granite Pestle Handle */}
            <path d="M21 6L16 18L18 19L24 7C24.5 6 22 5 21 6Z" fill="#94a3b8" stroke="#334155" strokeWidth="1" />
            {/* Wild Healing Leaves emerging from mortar */}
            <path d="M11 15C10 11 12 8 16 9C16 12 13 14 11 15Z" fill="#22c55e" stroke="#15803d" strokeWidth="0.8" />
            <path d="M22 13C25 10 27 11 26 14C24 15 23 15 22 13Z" fill="#4ade80" stroke="#15803d" strokeWidth="0.8" />
            {/* Red Medicinal Berries */}
            <circle cx="12" cy="18" r="1.3" fill="#ef4444" />
            <circle cx="14" cy="19" r="1.1" fill="#ef4444" />
            {/* Healing Sparkle */}
            <circle cx="21" cy="22" r="0.8" fill="#fef08a" />
          </svg>
        );

      case 'sundial':
        // Megalithic Solar Gnomon & Radiant Sun Disc
        return (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClass} ${className} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
            {/* Outer Megalithic Stone Disc */}
            <circle cx="18" cy="18" r="14" fill="#334155" stroke="#f59e0b" strokeWidth="1.2" />
            {/* Hour / Solstice Markings around dial */}
            <circle cx="18" cy="18" r="11" stroke="#fbbf24" strokeWidth="0.8" strokeDasharray="2 2.5" fill="none" />
            {/* Radiant Sun Face in Center */}
            <circle cx="18" cy="18" r="5" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
            {/* Solar Rays */}
            <line x1="18" y1="4" x2="18" y2="7" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="18" y1="29" x2="18" y2="32" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="4" y1="18" x2="7" y2="18" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="29" y1="18" x2="32" y2="18" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
            {/* Diagonal Sun Rays */}
            <line x1="8" y1="8" x2="10.5" y2="10.5" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="28" y1="8" x2="25.5" y2="10.5" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="8" y1="28" x2="10.5" y2="25.5" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="28" y1="28" x2="25.5" y2="25.5" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
            {/* Gnomon Pointer & Cast Shadow */}
            <polygon points="18,18 24,24 22,25" fill="#0f172a" opacity="0.6" />
            <line x1="18" y1="18" x2="14" y2="12" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="18" cy="18" r="1.5" fill="#fef08a" />
          </svg>
        );

      default:
        return null;
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'writing': return 'Écriture';
      case 'pottery': return 'Poterie';
      case 'transport': return 'Roue';
      case 'weaving': return 'Tissage';
      case 'art': return 'Art';
      case 'music': return 'Musique';
      case 'medicine': return 'Médecine';
      case 'sundial': return 'Cadran';
    }
  };

  return (
    <span className="inline-flex items-center gap-1 shrink-0">
      {renderSvg()}
      {showLabel && (
        <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
          {getLabel()}
        </span>
      )}
    </span>
  );
};
