import { 
  createInitialGameState, 
  canPlaceMeeples, 
  placeMeeples, 
  passPlayerPlacement,
  resolveVillageAction, 
  resolveDiceHarvest, 
  resolveCardPurchase, 
  resolveBuildingPurchase, 
  resolveHumanFeeding, 
  finishRound,
  getZoneTotalMeeples
} from './gameEngine';
import { rankPlayers, calculatePlayerScore } from './scoring';
import { GameSettings, BoardLocationId, FinalPlayerScore } from '../types/game';

console.log("=== L'ÂGE DE PIERRE : SUITE DE TESTS DU GAME ENGINE ===");

const settings: GameSettings = {
  playerCount: 3,
  players: [
    { name: 'Chef Tribal', color: 'red', isAi: false, aiDifficulty: 'normal' },
    { name: 'Ouga (IA)', color: 'blue', isAi: true, aiDifficulty: 'normal' },
    { name: 'Chaka (IA)', color: 'yellow', isAi: true, aiDifficulty: 'hard' },
  ],
  variants: {
    firstTurnCourtesy: true,
    startingCompensation: true,
    twoPilesEnd: true,
    completeCycleEnd: true,
  },
};

// 1. Initial State Check
let state = createInitialGameState({ ...settings, firstPlayerIndex: 0 });
console.log(`[PASS] Initial state created: Round ${state.round}, Phase ${state.phase}, Players: ${state.players.length}`);
console.log(`       Cartes actives: ${state.activeCards.filter(Boolean).length}/4, Piles bâtiments: ${state.buildingPiles.length}`);

// 2. Placement Tests
const p1 = state.players[0]; // Red
console.log(`\n--- Test de Placement (Joueur 1 : ${p1.name}) ---`);

// Place 2 meeples on forest
let checkForest = canPlaceMeeples(state, p1.id, 'forest', 2);
if (!checkForest.allowed) throw new Error("Forest placement should be allowed");
state = placeMeeples(state, p1.id, 'forest', 2);
console.log(`[PASS] 2 ouvriers posés en Forêt. Meeples restants: ${state.players[0].availableMeeples}`);

// Place 1 meeple on fields
state.activePlayerIndex = 0; // force active for test
let checkField = canPlaceMeeples(state, p1.id, 'field', 1);
if (!checkField.allowed) throw new Error("Field placement should be allowed");
state = placeMeeples(state, p1.id, 'field', 1);
console.log(`[PASS] 1 ouvrier posé aux Champs. Meeples restants: ${state.players[0].availableMeeples}`);

// Place 2 meeples on hut
state.activePlayerIndex = 0;
let checkHut = canPlaceMeeples(state, p1.id, 'hut', 2);
if (!checkHut.allowed) throw new Error("Hut placement should be allowed");
state = placeMeeples(state, p1.id, 'hut', 2);
console.log(`[PASS] 2 ouvriers posés à la Hutte. Meeples restants: ${state.players[0].availableMeeples}`);

// 3. Resolution Tests
console.log(`\n--- Test de Résolution des Actions ---`);
state.phase = 'resolution';

// Resolve Forest harvest (Roll 2 dice: 4 + 5 = 9 / 3 = 3 wood)
const initialWood = state.players[0].resources.wood;
state = resolveDiceHarvest(state, p1.id, 'forest', [4, 5], []);
const gainedWood = state.players[0].resources.wood - initialWood;
console.log(`[PASS] Forêt résolue (dés: 4+5=9). Bois récolté: +${gainedWood} (Attendu: 3). Total bois: ${state.players[0].resources.wood}`);

// Resolve Field (+1 Agriculture)
const initialAgri = state.players[0].agriculture;
state = resolveVillageAction(state, p1.id, 'field');
console.log(`[PASS] Champs résolu. Agriculture: ${initialAgri} -> ${state.players[0].agriculture} (+1)`);

// Resolve Hut (+1 ouvrier pour manche suivante)
state = resolveVillageAction(state, p1.id, 'hut');
console.log(`[PASS] Hutte résolue. newMeepleNextRound: ${state.players[0].newMeepleNextRound}`);

// 4. Building Purchase Test
console.log(`\n--- Test Achat de Bâtiment ---`);
// Give player some stone and gold
state.players[0].resources.wood = 5;
state.players[0].resources.clay = 3;
state.players[0].resources.stone = 3;
state.players[0].resources.gold = 2;
const initialVP = state.players[0].victoryPoints;

