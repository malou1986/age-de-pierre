import React from 'react';
import { PlayerColor } from '../types/game';

interface MeepleProps {
  color: PlayerColor;
  size?: number;
  count?: number;
  className?: string;
  glow?: boolean;
}

const COLOR_MAP: Record<PlayerColor, { fill: string; stroke: string; shadow: string }> = {
  red: { fill: '#E11D48', stroke: '#9F1239', shadow: 'rgba(225, 29, 72, 0.4)' },
  blue: { fill: '#2563EB', stroke: '#1E40AF', shadow: 'rgba(37, 99, 235, 0.4)' },
  yellow: { fill: '#F59E0B', stroke: '#B45309', shadow: 'rgba(245, 158, 11, 0.4)' },
  green: { fill: '#10B981', stroke: '#047857', shadow: 'rgba(16, 185, 129, 0.4)' },
};

export const MeepleIcon: React.FC<MeepleProps> = ({ 
  color, 
  size = 32, 
  count, 
  className = '',
  glow = false
}) => {
  const c = COLOR_MAP[color] || COLOR_MAP.red;

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="transition-transform duration-200 hover:scale-110 drop-shadow-md"
        style={{
          filter: glow ? `drop-shadow(0 0 6px ${c.shadow})` : 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))'
        }}
      >
        {/* Wooden Meeple Silhouette */}
        <defs>
          <linearGradient id={`grad_${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c.fill} />
            <stop offset="100%" stopColor={c.stroke} />
          </linearGradient>
        </defs>

        {/* Head */}
        <circle cx="50" cy="22" r="14" fill={`url(#grad_${color})`} stroke={c.stroke} strokeWidth="2.5" />

        {/* Body and Limbs */}
        <path
          d="M 40,34 
             C 32,38 20,44 14,50 
             C 10,54 13,60 18,60 
             C 24,60 33,52 38,48 
             L 36,75 
             L 24,92 
             C 20,97 27,100 32,97 
             L 48,76 
             L 52,76 
             L 68,97 
             C 73,100 80,97 76,92 
             L 64,75 
             L 62,48 
             C 67,52 76,60 82,60 
             C 87,60 90,54 86,50 
             C 80,44 68,38 60,34 
             Z"
          fill={`url(#grad_${color})`}
          stroke={c.stroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Highlight sheen for 3D wooden effect */}
        <path
          d="M 46,16 C 50,14 54,14 56,16"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Meeple count badge if > 1 */}
      {count !== undefined && count > 1 && (
        <span 
          className="absolute -bottom-1 -right-1 bg-stone-900 border border-amber-300 text-amber-300 font-bold text-xs rounded-full px-1.5 py-0.2 shadow-lg"
          style={{ fontSize: Math.max(10, size * 0.35) }}
        >
          {count}
        </span>
      )}
    </div>
  );
};
