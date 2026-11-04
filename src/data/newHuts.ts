import { BuildingTile } from '../types/game';

/**
 * Extension officielle : Les Nouvelles Huttes à Pouvoirs (The New Huts)
 * 6 bâtiments uniques dotés de capacités continues ou d'effets immédiats
 */
export const NEW_HUTS_TILES: BuildingTile[] = [
  // 1. Hutte du Bûcheron : +1 Bois récurrent chaque manche
  {
    id: 'hut_wood_quarry',
    imageUrl: '/buildings/peps/tile_hut_wood.jpg',
    costType: 'fixed',
    fixedCost: { wood: 3 },
    victoryPoints: 3,
    description: 'Hutte du Bûcheron : 3 Bois (3 VP). +1 Bois gratuit au début de chaque manche.',
    isSpecialHut: true,
    passiveHutType: 'wood_quarry',
    passiveEffectDescription: '+1 Bois au début de chaque manche',
  },

  // 2. Fournil de Glaise : +1 Glaise récurrente chaque manche
  {
    id: 'hut_clay_kiln',
    imageUrl: '/buildings/peps/tile_masonry_clay.jpg',
    costType: 'fixed',
    fixedCost: { clay: 3 },
    victoryPoints: 4,
    description: 'Fournil de Glaise : 3 Glaise (4 VP). +1 Glaise gratuite au début de chaque manche.',
    isSpecialHut: true,
    passiveHutType: 'clay_kiln',
    passiveEffectDescription: '+1 Glaise au début de chaque manche',
  },

  // 3. Abri du Carrier : +1 Pierre récurrente chaque manche
  {
    id: 'hut_stone_shed',
    imageUrl: '/buildings/peps/tile_stone_megalith.jpg',
    costType: 'fixed',
    fixedCost: { stone: 3 },
    victoryPoints: 5,
    description: 'Abri du Carrier : 3 Pierre (5 VP). +1 Pierre gratuite au début de chaque manche.',
    isSpecialHut: true,
    passiveHutType: 'stone_shed',
    passiveEffectDescription: '+1 Pierre au début de chaque manche',
  },

  // 4. La Crèche : +1 Ouvrier permanent immédiat
  {
    id: 'hut_kindergarten',
    imageUrl: '/buildings/peps/tile_modular_compound.jpg',
    costType: 'fixed',
    fixedCost: { clay: 1, gold: 1 },
    victoryPoints: 5,
    description: 'La Crèche : 1 Glaise + 1 Or (5 VP). Accorde immédiatement +1 Ouvrier permanent.',
    isSpecialHut: true,
    passiveHutType: 'kindergarten',
    passiveEffectDescription: '+1 Ouvrier permanent immédiat',
  },

  // 5. Atelier de Forge : +1 Outil permanent immédiat
  {
    id: 'hut_workshop_forge',
    imageUrl: '/buildings/peps/tile_hut_wood.jpg',
    costType: 'fixed',
    fixedCost: { wood: 1, stone: 1 },
    victoryPoints: 5,
    description: 'Atelier de Forge : 1 Bois + 1 Pierre (5 VP). Accorde immédiatement +1 Outil permanent.',
    isSpecialHut: true,
    passiveHutType: 'workshop_forge',
    passiveEffectDescription: '+1 Outil permanent immédiat',
  },

  // 6. La Serre : +1 Niveau d’Agriculture immédiat
  {
    id: 'hut_greenhouse',
    imageUrl: '/buildings/peps/tile_modular_compound.jpg',
    costType: 'variable',
    resourceCount: 3,
    differentTypesRequired: 1,
    victoryPoints: 5,
    description: 'La Serre : 3 ressources au choix (5 VP). Avance immédiatement de +1 sur la piste d’agriculture.',
    isSpecialHut: true,
    passiveHutType: 'greenhouse',
    passiveEffectDescription: '+1 Agriculture immédiate',
  },
];
