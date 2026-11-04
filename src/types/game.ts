// Types and Data Models for L'Âge de Pierre (Stone Age)

export type ResourceType = 'wood' | 'clay' | 'stone' | 'gold';

export type BoardLocationId = 
  | 'hunting'
  | 'forest'
  | 'clay_pit'
  | 'quarry'
  | 'river'
  | 'tool_maker'
  | 'hut'
  | 'field'
  | 'card_0'
  | 'card_1'
  | 'card_2'
  | 'card_3'
  | 'building_0'
  | 'building_1'
  | 'building_2'
  | 'building_3'
  // Extension 2 : Le Style, c'est le But
  | 'merchant'
  // Extension 3 : La Harde de Mammouths
  | 'mammoth';

export type GreenCultureSymbol =
  | 'writing'      // Écriture
  | 'pottery'      // Poterie
  | 'transport'    // Roue / Chariot
  | 'weaving'      // Tissage
  | 'art'          // Art / Peinture rupestre
  | 'music'        // Musique / Flûte
  | 'medicine'     // Médecine / Herbes
  | 'sundial';     // Cadran solaire / Astronomie

export type SandMultiplierType =
  | 'shaman'       // x population (meeples)
  | 'farmer'       // x agriculture track
  | 'tool_maker'   // x tool track value
  | 'builder';     // x number of buildings

export interface CivilizationCard {
  id: string;
  name: string;
  imageUrl?: string;
  classicImageUrl?: string;
  // Top bonus (immediate on purchase)
  topBonus: {
    type: 
      | 'resource_fixed'   // e.g. { wood: 2 }
      | 'food_fixed'       // e.g. 3 food
      | 'dice_roll'        // roll 2 dice for resources
      | 'dice_all_players' // roll 2 dice and everyone gets resources
      | 'tool_upgrade'     // +1 tool permanent
      | 'temp_tool'        // +1 to +4 temp tool
      | 'agriculture'      // +1 agriculture
      | 'victory_points'   // e.g. 3 VP
      | 'draw_card';       // draw 1 extra civilization card from deck
    value?: number;
    resources?: Partial<Record<ResourceType, number>>;
    resourceType?: ResourceType; // for dice_roll: resource being rolled (stone, wood, etc.)
    description: string;
  };
  // Bottom bonus (end-game scoring multiplier)
  bottomBonus: {
    type: 'green' | 'sand';
    greenSymbol?: GreenCultureSymbol;
    sandType?: SandMultiplierType;
    sandMultiplier?: number; // 1, 2, or 3
    description: string;
  };
}

export type BuildingCostType = 
  | 'fixed'          // Exact combination, e.g. 1 wood + 1 stone + 1 gold
  | 'any_1_to_7'     // Player chooses 1 to 7 resources of any type
  | 'variable'       // Variable building: exact resourceCount with differentTypesRequired types
  | '4_different'    // Legacy alias
  | '5_different'    // Legacy alias
  | '2_types_x2';    // Legacy alias

export type PassiveHutType = 
  | 'greenhouse'       // La Serre : +1 agriculture permanent immédiat
  | 'kindergarten'     // La Crèche : +1 ouvrier permanent immédiat
  | 'workshop_forge'   // L'Atelier de forge : +1 outil permanent immédiat
  | 'wood_quarry'      // Hutte de bois : +1 bois au début de chaque manche
  | 'clay_kiln'        // Hutte de glaise : +1 glaise au début de chaque manche
  | 'stone_shed';      // Hutte de pierre : +1 pierre au début de chaque manche

export interface BuildingTile {
  id: string;
  imageUrl?: string;
  costType: BuildingCostType;
  fixedCost?: Partial<Record<ResourceType, number>>;
  victoryPoints?: number;
  minResources?: number;
  maxResources?: number;
  resourceCount?: number;            // Total resources required (e.g. 4 or 5)
  differentTypesRequired?: number;   // Number of different resource types (1, 2, 3, 4)
  description: string;
  // Module Extensions : Les Nouvelles Huttes à Pouvoirs
  isSpecialHut?: boolean;
  passiveHutType?: PassiveHutType;
  passiveEffectDescription?: string;
}

export interface MammothTile {
  id: string;
  name: string;
  victoryPoints: number;
  bonusType: 'food' | 'resource' | 'tool' | 'agriculture' | 'pure_vp';
  bonusAmount: number;
  bonusResource?: ResourceType;
  description: string;
  imageUrl?: string;
}

export type PlayerColor = 'red' | 'blue' | 'yellow' | 'green';

export interface PlayerState {
  id: string;
  name: string;
  color: PlayerColor;
  isAi: boolean;
  aiDifficulty?: 'easy' | 'normal' | 'hard';
  
  // Meeples
  totalMeeples: number;       // Starts at 5, max 10
  availableMeeples: number;   // Available to place in current round
  newMeepleNextRound: boolean;// Did they visit the hut this round?
  