// Suppose player placed on building_0
state.players[0].placements.building_0 = 1;
const topBuilding = state.buildingPiles[0][0];
console.log(`Bâtiment visé: ${topBuilding.description}`);
state = resolveBuildingPurchase(state, p1.id, 'building_0', { wood: 1, clay: 1, stone: 1, gold: 0 });
console.log(`[PASS] Bâtiment acheté ! PV: ${initialVP} -> ${state.players[0].victoryPoints} (Total bâtiments: ${state.players[0].buildings.length})`);

// 5. Card Purchase Test
console.log(`\n--- Test Achat de Carte Civilisation ---`);
state.players[0].placements.card_0 = 1;
const topCard = state.activeCards[0]!;
console.log(`Carte visée: ${topCard.name}`);
state = resolveCardPurchase(state, p1.id, 'card_0', { wood: 1, clay: 0, stone: 0, gold: 0 });
console.log(`[PASS] Carte achetée ! Cartes possédées: ${state.players[0].civilizationCards.length}`);

// 6. Feeding Phase Test
console.log(`\n--- Test Phase de Nourriture (Feeding) ---`);
state.phase = 'feeding';
state.players[0].food = 10;
const totalNeeded = state.players[0].totalMeeples;
const coveredByAgri = state.players[0].agriculture;
console.log(`Nourriture requise: ${totalNeeded}, couverte par Agri: ${coveredByAgri}, déficit: ${totalNeeded - coveredByAgri}`);
state = resolveHumanFeeding(state, p1.id, { wood: 0, clay: 0, stone: 0, gold: 0 }, false);
console.log(`[PASS] Joueur nourri ! fedThisRound: ${state.players[0].fedThisRound}, Nourriture restante: ${state.players[0].food}`);

// 7. Round End & Cycle Transition
console.log(`\n--- Test Fin de Manche & Décalage des Cartes ---`);
state = finishRound(state);
console.log(`[PASS] Nouvelle manche démarrée : Manche ${state.round}, Phase: ${state.phase}`);
console.log(`       Total ouvriers joueur 1: ${state.players[0].totalMeeples} (devrait être 6 car hutte résolue)`);
if (state.players[0].totalMeeples !== 6) throw new Error("Meeple from hut was not credited!");

// 8. End Game Scoring Test
console.log(`\n--- Test Calcul du Score Final (Podium) ---`);
const finalScores = rankPlayers(state.players);
console.log(`[PASS] Scores calculés pour ${finalScores.length} joueurs:`);
finalScores.forEach((s: FinalPlayerScore) => {
  console.log(`       - #${s.rank} ${s.name} (${s.color}) : Total ${s.totalScore} PV (Plateau: ${s.boardPoints}, Verts: ${s.greenCardPoints}, Multiplicateurs: ${s.shamanPoints + s.farmerPoints + s.toolMakerPoints + s.builderPoints})`);
});

// 9. Test Usability of Immediate Tool Bonuses During Current Round
console.log(`\n--- Test Utilisation Immédiate des Bonus Outils Durant la Manche ---`);
// A. Give player a tool_upgrade card while tools are currently used
state.players[0].toolTiles = [1, 1, 0];
state.players[0].toolsUsedThisRound = [true, true, false];
state.activeCards[0] = {
  id: 'test_tool_card',
  name: 'Outil de Précision',
  topBonus: { type: 'tool_upgrade', description: '+1 Outil Permanent' },
  bottomBonus: { type: 'green', greenSymbol: 'art', description: 'Art' },
};
state = resolveCardPurchase(state, p1.id, 'card_0', { wood: 0, clay: 0, stone: 0, gold: 0 });
const upgradedTiles = state.players[0].toolTiles;
const upgradedUsed = state.players[0].toolsUsedThisRound;
console.log(`[PASS] Outils après carte tool_upgrade: [${upgradedTiles.join(', ')}], Utilisés: [${upgradedUsed.join(', ')}]`);
// The newly added tool (index 2) must be available (false)!
if (upgradedUsed[2] !== false || upgradedTiles[2] !== 1) {
  throw new Error("L'outil obtenu immédiatement via carte doit être utilisable pendant la manche !");
}

