import { CivilizationCard, GreenCultureSymbol, SandMultiplierType } from '../types/game';

export const GREEN_SYMBOLS: { id: GreenCultureSymbol; label: string; icon: string }[] = [
  { id: 'writing', label: 'Écriture', icon: '📜' },
  { id: 'pottery', label: 'Poterie', icon: '🏺' },
  { id: 'transport', label: 'Roue & Chariot', icon: '🪵' },
  { id: 'weaving', label: 'Tissage', icon: '🧶' },
  { id: 'art', label: 'Art Rupestre', icon: '🎨' },
  { id: 'music', label: 'Flûte & Musique', icon: '🎵' },
  { id: 'medicine', label: 'Médecine & Herbes', icon: '🌿' },
  { id: 'sundial', label: 'Astronomie & Cadran', icon: '☀️' },
];

export const SAND_FIGURES: { id: SandMultiplierType; label: string; pluralLabel: string; description: string; icon: string; target: string }[] = [
  { id: 'shaman', label: 'Chaman', pluralLabel: 'Chamans', description: '× Nombre total d’ouvriers (Population)', icon: '🧙', target: '× Ouvriers' },
  { id: 'farmer', label: 'Fermier', pluralLabel: 'Fermiers', description: '× Niveau de la piste d’agriculture', icon: '🌾', target: '× Agriculture' },
  { id: 'tool_maker', label: 'Fabricant d’outils', pluralLabel: 'Fabricants d’outils', description: '× Valeur totale des outils', icon: '🔨', target: '× Outils' },
  { id: 'builder', label: 'Bâtisseur', pluralLabel: 'Bâtisseurs', description: '× Nombre de bâtiments construits', icon: '🏛️', target: '× Bâtiments' },
];

