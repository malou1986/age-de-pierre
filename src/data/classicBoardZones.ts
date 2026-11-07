import { BoardLocationId } from '../types/game';

export interface ClassicZoneData {
  id: string;
  name: string;
  sublabel: string;
  category: 'resources' | 'village' | 'buildings' | 'cards' | 'expansions' | 'tracks';
  color: string;
  left: number;   // % (0..100)
  top: number;    // % (0..100)
  width: number;  // % (0..100)
  height: number; // % (0..100)
  radius?: number; // 3D disc radius
  capacity?: string;
}

export const DEFAULT_CLASSIC_ZONES: Record<string, ClassicZoneData> = {
  mammoth: {
    id: 'mammoth',
    name: 'Harde Mammouths',
    sublabel: 'Extension Mammouth',
    category: 'expansions',
    color: '#06b6d4',
    left: 9.87,
    top: 7.53,
    width: 15.79,
    height: 10.36,
    radius: 6.5,
    capacity: 'Max 4 ouvriers',
  },
  hunting: {
    id: 'hunting',
    name: 'Zone de Chasse',
    sublabel: 'Nourriture ÷2',
    category: 'resources',
    color: '#f59e0b',
    left: 5.92,
    top: 17.89,
    width: 21.71,
    height: 25.42,
    radius: 8.5,
    capacity: 'Ouvriers illimités',
  },
  forest: {
    id: 'forest',
    name: 'La Forêt',
    sublabel: 'Bois ÷3',
    category: 'resources',
    color: '#10b981',
    left: 30.26,
    top: 11.30,
    width: 17.11,
    height: 29.19,
    radius: 8.0,
    capacity: 'Max 7 ouvriers',
  },
  clay_pit: {
    id: 'clay_pit',
    name: 'La Glaisière',
    sublabel: 'Glaise ÷4',
    category: 'resources',
    color: '#f97316',
    left: 48.03,
    top: 9.42,
    width: 17.76,
    height: 28.25,
    radius: 8.0,
    capacity: 'Max 7 ouvriers',
  },
  quarry: {
    id: 'quarry',
    name: 'La Carrière',
    sublabel: 'Pierre ÷5',
    category: 'resources',
    color: '#94a3b8',
    left: 76.97,
    top: 9.42,
    width: 17.11,
    height: 31.07,
    radius: 8.0,
    capacity: 'Max 7 ouvriers',
  },
  river: {
    id: 'river',
    name: 'La Rivière',
    sublabel: 'Or ÷6',
    category: 'resources',
    color: '#eab308',
    left: 71.71,
    top: 45.20,
    width: 22.37,
    height: 20.72,
    radius: 7.5,
    capacity: 'Max 7 ouvriers',
  },
  field: {
    id: 'field',
    name: 'Champ de Blé',
    sublabel: '+1 Agriculture',
    category: 'village',
    color: '#84cc16',
    left: 26.97,
    top: 46.14,
    width: 12.50,
    height: 17.89,
    radius: 5.5,
    capacity: 'Max 1 ouvrier',
  },
  hut: {
    id: 'hut',
    name: 'Hutte de Naissance',
    sublabel: '+1 Ouvrier',
    category: 'village',
    color: '#f43f5e',
    left: 36.84,
    top: 58.38,
    width: 12.50,
    height: 14.12,
    radius: 6.0,
    capacity: '2 ouvriers requis',
  },
  tool_maker: {
    id: 'tool_maker',
    name: "Fabricant d'outils",
    sublabel: '+1 Outil',
    category: 'village',
    color: '#3b82f6',
    left: 50.00,
    top: 41.43,
    width: 13.16,
    height: 16.01,
    radius: 5.5,
    capacity: 'Max 1 ouvrier',
  },
  merchant: {
    id: 'merchant',
    name: 'Marchand (Troc)',
    sublabel: 'Extension Parures',
    category: 'expansions',
    color: '#a855f7',
    left: 18.42,
    top: 46.14,
    width: 8.55,
    height: 16.95,
    radius: 6.0,
    capacity: 'Max 1 ouvrier',
  },
  building_0: {
    id: 'building_0',
    name: 'Bâtiment 1',
    sublabel: 'Pile 1 (gauche)',
    category: 'buildings',
    color: '#6366f1',
    left: 5.79,
    top: 72.32,
    width: 10.53,
    height: 19.21,
    radius: 5.5,
    capacity: 'Max 1 ouvrier',
  },
  building_1: {
    id: 'building_1',
    name: 'Bâtiment 2',
    sublabel: 'Pile 2',
    category: 'buildings',
    color: '#6366f1',
    left: 16.32,
    top: 72.32,
    width: 10.53,
    height: 19.21,
    radius: 5.5,
    capacity: 'Max 1 ouvrier',
  },
  building_2: {
    id: 'building_2',
    name: 'Bâtiment 3',
    sublabel: 'Pile 3',
    category: 'buildings',
    color: '#6366f1',
    left: 26.84,
    top: 72.32,
    width: 10.53,
    height: 19.21,
    radius: 5.5,
    capacity: 'Max 1 ouvrier',
  },
  building_3: {
    id: 'building_3',
    name: 'Bâtiment 4',
    sublabel: 'Pile 4 (droite)',
    category: 'buildings',
    color: '#6366f1',
    left: 37.37,
    top: 72.32,
    width: 10.66,
    height: 19.21,
    radius: 5.5,
    capacity: 'Max 1 ouvrier',
  },
  card_3: {
    id: 'card_3',
    name: 'Carte #4',
    sublabel: 'Coût: 4 res.',
    category: 'cards',
    color: '#059669',
    left: 51.45,
    top: 66.85,
    width: 10.66,
    height: 24.67,
    radius: 6.0,
    capacity: 'Coût: 4 ressources',
  },
  card_2: {
    id: 'card_2',
    name: 'Carte #3',
    sublabel: 'Coût: 3 res.',
    category: 'cards',
    color: '#059669',
    left: 62.11,
    top: 66.85,
    width: 10.66,
    height: 24.67,
    radius: 6.0,
    capacity: 'Coût: 3 ressources',
  },
  card_1: {
    id: 'card_1',
    name: 'Carte #2',
    sublabel: 'Coût: 2 res.',
    category: 'cards',
    color: '#059669',
    left: 72.76,
    top: 66.85,
    width: 10.66,
    height: 24.67,
    radius: 6.0,
    capacity: 'Coût: 2 ressources',
  },
  card_0: {
    id: 'card_0',
    name: 'Carte #1',
    sublabel: 'Coût: 1 res.',
    category: 'cards',
    color: '#059669',
    left: 83.42,
    top: 66.85,
    width: 10.66,
    height: 24.67,
    radius: 6.0,
    capacity: 'Coût: 1 ressource',
  },
  agri_track: {
    id: 'agri_track',
    name: 'Piste Agriculture',
    sublabel: 'Niveaux 0..10',
    category: 'tracks',
    color: '#d97706',
    left: 1.84,
    top: 33.90,
    width: 3.95,
    height: 54.61,
    radius: 4.0,
    capacity: 'Piste verticale',
  },
};