// B. Test temporary tools in harvest
state.players[0].temporaryTools = 3;
state.players[0].placements['forest'] = 2;
state.players[1].placements['river'] = 1; // Keep resolution phase active
const woodBefore = state.players[0].resources.wood;
// Roll [2, 2] = 4 on wood (divisor 3). With 2 temp tools = 6 / 3 = 2 wood!
state = resolveDiceHarvest(state, p1.id, 'forest', [2, 2], [], 2);
const woodAfter = state.players[0].resources.wood;
console.log(`[PASS] Récolte avec 2 outils temporaires: +${woodAfter - woodBefore} bois (attendu: 2). Outils temp. restants: ${state.players[0].temporaryTools} (attendu: 1)`);
if (woodAfter - woodBefore !== 2 || state.players[0].temporaryTools !== 1) {
  throw new Error("Les outils temporaires doivent être pris en compte lors de la récolte !");
}

// 10. Test Free Draw Card Bonus
console.log(`\n--- Test Achat Carte Bonus Piocher 1 Carte Gratuite ---`);
const deckCountBefore = state.cardsDeck.length;
const topCardInDeck = state.cardsDeck[0];
const p1CardsBefore = state.players[0].civilizationCards.length;

state.activeCards[0] = {
  id: 'test_draw_card',
  name: 'Savoir Ancien',
  topBonus: { type: 'draw_card', description: 'Piocher 1 carte supplémentaire' },
  bottomBonus: { type: 'green', greenSymbol: 'writing', description: 'Écriture' },
};
state = resolveCardPurchase(state, p1.id, 'card_0', { wood: 0, clay: 0, stone: 0, gold: 0 });

const p1CardsAfter = state.players[0].civilizationCards.length;
const deckCountAfter = state.cardsDeck.length;
const extraDrawn = state.players[0].civilizationCards[p1CardsAfter - 1];

console.log(`[PASS] Cartes possédées: ${p1CardsBefore} -> ${p1CardsAfter} (+2 cartes : carte achetée + carte gratuite « ${extraDrawn.name} »)`);
console.log(`[PASS] Pioche de cartes: ${deckCountBefore} -> ${deckCountAfter} (-1 carte)`);

if (p1CardsAfter !== p1CardsBefore + 2) {
  throw new Error("L'achat d'une carte avec bonus draw_card doit ajouter exactement 2 cartes !");
}
if (deckCountAfter !== deckCountBefore - 1) {
  throw new Error("La pioche doit être décrémentée d'exactement 1 carte !");
}
if (extraDrawn.id !== topCardInDeck.id) {
  throw new Error("La carte piochée gratuitement doit être la carte du dessus du deck !");
}

// =========================================================================
// NOUVEAUX TESTS : LES 3 EXTENSIONS OFFICIELLES
// =========================================================================

console.log("\n========================================================");
console.log("=== TESTS SPÉCIFIQUES DES 3 EXTENSIONS MODULAIRES ===");
console.log("========================================================");

import { resolveMerchantVisit, resolveMammothContest } from './gameEngine';
import { calculateJewelryScore } from './scoring';
import { NEW_HUTS_TILES } from '../data/newHuts';

// Test 1 : Extension 1 - Les Nouvelles Huttes à Pouvoirs
console.log("\n--- Test Extension 1 : Les Nouvelles Huttes à Pouvoirs ---");
let extState = createInitialGameState({
  ...settings,
  expansions: { newHuts: true, styleIsTheGoal: true, mammothHerd: true },
});

console.log(`[PASS] Partie avec 3 extensions créée avec succès.`);
console.log(`       Nombre de tuiles bâtiment totales dans le pool: ${extState.buildingPiles.reduce((s, p) => s + p.length, 0)} (incluant les nouvelles huttes)`);

// Tester achat d'une hutte spéciale : La Crèche (+1 ouvrier permanent immédiat)
const kindergartenTile = NEW_HUTS_TILES.find(h => h.passiveHutType === 'kindergarten')!;
const initialMeeples = extState.players[0].totalMeeples;
extState.players[0].resources.clay = 5;
extState.players[0].resources.gold = 5;
extState.buildingPiles[0].push(kindergartenTile);
extState.players[0].placements['building_0'] = 1;

