// 16 Tuiles officielles de l'Extension "La Harde de Mammouths" (Stone Age: Mammoth Herd)
import { MammothTile } from '../types/game';

export const ALL_MAMMOTH_TILES: MammothTile[] = [
  // 1-4 : Grand Mammouth (VP élevés & Abondance de vivres)
  {
    id: 'mammoth_01',
    name: 'Grand Mammouth des Neiges',
    victoryPoints: 4,
    bonusType: 'food',
    bonusAmount: 4,
    description: 'Une prise gigantesque qui nourrit le clan (+4 nourriture & 4 VP).',
  },
  {
    id: 'mammoth_02',
    name: 'Patriarche du Troupeau',
    victoryPoints: 5,
    bonusType: 'pure_vp',
    bonusAmount: 0,
    description: 'Le doyen vénéré de la harde, symbole suprême de courage (5 VP).',
  },
  {
    id: 'mammoth_03',
    name: 'Mammouth des Plaines Glacées',
    victoryPoints: 4,
    bonusType: 'food',
    bonusAmount: 3,
    description: 'Une bête imposante rapportant 4 VP et 3 nourritures au festin.',
  },
  {
    id: 'mammoth_04',
    name: 'Colosse des Steppes',
    victoryPoints: 3,
    bonusType: 'food',
    bonusAmount: 4,
    description: 'Fournit de la viande séchée pour tout l’hiver (+4 nourriture & 3 VP).',
  },

  // 5-8 : Outils en os & Ivoire taillé (+1 Outil permanent)
  {
    id: 'mammoth_05',
    name: 'Mammouth aux Défenses Courbées',
    victoryPoints: 3,
    bonusType: 'tool',
    bonusAmount: 1,
    description: 'Ses défenses permettent de forger des outils incomparables (+1 Outil & 3 VP).',
  },
  {
    id: 'mammoth_06',
    name: 'Bête Solitaire des Pics',
    victoryPoints: 3,
    bonusType: 'tool',
    bonusAmount: 1,
    description: 'L’ivoire sacré offre un nouveau niveau d’outillage permanent (+1 Outil & 3 VP).',
  },
  {
    id: 'mammoth_07',
    name: 'Mammouth Laineux Royal',
    victoryPoints: 4,
    bonusType: 'tool',
    bonusAmount: 1,
    description: 'Un trophée d’exception apportant +1 Outil et 4 VP.',
  },
  {
    id: 'mammoth_08',
    name: 'Vieux Mâle Dominant',
    victoryPoints: 2,
    bonusType: 'tool',
    bonusAmount: 1,
    description: 'Ses cornes dures renforcent la forge (+1 Outil & 2 VP).',
  },

  // 9-12 : Fertilité et Sagesse de la Harde (+1 Agriculture)
  {
    id: 'mammoth_09',
    name: 'Matriarche Protectrice',
    victoryPoints: 3,
    bonusType: 'agriculture',
    bonusAmount: 1,
    description: 'Son sillage enrichit la terre et enseigne le labour (+1 Agriculture & 3 VP).',
  },
  {
    id: 'mammoth_10',
    name: 'Sentinelle de la Toundra',
    victoryPoints: 3,
    bonusType: 'agriculture',
    bonusAmount: 1,
    description: 'Apporte l’expérience des saisons migratoires (+1 Agriculture & 3 VP).',
  },
  {
    id: 'mammoth_11',
    name: 'Gardien des Vallées Fertiles',
    victoryPoints: 4,
    bonusType: 'agriculture',
    bonusAmount: 1,
    description: 'Ses passages tracent les futurs sillons agricoles (+1 Agriculture & 4 VP).',
  },
  {
    id: 'mammoth_12',
    name: 'Mammouth d’Automne',
    victoryPoints: 2,
    bonusType: 'agriculture',
    bonusAmount: 1,
    description: 'Rapproche la tribu des cycles de récolte (+1 Agriculture & 2 VP).',
  },

  // 13-16 : Butin Royal & Richesses des Glaces (Or & Minéraux)
  {
    id: 'mammoth_13',
    name: 'Mammouth aux Reflets d’Or',
    victoryPoints: 4,
    bonusType: 'resource',
    bonusAmount: 1,
    bonusResource: 'gold',
    description: 'Trouvé près du filon aurifère (+1 Pépite d’Or & 4 VP).',
  },
  {
    id: 'mammoth_14',
    name: 'Colosse des Carrières',
    victoryPoints: 3,
    bonusType: 'resource',
    bonusAmount: 2,
    bonusResource: 'stone',
    description: 'Ses sabots ont déterré 2 solides pierres de taille (+2 Pierres & 3 VP).',
  },
  {
    id: 'mammoth_15',
    name: 'Bête des Forêts de Conifères',
    victoryPoints: 3,
    bonusType: 'resource',
    bonusAmount: 2,
    bonusResource: 'wood',
    description: 'Rapporte des troncs massifs au campement (+2 Bois & 3 VP).',
  },
  {
    id: 'mammoth_16',
    name: 'Mammouth des Rives d’Argile',
    victoryPoints: 3,
    bonusType: 'resource',
    bonusAmount: 2,
    bonusResource: 'clay',
    description: 'Sa charge a ouvert une veine d’argile pure (+2 Glaises & 3 VP).',
  },
];
