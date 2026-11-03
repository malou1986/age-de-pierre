import { BuildingTile, ResourceType } from '../types/game';

export const RESOURCE_VALUES: Record<ResourceType, number> = {
  wood: 3,
  clay: 4,
  stone: 5,
  gold: 6,
};

export const RESOURCE_NAMES: Record<ResourceType, { name: string; icon: string; color: string }> = {
  wood: { name: 'Bois', icon: '🪵', color: '#8B5A2B' },
  clay: { name: 'Glaise', icon: '🧱', color: '#C86432' },
  stone: { name: 'Pierre', icon: '🪨', color: '#78828A' },
  gold: { name: 'Or', icon: '✨', color: '#E5A93B' },
};

/**
 * The 28 authentic building tiles of Stone Age (L'Âge de Pierre)
 * Extracted from pages 1 and 3 of materiel.pdf.
 * Every single tile presents an exact cost and victory points bonus.
 * Pages 2 and 4 of materiel.pdf were printable card backs and have been removed.
 */
export const ALL_BUILDING_TILES: BuildingTile[] = [
  // --- Page 1 (20 Tuiles) ---
  // Tuile 00 (Ligne 0, Col 0) : 13 VP = 1 Bois (3) + 1 Glaise (4) + 1 Or (6)
  {
    id: 'b_00',
    imageUrl: '/buildings/b_00.png',
    costType: 'fixed',
    fixedCost: { wood: 1, clay: 1, gold: 1 },
    victoryPoints: 13,
    description: '1 Bois + 1 Glaise + 1 Or (13 VP)',
  },
  // Tuile 01 (Ligne 0, Col 1) : 5 ressources de 2 types différents
  {
    id: 'b_01',
    imageUrl: '/buildings/b_01.png',
    costType: 'variable',
    resourceCount: 5,
    differentTypesRequired: 2,
    description: '5 ressources de 2 types différents (? VP)',
  },
  // Tuile 02 (Ligne 0, Col 2) : 4 ressources de 2 types différents
  {
    id: 'b_02',
    imageUrl: '/buildings/b_02.png',
    costType: 'variable',
    resourceCount: 4,
    differentTypesRequired: 2,
    description: '4 ressources de 2 types différents (? VP)',
  },
  // Tuile 03 (Ligne 0, Col 3) : 15 VP = 1 Glaise (4) + 1 Pierre (5) + 1 Or (6)
  {
    id: 'b_03',
    imageUrl: '/buildings/b_03.png',
    costType: 'fixed',
    fixedCost: { clay: 1, stone: 1, gold: 1 },
    victoryPoints: 15,
    description: '1 Glaise + 1 Pierre + 1 Or (15 VP)',
  },
  // Tuile 04 (Ligne 1, Col 0) : 5 ressources de 4 types différents
  {
    id: 'b_04',
    imageUrl: '/buildings/b_04.png',
    costType: 'variable',
    resourceCount: 5,
    differentTypesRequired: 4,
    description: '5 ressources de 4 types différents (? VP)',
  },
  // Tuile 05 (Ligne 1, Col 1) : 12 VP = 2 Bois (6) + 1 Or (6)
  {
    id: 'b_05',
    imageUrl: '/buildings/b_05.png',
    costType: 'fixed',
    fixedCost: { wood: 2, gold: 1 },
    victoryPoints: 12,
    description: '2 Bois + 1 Or (12 VP)',
  },
  // Tuile 06 (Ligne 1, Col 2) : 4 ressources de 4 types différents
  {
    id: 'b_06',
    imageUrl: '/buildings/b_06.png',
    costType: 'variable',
    resourceCount: 4,
    differentTypesRequired: 4,
    description: '4 ressources de 4 types différents (18 VP)',
  },
  // Tuile 07 (Ligne 1, Col 3) : 15 VP = 1 Glaise (4) + 1 Pierre (5) + 1 Or (6)
  {
    id: 'b_07',
    imageUrl: '/buildings/b_07.png',
    costType: 'fixed',
    fixedCost: { clay: 1, stone: 1, gold: 1 },
    victoryPoints: 15,
    description: '1 Glaise + 1 Pierre + 1 Or (15 VP)',
  },
  // Tuile 08 (Ligne 2, Col 0) : 1 à 7 ressources au choix
  {
    id: 'b_08',
    imageUrl: '/buildings/b_08.png',
    costType: 'any_1_to_7',
    minResources: 1,
    maxResources: 7,
    description: '1 à 7 ressources au choix (? VP)',
  },
  // Tuile 09 (Ligne 2, Col 1) : 1 à 7 ressources au choix
  {
    id: 'b_09',
    imageUrl: '/buildings/b_09.png',
    costType: 'any_1_to_7',
    minResources: 1,
    maxResources: 7,
    description: '1 à 7 ressources au choix (? VP)',
  },
  // Tuile 10 (Ligne 2, Col 2) : 1 à 7 ressources au choix
  {
    id: 'b_10',
    imageUrl: '/buildings/b_10.png',
    costType: 'any_1_to_7',
    minResources: 1,
    maxResources: 7,
    description: '1 à 7 ressources au choix (? VP)',
  },
  // Tuile 11 (Ligne 2, Col 3) : 14 VP = 1 Bois (3) + 1 Pierre (5) + 1 Or (6)
  {
    id: 'b_11',
    imageUrl: '/buildings/b_11.png',
    costType: 'fixed',
    fixedCost: { wood: 1, stone: 1, gold: 1 },
    victoryPoints: 14,
    description: '1 Bois + 1 Pierre + 1 Or (14 VP)',
  },
  // Tuile 12 (Ligne 3, Col 0) : 10 VP = 2 Bois (6) + 1 Glaise (4)
  {
    id: 'b_12',
    imageUrl: '/buildings/b_12.png',
    costType: 'fixed',
    fixedCost: { wood: 2, clay: 1 },
    victoryPoints: 10,
    description: '2 Bois + 1 Glaise (10 VP)',
  },
  // Tuile 13 (Ligne 3, Col 1) : 13 VP = 1 Bois (3) + 1 Glaise (4) + 1 Or (6)
  {
    id: 'b_13',
    imageUrl: '/buildings/b_13.png',
    costType: 'fixed',
    fixedCost: { wood: 1, clay: 1, gold: 1 },
    victoryPoints: 13,
    description: '1 Bois + 1 Glaise + 1 Or (13 VP)',
  },
  // Tuile 14 (Ligne 3, Col 2) : 13 VP = 2 Glaises (8) + 1 Pierre (5)
  {
    id: 'b_14',
    imageUrl: '/buildings/b_14.png',
    costType: 'fixed',
    fixedCost: { clay: 2, stone: 1 },
    victoryPoints: 13,
    description: '2 Glaises + 1 Pierre (13 VP)',
  },
  // Tuile 15 (Ligne 3, Col 3) : 14 VP = 1 Glaise (4) + 2 Pierres (10)
  {
    id: 'b_15',
    imageUrl: '/buildings/b_15.png',
    costType: 'fixed',
    fixedCost: { clay: 1, stone: 2 },
    victoryPoints: 14,
    description: '1 Glaise + 2 Pierres (14 VP)',
  },
  // Tuile 16 (Ligne 4, Col 0) : 5 ressources d'un seul type
  {
    id: 'b_16',
    imageUrl: '/buildings/b_16.png',
    costType: 'variable',
    resourceCount: 5,
    differentTypesRequired: 1,
    description: '5 ressources d\'un seul type (? VP)',
  },
  // Tuile 17 (Ligne 4, Col 1) : 11 VP = 1 Bois (3) + 2 Glaises (8)
  {
    id: 'b_17',
    imageUrl: '/buildings/b_17.png',
    costType: 'fixed',
    fixedCost: { wood: 1, clay: 2 },
    victoryPoints: 11,
    description: '1 Bois + 2 Glaises (11 VP)',
  },
  // Tuile 18 (Ligne 4, Col 2) : 4 ressources d'un seul type
  {
    id: 'b_18',
    imageUrl: '/buildings/b_18.png',
    costType: 'variable',
    resourceCount: 4,
    differentTypesRequired: 1,
    description: '4 ressources d\'un seul type (? VP)',
  },
  // Tuile 19 (Ligne 4, Col 3) : 12 VP = 1 Bois (3) + 1 Glaise (4) + 1 Pierre (5)
  {
    id: 'b_19',
    imageUrl: '/buildings/b_19.png',
    costType: 'fixed',
    fixedCost: { wood: 1, clay: 1, stone: 1 },
    victoryPoints: 12,
    description: '1 Bois + 1 Glaise + 1 Pierre (12 VP)',
  },

  // --- Page 3 (8 Tuiles) ---
  // Tuile 20 (Ligne 0, Col 0) : 13 VP = 1 Bois (3) + 2 Pierres (10)
  {
    id: 'b_20',
    imageUrl: '/buildings/b_20.png',
    costType: 'fixed',
    fixedCost: { wood: 1, stone: 2 },
    victoryPoints: 13,
    description: '1 Bois + 2 Pierres (13 VP)',
  },
  // Tuile 21 (Ligne 0, Col 1) : 5 ressources de 3 types différents
  {
    id: 'b_21',
    imageUrl: '/buildings/b_21.png',
    costType: 'variable',
    resourceCount: 5,
    differentTypesRequired: 3,
    description: '5 ressources de 3 types différents (? VP)',
  },
  // Tuile 22 (Ligne 0, Col 2) : 14 VP = 1 Bois (3) + 1 Pierre (5) + 1 Or (6)
  {
    id: 'b_22',
    imageUrl: '/buildings/b_22.png',
    costType: 'fixed',
    fixedCost: { wood: 1, stone: 1, gold: 1 },
    victoryPoints: 14,
    description: '1 Bois + 1 Pierre + 1 Or (14 VP)',
  },
  // Tuile 23 (Ligne 0, Col 3) : 16 VP = 2 Pierres (10) + 1 Or (6)
  {
    id: 'b_23',
    imageUrl: '/buildings/b_23.png',
    costType: 'fixed',
    fixedCost: { stone: 2, gold: 1 },
    victoryPoints: 16,
    description: '2 Pierres + 1 Or (16 VP)',
  },
  // Tuile 24 (Ligne 1, Col 0) : 12 VP = 1 Bois (3) + 1 Glaise (4) + 1 Pierre (5)
  {
    id: 'b_24',
    imageUrl: '/buildings/b_24.png',
    costType: 'fixed',
    fixedCost: { wood: 1, clay: 1, stone: 1 },
    victoryPoints: 12,
    description: '1 Bois + 1 Glaise + 1 Pierre (12 VP)',
  },
  // Tuile 25 (Ligne 1, Col 1) : 11 VP = 2 Bois (6) + 1 Pierre (5)
  {
    id: 'b_25',
    imageUrl: '/buildings/b_25.png',
    costType: 'fixed',
    fixedCost: { wood: 2, stone: 1 },
    victoryPoints: 11,
    description: '2 Bois + 1 Pierre (11 VP)',
  },
  // Tuile 26 (Ligne 1, Col 2) : 14 VP = 2 Glaises (8) + 1 Or (6)
  {
    id: 'b_26',
    imageUrl: '/buildings/b_26.png',
    costType: 'fixed',
    fixedCost: { clay: 2, gold: 1 },
    victoryPoints: 14,
    description: '2 Glaises + 1 Or (14 VP)',
  },
  // Tuile 27 (Ligne 1, Col 3) : 4 ressources de 3 types différents
  {
    id: 'b_27',
    imageUrl: '/buildings/b_27.png',
    costType: 'variable',
    resourceCount: 4,
    differentTypesRequired: 3,
    description: '4 ressources de 3 types différents (? VP)',
  },
];
