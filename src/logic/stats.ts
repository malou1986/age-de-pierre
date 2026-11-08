// Statistics & Historical Records for L'Âge de Pierre

export interface GameRecord {
  id: string;
  date: string;
  winnerName: string;
  winnerColor: string;
  winningScore: number;
  playerCount: number;
  roundsCount: number;
  isAiWinner: boolean;
}

export interface TribeGlobalStats {
  gamesPlayed: number;
  totalRounds: number;
  highestScore: {
    score: number;
    playerName: string;
    playerColor: string;
    date: string;
  } | null;
  victoriesByColor: {
    red: number;
    blue: number;
    yellow: number;
    green: number;
  };
  humanVictories: number;
  aiVictories: number;
  recentGames: GameRecord[];
}

const STATS_STORAGE_KEY = 'age_de_pierre_tribe_stats';

const DEFAULT_STATS: TribeGlobalStats = {
  gamesPlayed: 0,
  totalRounds: 0,
  highestScore: null,
  victoriesByColor: {
    red: 0,
    blue: 0,
    yellow: 0,
    green: 0,
  },
  humanVictories: 0,
  aiVictories: 0,
  recentGames: [],
};

export function getTribeStats(): TribeGlobalStats {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATS, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load tribe stats:', e);
  }
  return { ...DEFAULT_STATS };
}

export function saveTribeStats(stats: TribeGlobalStats): void {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('Failed to save tribe stats:', e);
  }
}

export function recordGameFinished(params: {
  winnerName: string;
  winnerColor: 'red' | 'blue' | 'yellow' | 'green';
  winningScore: number;
  isAi: boolean;
  playerCount: number;
  roundsCount: number;
}): { isNewHighScore: boolean; stats: TribeGlobalStats } {
  const stats = getTribeStats();

  stats.gamesPlayed += 1;
  stats.totalRounds += params.roundsCount;

  if (params.winnerColor in stats.victoriesByColor) {
    stats.victoriesByColor[params.winnerColor] += 1;
  }

  if (params.isAi) {
    stats.aiVictories += 1;
  } else {
    stats.humanVictories += 1;
  }

  let isNewHighScore = false;
  const nowStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (!stats.highestScore || params.winningScore > stats.highestScore.score) {
    stats.highestScore = {
      score: params.winningScore,
      playerName: params.winnerName,
      playerColor: params.winnerColor,
      date: nowStr,
    };
    isNewHighScore = true;
  }

  const record: GameRecord = {
    id: `rec_${Date.now()}`,
    date: nowStr,
    winnerName: params.winnerName,
    winnerColor: params.winnerColor,
    winningScore: params.winningScore,
    playerCount: params.playerCount,
    roundsCount: params.roundsCount,
    isAiWinner: params.isAi,
  };

  stats.recentGames = [record, ...(stats.recentGames || [])].slice(0, 15);

  saveTribeStats(stats);
  return { isNewHighScore, stats };
}

export function resetTribeStats(): TribeGlobalStats {
  try {
    localStorage.removeItem(STATS_STORAGE_KEY);
  } catch {}
  return { ...DEFAULT_STATS };
}