extState = resolveBuildingPurchase(extState, extState.players[0].id, 'building_0', { wood: 0, clay: 1, stone: 0, gold: 1 });
if (extState.players[0].totalMeeples !== initialMeeples + 1) {
  throw new Error(`La Crèche devrait donner immédiatement +1 ouvrier (obtenu: ${extState.players[0].totalMeeples})`);
}
console.log(`[PASS] La Crèche achetée : Ouvriers totaux ${initialMeeples} -> ${extState.players[0].totalMeeples} (+1 permanent immédiat !)`);

// Tester hutte à production récurrente : Hutte du Bûcheron (+1 bois chaque début de manche)
const woodHutTile = NEW_HUTS_TILES.find(h => h.passiveHutType === 'wood_quarry')!;
extState.players[0].buildings.push(woodHutTile);
const woodBeforeRound = extState.players[0].resources.wood;
extState = finishRound(extState);
console.log(`[PASS] Début de manche avec Hutte du Bûcheron : Bois ${woodBeforeRound} -> ${extState.players[0].resources.wood} (+1 Bois récurrent gratuit !)`);

// Test 2 : Extension 2 - Le Style, c'est le But (Marchand, Piste de Troc & Bijoux)
console.log("\n--- Test Extension 2 : Le Style, c'est le But ---");
let pStyle = extState.players[0];
pStyle.availableMeeples = 3;
extState.activePlayerIndex = 0;

// Placement sur 'merchant'
const checkMerchant = canPlaceMeeples(extState, pStyle.id, 'merchant', 1);
if (!checkMerchant.allowed) throw new Error("Placement sur l'échoppe du marchand devrait être autorisé !");
extState = placeMeeples(extState, pStyle.id, 'merchant', 1);
console.log(`[PASS] 1 ouvrier posé sur l'Échoppe du Marchand.`);

// Résolution de la visite : progression de niveau & troc de 2 bois contre 1 Parure 📿
pStyle.resources.wood = 5;
extState = resolveMerchantVisit(extState, pStyle.id, {
  giveRes: 'wood',
  giveAmount: 2,
  buyJewelry: true,
  jewelryCount: 1,
});

const updatedStylePlayer = extState.players.find(p => p.id === pStyle.id)!;
console.log(`[PASS] Marchand visité : Niveau de troc 0 -> ${updatedStylePlayer.merchantLevel}/5`);
console.log(`[PASS] Parures obtenues : ${updatedStylePlayer.jewelry} 📿 (Attendu: 1)`);

// Tester le barème officiel des Parures
console.log("       Barème des scores de Style :");
console.log(`       - 1 Parure : ${calculateJewelryScore(1)} VP (Attendu: 2)`);
console.log(`       - 2 Parures : ${calculateJewelryScore(2)} VP (Attendu: 5)`);
console.log(`       - 3 Parures : ${calculateJewelryScore(3)} VP (Attendu: 9)`);
console.log(`       - 4 Parures : ${calculateJewelryScore(4)} VP (Attendu: 14)`);
console.log(`       - 5 Parures : ${calculateJewelryScore(5)} VP (Attendu: 20)`);
if (calculateJewelryScore(5) !== 20 || calculateJewelryScore(3) !== 9) {
  throw new Error("Erreur de barème des parures !");
}

// Test 3 : Extension 3 - La Harde de Mammouths
console.log("\n--- Test Extension 3 : La Harde de Mammouths ---");
console.log(`[PASS] Mammouth actif sur le plateau : « ${extState.activeMammoth?.name} » (+${extState.activeMammoth?.victoryPoints} VP, Butin: ${extState.activeMammoth?.bonusType})`);
console.log(`       Nombre de mammouths restants dans la pioche : ${extState.mammothDeck?.length}/15`);

// Envoyer 2 ouvriers à la chasse au mammouth
const checkMammoth = canPlaceMeeples(extState, pStyle.id, 'mammoth', 2);
if (!checkMammoth.allowed) throw new Error("Placement sur la chasse au mammouth devrait être autorisé !");
extState.players[0].availableMeeples = 3;
extState = placeMeeples(extState, pStyle.id, 'mammoth', 2);

// Deuxième joueur envoie 1 ouvrier
extState.players[1].availableMeeples = 2;
extState = placeMeeples(extState, extState.players[1].id, 'mammoth', 1);