  // Village Engine
  food: number;               // Starts at 12 (or variant adjusted)
  agriculture: number;        // Starts at 0, max 10
  toolTiles: number[];        // Array of up to 3 tiles, each 0..4 (e.g. [1, 0, 0])
  toolsUsedThisRound: boolean[]; // Tracks which tool tiles were used this round
  temporaryTools: number;     // From cards
  
  // Resources
  resources: Record<ResourceType, number>;
  
  // Victory Points & Assets
  victoryPoints: number;
  civilizationCards: CivilizationCard[];
  buildings: BuildingTile[];
  
  // Extension 2 : Le Style c'est le But
  jewelry?: number;         // Ornements / Parures (0..10+)
  merchantLevel?: number;   // Niveau sur la Piste de Troc (0..5)

  // Extension 3 : La Harde de Mammouths
  mammothTiles?: MammothTile[]; // Trophées de chasse remportés

  // Placements in current round: locationId -> number of meeples
  placements: Partial<Record<BoardLocationId, number>>;
  
  // Feeding status
  fedThisRound?: boolean;
}

export type GamePhase = 
  | 'placement'     // Players take turns placing meeples
  | 'resolution'    // Players resolve their placed meeples
  | 'feeding'       // Feed the tribe (1 food per meeple)
  | 'round_end'     // Check end game, rotate first player
  | 'game_over';    // Score calculation & podium

export interface GameVariants {
  // Tour 1 balance
  firstTurnCourtesy: boolean;    // In 3 players: all 3 village spots open on Turn 1!
  startingCompensation: boolean;  // P1: standard, P2: +1 wood, P3: +1 clay, P4: +1 stone/tool
  
  // End Game balance
  twoPilesEnd: boolean;          // In 3-4 players: requires 2 piles empty instead of 1
  completeCycleEnd: boolean;     // Game ends only after full cycle (strict first-player equality)

  // Resource sharing at 2 players
  openResources2P?: boolean;     // À 2 joueurs : permet de partager les zones de ressources au lieu de la restriction stricte officielle (1 seul joueur)
}

export type GraphicEdition = 'modern' | 'classic';

export interface GameExpansionsConfig {
  newHuts: boolean;        // Extension 1 : Les 6 Nouvelles Huttes à Pouvoirs
  styleIsTheGoal: boolean; // Extension 2 : Échoppe du Marchand, Piste de Troc & Bijoux
  mammothHerd: boolean;    // Extension 3 : La Harde de Mammouths & Enchères nourriture
}

export const DEFAULT_EXPANSIONS: GameExpansionsConfig = {
  newHuts: false,
  styleIsTheGoal: false,
  mammothHerd: false,
};

export interface GameSettings {
  playerCount: number;
  edition?: GraphicEdition;
  players: {
    name: string;
    color: PlayerColor;
    isAi: boolean;
    aiDifficulty: 'easy' | 'normal' | 'hard';
  }[];
  variants: GameVariants;
  expansions?: GameExpansionsConfig;
}

export interface GameLogEntry {
  id: string;
  round: number;
  playerId?: string;
  text: string;
  type: 'action' | 'dice' | 'harvest' | 'village' | 'card' | 'building' | 'food' | 'info' | 'hunting';
  timestamp: number;
}

export interface GameState {
  round: number;
  phase: GamePhase;
  players: PlayerState[];
  firstPlayerIndex: number;
  activePlayerIndex: number;
  initialFirstPlayerIndex: number; // For complete cycle tracking
  endGameTriggered: boolean;
  endGameReason?: string;
  
  // Board state
  cardsDeck: CivilizationCard[];
  activeCards: (CivilizationCard | null)[]; // 4 slots
  buildingPiles: BuildingTile[][];          // 2 to 4 piles
  
  // Current resolution state (when in resolution phase)
  currentResolutionZone: BoardLocationId | null;
  
  // Extension 3 : La Harde de Mammouths
  mammothDeck?: MammothTile[];
  activeMammoth?: MammothTile | null;

  // Variants & Extensions active
  variants: GameVariants;
  expansions: GameExpansionsConfig;
  edition: GraphicEdition;
  
  // Game log
  log: GameLogEntry[];
}

export interface FinalPlayerScore {
  playerId: string;
  name: string;
  color: PlayerColor;
  isAi: boolean;
  
  boardPoints: number;            // Points acquired during game (buildings & card VP)
  greenCardPoints: number;        // From unique green culture sets (K^2)
  greenSets: GreenCultureSymbol[][];
  shamanPoints: number;           // Shamans * Meeples
  farmerPoints: number;           // Farmers * Agriculture
  toolMakerPoints: number;        // Tool Makers * Tool value
  builderPoints: number;          // Builders * Buildings count
  remainingResourcePoints: number;// 1 VP per remaining resource
  
  // Extensions scoring
  jewelryPoints?: number;         // Points de parures / bijoux
  mammothPoints?: number;         // Points des tuiles de mammouth
  mammothHunterBonus?: number;    // +10 VP pour le plus grand chasseur

  totalScore: number;
  rank: number;
}