const STORAGE_KEY = 'stone_age_classic_custom_zones_v1';
export const CLASSIC_ZONES_UPDATED_EVENT = 'stone_age_classic_zones_updated';

/**
 * Loads current classic zones (from localStorage if custom, otherwise default)
 */
export function getClassicZones(): Record<string, ClassicZoneData> {
  if (typeof window === 'undefined') return { ...DEFAULT_CLASSIC_ZONES };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CLASSIC_ZONES };
    const parsed = JSON.parse(raw);
    // Merge with defaults to ensure all fields and zones exist
    const merged: Record<string, ClassicZoneData> = { ...DEFAULT_CLASSIC_ZONES };
    Object.keys(parsed).forEach(k => {
      if (merged[k]) {
        merged[k] = { ...merged[k], ...parsed[k] };
      } else {
        merged[k] = parsed[k];
      }
    });
    return merged;
  } catch (err) {
    console.warn('Failed to parse classic zones from localStorage', err);
    return { ...DEFAULT_CLASSIC_ZONES };
  }
}

/**
 * Saves classic zones to localStorage and dispatches an event
 */
export function saveClassicZones(zones: Record<string, ClassicZoneData>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
    window.dispatchEvent(new CustomEvent(CLASSIC_ZONES_UPDATED_EVENT, { detail: zones }));
  } catch (err) {
    console.error('Failed to save classic zones to localStorage', err);
  }
}

/**
 * Resets classic zones to the factory defaults
 */
export function resetClassicZones(): Record<string, ClassicZoneData> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(CLASSIC_ZONES_UPDATED_EVENT, { detail: DEFAULT_CLASSIC_ZONES }));
    } catch (err) {
      console.error('Failed to reset classic zones in localStorage', err);
    }
  }
  return { ...DEFAULT_CLASSIC_ZONES };
}

/**
 * Helper to compute center coordinates as fractions (0..1)
 */
export function getZoneCenterPct(zone: ClassicZoneData): { xPct: number; yPct: number } {
  return {
    xPct: (zone.left + zone.width / 2) / 100,
    yPct: (zone.top + zone.height / 2) / 100,
  };
}