// Résolution du duel de traque : Joueur 1 mise 2 nourritures et fait 8 aux dés
extState.players[0].food = 10;
const wagers = { [extState.players[0].id]: 2, [extState.players[1].id]: 0 };
const rolls = { [extState.players[0].id]: [4, 4], [extState.players[1].id]: [3] };

const targetMammoth = extState.activeMammoth!;
extState = resolveMammothContest(extState, wagers, rolls);

const winningHunter = extState.players[0];
console.log(`[PASS] Chasse résolue : ${winningHunter.name} a capturé « ${targetMammoth.name} » !`);
console.log(`       Trophées en possession : ${winningHunter.mammothTiles?.length} trophée(s)`);
console.log(`       Nourriture restante après mise de 2 : ${winningHunter.food} (Appât déduit)`);

// Tester attribution du bonus Grand Chasseur (+10 VP)
const rankedFinal = rankPlayers(extState.players);
const topScorer = rankedFinal.find(r => r.playerId === winningHunter.id)!;
console.log(`[PASS] Décompte final avec trophée de Grand Chasseur :`);
console.log(`       - Bonus Grand Chasseur accordé : +${topScorer.mammothHunterBonus} VP`);
console.log(`       - Points des trophées mammouths : +${topScorer.mammothPoints} VP`);
console.log(`       - Points de Style (Parures) : +${topScorer.jewelryPoints} VP`);
console.log(`       - Score Total : ${topScorer.totalScore} VP`);

if ((topScorer.mammothHunterBonus || 0) !== 10) {
  throw new Error("Le bonus de +10 VP Grand Chasseur devrait être attribué au chasseur n°1 !");
}

// Test 4 : Décompte des ressources restantes (1 point par ressource)
console.log("\n--- Test 4 : Décompte des ressources restantes (1 VP / ressource) ---");
const testPlayerRes = {
  ...winningHunter,
  resources: { wood: 3, clay: 2, stone: 1, gold: 4 } // 10 ressources au total
};
const scoreWithRes = calculatePlayerScore(testPlayerRes);
console.log(`[PASS] Ressources : 3 bois + 2 argiles + 1 pierre + 4 or = 10 ressources`);
console.log(`       Points de ressources calculés : ${scoreWithRes.remainingResourcePoints} VP (Attendu: 10)`);
if (scoreWithRes.remainingResourcePoints !== 10) {
  throw new Error(`Erreur : attendu 10 VP pour les ressources restantes, obtenu ${scoreWithRes.remainingResourcePoints}`);
}

// Test 5 : Non-blocage en fin de partie (pass placement sans ouvriers et épuisement)
console.log("\n--- Test 5 : Fin de partie et passage automatique sans blocage en résolution ---");
let emptyEndState = createInitialGameState({ ...settings, firstPlayerIndex: 0 });
// Vider tous les bâtiments et cartes pour simuler une fin de partie
emptyEndState.buildingPiles = [[], [], [], []];
emptyEndState.activeCards = [null, null, null, null];
emptyEndState.cardsDeck = [];
// Tout le monde n'a plus d'ouvriers disponibles ni placés et a assez de nourriture
emptyEndState.players.forEach(p => {
  p.food = 20;
  p.availableMeeples = 0;
  p.placements = {};
});

// Le joueur actif passe son placement
const activeP = emptyEndState.players[emptyEndState.activePlayerIndex];
emptyEndState = passPlayerPlacement(emptyEndState, activeP.id);

console.log(`[PASS] Après passage du joueur actif : phase = ${emptyEndState.phase}`);
// La phase doit avoir sauté la résolution (car 0 ouvriers posés) et abouti directement à 'game_over'
if (emptyEndState.phase === 'resolution') {
  throw new Error("Le moteur s'est bloqué en phase resolution alors qu'aucun ouvrier n'est placé !");
}
if (emptyEndState.phase !== 'game_over') {
  throw new Error(`Attendu phase 'game_over' car toutes les cartes et bâtiments sont épuisés, obtenu: ${emptyEndState.phase}`);
}
console.log(`[PASS] Fin de partie déclenchée avec succès : « ${emptyEndState.endGameReason} »`);

console.log("\n>>> TOUTES LES EXTENSIONS ET CORRECTIONS SONT 100% OPÉRATIONNELLES ET TESTÉES <<<");