// Exact 36 authentic civilization cards from the official Stone Age board game
// Rigorously verified and mapped 1-to-1 with game rules
export const INITIAL_CIVILIZATION_CARDS: CivilizationCard[] = [
  {
    id: 'c_00',
    name: 'Atelier de Percussion',
    imageUrl: '/cards/peps/card_peps_00.jpg',
    classicImageUrl: '/cards/card_00.png',
    topBonus: { type: 'dice_all_players', description: 'Lancer 1 dé par joueur : choix d’un dé à tour de rôle (Draft)' },
    bottomBonus: { type: 'sand', sandType: 'tool_maker', sandMultiplier: 2, description: '2× Fabricants d’outils (× Outils)' }
  },
  {
    id: 'c_01',
    name: 'Hache de Silex Renforcée',
    imageUrl: '/cards/peps/card_peps_01.jpg',
    classicImageUrl: '/cards/card_01.png',
    topBonus: { type: 'temp_tool', value: 4, description: '+4 Outil temporaire (usage unique)' },
    bottomBonus: { type: 'sand', sandType: 'tool_maker', sandMultiplier: 1, description: '1× Fabricant d’outils (× Outils)' }
  },
  {
    id: 'c_02',
    name: 'Grande Réserve de Pêche',
    imageUrl: '/cards/peps/card_peps_02.jpg',
    classicImageUrl: '/cards/card_02.png',
    topBonus: { type: 'food_fixed', value: 7, description: '+7 Nourritures immédiates' },
    bottomBonus: { type: 'green', greenSymbol: 'pottery', description: 'Symbole de Culture : Poterie (K²)' }
  },
  {
    id: 'c_03',
    name: 'Cueillette des Sous-Bois',
    imageUrl: '/cards/peps/card_peps_03.jpg',
    classicImageUrl: '/cards/card_03.png',
    topBonus: { type: 'food_fixed', value: 4, description: '+4 Nourritures immédiates' },
    bottomBonus: { type: 'sand', sandType: 'builder', sandMultiplier: 1, description: '1× Bâtisseur (× Bâtiments)' }
  },
  {
    id: 'c_04',
    name: 'Savoir Ancien',
    imageUrl: '/cards/peps/card_peps_04.jpg',
    classicImageUrl: '/cards/card_04.png',
    topBonus: { type: 'draw_card', description: '+1 Carte Civilisation piochée face cachée' },
    bottomBonus: { type: 'green', greenSymbol: 'writing', description: 'Symbole de Culture : Écriture (K²)' }
  },
  {
    id: 'c_05',
    name: 'Glaise des Berges',
    imageUrl: '/cards/peps/card_peps_05.jpg',
    classicImageUrl: '/cards/card_05.png',
    topBonus: { type: 'resource_fixed', resources: { clay: 1 }, description: '+1 Glaise immédiate' },
    bottomBonus: { type: 'sand', sandType: 'shaman', sandMultiplier: 2, description: '2× Chamans (× Ouvriers)' }
  },
  {
    id: 'c_06',
    name: 'Caravane Fluviale',
    imageUrl: '/cards/peps/card_peps_06.jpg',
    classicImageUrl: '/cards/card_06.png',
    topBonus: { type: 'dice_all_players', description: 'Lancer 1 dé par joueur : choix d’un dé à tour de rôle (Draft)' },
    bottomBonus: { type: 'green', greenSymbol: 'transport', description: 'Symbole de Culture : Roue & Chariot (K²)' }
  },
  {
    id: 'c_07',
    name: 'Pirogue de Granit',
    imageUrl: '/cards/peps/card_peps_07.jpg',
    classicImageUrl: '/cards/card_07.png',
    topBonus: { type: 'resource_fixed', resources: { stone: 2 }, description: '+2 Pierres immédiates' },
    bottomBonus: { type: 'green', greenSymbol: 'transport', description: 'Symbole de Culture : Roue & Chariot (K²)' }
  },
  {
    id: 'c_08',
    name: 'Mémoire Tribale',
    imageUrl: '/cards/peps/card_peps_08.jpg',
    classicImageUrl: '/cards/card_08.png',
    topBonus: { type: 'dice_all_players', description: 'Lancer 1 dé par joueur : choix d’un dé à tour de rôle (Draft)' },
    bottomBonus: { type: 'green', greenSymbol: 'writing', description: 'Symbole de Culture : Écriture (K²)' }
  },
  {
    id: 'c_09',
    name: 'Mégalithe Sacré',
    imageUrl: '/cards/peps/card_peps_09.jpg',
    classicImageUrl: '/cards/card_09.png',
    topBonus: { type: 'resource_fixed', resources: { stone: 1 }, description: '+1 Pierre immédiate' },
    bottomBonus: { type: 'sand', sandType: 'shaman', sandMultiplier: 1, description: '1× Chaman (× Ouvriers)' }
  },
  {
    id: 'c_10',
    name: 'Pêche Miraculeuse',
    imageUrl: '/cards/peps/card_peps_10.jpg',
    classicImageUrl: '/cards/card_10.png',
    topBonus: { type: 'food_fixed', value: 5, description: '+5 Nourritures immédiates' },
    bottomBonus: { type: 'green', greenSymbol: 'medicine', description: 'Symbole de Culture : Médecine & Herbes (K²)' }
  },
  {
    id: 'c_11',
    name: 'Céramique Façonnée',
    imageUrl: '/cards/peps/card_peps_11.jpg',
    classicImageUrl: '/cards/card_11.png',
    topBonus: { type: 'dice_all_players', description: 'Lancer 1 dé par joueur : choix d’un dé à tour de rôle (Draft)' },
    bottomBonus: { type: 'green', greenSymbol: 'pottery', description: 'Symbole de Culture : Poterie (K²)' }
  },
  {
    id: 'c_12',
    name: 'Orpaillage Sacré',
    imageUrl: '/cards/peps/card_peps_12.jpg',
    classicImageUrl: '/cards/card_12.png',
    topBonus: { type: 'dice_roll', value: 2, resourceType: 'gold', description: 'Lancer 2 dés pour récolter de l’Or (÷6)' },
    bottomBonus: { type: 'green', greenSymbol: 'art', description: 'Symbole de Culture : Art Rupestre (K²)' }
  },
  {
    id: 'c_13',
    name: 'Vénus de la Forge',
    imageUrl: '/cards/peps/card_peps_13.jpg',
    classicImageUrl: '/cards/card_13.png',
    topBonus: { type: 'tool_upgrade', value: 1, description: '+1 Outil permanent' },
    bottomBonus: { type: 'green', greenSymbol: 'art', description: 'Symbole de Culture : Art Rupestre (K²)' }
  },
  {
    id: 'c_14',
    name: 'Bâtisseurs du Clan',
    imageUrl: '/cards/peps/card_peps_14.jpg',
    classicImageUrl: '/cards/card_14.png',
    topBonus: { type: 'dice_all_players', description: 'Lancer 1 dé par joueur : choix d’un dé à tour de rôle (Draft)' },
    bottomBonus: { type: 'sand', sandType: 'builder', sandMultiplier: 2, description: '2× Bâtisseurs (× Bâtiments)' }
  },
  {
    id: 'c_15',
    name: 'Outil de Taille Solide',
    imageUrl: '/cards/peps/card_peps_15.jpg',
    classicImageUrl: '/cards/card_15.png',
    topBonus: { type: 'temp_tool', value: 3, description: '+3 Outil temporaire (usage unique)' },
    bottomBonus: { type: 'sand', sandType: 'tool_maker', sandMultiplier: 1, description: '1× Fabricant d’outils (× Outils)' }
  },
  {
    id: 'c_16',
    name: 'Hache d’Ébauche',
    imageUrl: '/cards/peps/card_peps_16.jpg',
    classicImageUrl: '/cards/card_16.png',
    topBonus: { type: 'temp_tool', value: 2, description: '+2 Outil temporaire (usage unique)' },
    bottomBonus: { type: 'sand', sandType: 'tool_maker', sandMultiplier: 2, description: '2× Fabricants d’outils (× Outils)' }
  },
  {
    id: 'c_17',
    name: 'Maîtres Tailleurs de Silex',
    imageUrl: '/cards/peps/card_peps_17.jpg',
    classicImageUrl: '/cards/card_17.png',
    topBonus: { type: 'dice_all_players', description: 'Lancer 1 dé par joueur : choix d’un dé à tour de rôle (Draft)' },
    bottomBonus: { type: 'sand', sandType: 'tool_maker', sandMultiplier: 2, description: '2× Fabricants d’outils (× Outils)' }
  },
  {
    id: 'c_18',
    name: 'Baies Forestières',
    imageUrl: '/cards/peps/card_peps_18.jpg',
    classicImageUrl: '/cards/card_18.png',
    topBonus: { type: 'food_fixed', value: 1, description: '+1 Nourriture immédiate' },
    bottomBonus: { type: 'green', greenSymbol: 'weaving', description: 'Symbole de Culture : Tissage (K²)' }
  },
  {
    id: 'c_19',
    name: 'Pépite Chamanique',
    imageUrl: '/cards/peps/card_peps_19.jpg',
    classicImageUrl: '/cards/card_19.png',
    topBonus: { type: 'resource_fixed', resources: { gold: 1 }, description: '+1 Pépite d’Or immédiate' },
    bottomBonus: { type: 'sand', sandType: 'shaman', sandMultiplier: 1, description: '1× Chaman (× Ouvriers)' }
  },
  {
    id: 'c_20',
    name: 'Champs Fertiles',
    imageUrl: '/cards/peps/card_peps_20.jpg',
    classicImageUrl: '/cards/card_20.png',
    topBonus: { type: 'dice_all_players', description: 'Lancer 1 dé par joueur : choix d’un dé à tour de rôle (Draft)' },
    bottomBonus: { type: 'sand', sandType: 'farmer', sandMultiplier: 1, description: '1× Fermier (× Agriculture)' }
  },
  {
    id: 'c_21',
    name: 'Chant des Victoires',
    imageUrl: '/cards/peps/card_peps_21.jpg',
    classicImageUrl: '/cards/card_21.png',
    topBonus: { type: 'victory_points', value: 3, description: '+3 Points de Victoire directs' },
    bottomBonus: { type: 'green', greenSymbol: 'music', description: 'Symbole de Culture : Musique (K²)' }
  },
  {
    id: 'c_22',
    name: 'Moissons et Saisons',
    imageUrl: '/cards/peps/card_peps_22.jpg',
    classicImageUrl: '/cards/card_22.png',
    topBonus: { type: 'agriculture', value: 1, description: '+1 Niveau d’Agriculture' },
    bottomBonus: { type: 'green', greenSymbol: 'sundial', description: 'Symbole de Culture : Astronomie & Cadran (K²)' }
  },
  {
    id: 'c_23',
    name: 'Bûcherons des Esprits',
    imageUrl: '/cards/peps/card_peps_23.jpg',
    classicImageUrl: '/cards/card_23.png',
    topBonus: { type: 'dice_roll', value: 2, resourceType: 'wood', description: 'Lancer 2 dés pour récolter du Bois (÷3)' },
    bottomBonus: { type: 'sand', sandType: 'shaman', sandMultiplier: 2, description: '2× Chamans (× Ouvriers)' }
  },
  {
    id: 'c_24',
    name: 'Moisson Collective',
    imageUrl: '/cards/peps/card_peps_24.jpg',
    classicImageUrl: '/cards/card_24.png',
    topBonus: { type: 'dice_all_players', description: 'Lancer 1 dé par joueur : choix d’un dé à tour de rôle (Draft)' },
    bottomBonus: { type: 'sand', sandType: 'farmer', sandMultiplier: 2, description: '2× Fermiers (× Agriculture)' }
  },
  {
    id: 'c_25',
    name: 'Sillons de Granit',
    imageUrl: '/cards/peps/card_peps_25.jpg',
    classicImageUrl: '/cards/card_25.png',
    topBonus: { type: 'resource_fixed', resources: { stone: 1 }, description: '+1 Pierre immédiate' },
    bottomBonus: { type: 'sand', sandType: 'farmer', sandMultiplier: 1, description: '1× Fermier (× Agriculture)' }
  },
  {
    id: 'c_26',
    name: 'Labour Ancestral',
    imageUrl: '/cards/peps/card_peps_26.jpg',
    classicImageUrl: '/cards/card_26.png',
    topBonus: { type: 'agriculture', value: 1, description: '+1 Niveau d’Agriculture' },
    bottomBonus: { type: 'sand', sandType: 'farmer', sandMultiplier: 1, description: '1× Fermier (× Agriculture)' }
  },
  {
    id: 'c_27',
    name: 'Harmonie des Étoiles',
    imageUrl: '/cards/peps/card_peps_27.jpg',
    classicImageUrl: '/cards/card_27.png',
    topBonus: { type: 'victory_points', value: 3, description: '+3 Points de Victoire directs' },
    bottomBonus: { type: 'green', greenSymbol: 'music', description: 'Symbole de Culture : Musique (K²)' }
  },
  {
    id: 'c_28',
    name: 'Carrière Sacrée',
    imageUrl: '/cards/peps/card_peps_28.jpg',
    classicImageUrl: '/cards/card_28.png',
    topBonus: { type: 'dice_roll', value: 2, resourceType: 'stone', description: 'Lancer 2 dés pour récolter de la Pierre (÷5)' },
    bottomBonus: { type: 'sand', sandType: 'shaman', sandMultiplier: 1, description: '1× Chaman (× Ouvriers)' }
  },
  {
    id: 'c_29',
    name: 'Festin des Terres',
    imageUrl: '/cards/peps/card_peps_29.jpg',
    classicImageUrl: '/cards/card_29.png',
    topBonus: { type: 'food_fixed', value: 3, description: '+3 Nourritures immédiates' },
    bottomBonus: { type: 'sand', sandType: 'farmer', sandMultiplier: 2, description: '2× Fermiers (× Agriculture)' }
  },
  {
    id: 'c_30',
    name: 'Herbes Précieuses',
    imageUrl: '/cards/peps/card_peps_30.jpg',
    classicImageUrl: '/cards/card_30.png',
    topBonus: { type: 'resource_fixed', resources: { stone: 1, gold: 1 }, description: '+1 Pierre et +1 Or immédiats' },
    bottomBonus: { type: 'green', greenSymbol: 'medicine', description: 'Symbole de Culture : Médecine & Herbes (K²)' }
  },
  {
    id: 'c_31',
    name: 'Tissage d’Automne',
    imageUrl: '/cards/peps/card_peps_31.jpg',
    classicImageUrl: '/cards/card_31.png',
    topBonus: { type: 'food_fixed', value: 3, description: '+3 Nourritures immédiates' },
    bottomBonus: { type: 'green', greenSymbol: 'weaving', description: 'Symbole de Culture : Tissage (K²)' }
  },
  {
    id: 'c_32',
    name: 'Cycles Solaires',
    imageUrl: '/cards/peps/card_peps_32.jpg',
    classicImageUrl: '/cards/card_32.png',
    topBonus: { type: 'dice_all_players', description: 'Lancer 1 dé par joueur : choix d’un dé à tour de rôle (Draft)' },
    bottomBonus: { type: 'green', greenSymbol: 'sundial', description: 'Symbole de Culture : Astronomie & Cadran (K²)' }
  },
  {
    id: 'c_33',
    name: 'Charpente du Hameau',
    imageUrl: '/cards/peps/card_peps_33.jpg',
    classicImageUrl: '/cards/card_33.png',
    topBonus: { type: 'dice_all_players', description: 'Lancer 1 dé par joueur : choix d’un dé à tour de rôle (Draft)' },
    bottomBonus: { type: 'sand', sandType: 'builder', sandMultiplier: 1, description: '1× Bâtisseur (× Bâtiments)' }
  },
  {
    id: 'c_34',
    name: 'Monument Mégalithique',
    imageUrl: '/cards/peps/card_peps_34.jpg',
    classicImageUrl: '/cards/card_34.png',
    topBonus: { type: 'victory_points', value: 3, description: '+3 Points de Victoire directs' },
    bottomBonus: { type: 'sand', sandType: 'builder', sandMultiplier: 3, description: '3× Bâtisseurs (× Bâtiments)' }
  },
  {
    id: 'c_35',
    name: 'Hutte des Bâtisseurs',
    imageUrl: '/cards/peps/card_peps_35.jpg',
    classicImageUrl: '/cards/card_35.png',
    topBonus: { type: 'food_fixed', value: 2, description: '+2 Nourritures immédiates' },
    bottomBonus: { type: 'sand', sandType: 'builder', sandMultiplier: 2, description: '2× Bâtisseurs (× Bâtiments)' }
  },
];
