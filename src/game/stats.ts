import type {
  AIDifficulty,
  DashboardSummary,
  GameMode,
  MatchRecord,
  PlayerId,
} from './types';

export type DashboardFilter = 'all' | 'ai' | 'local' | 'wins';

const STORAGE_KEY = 'gebeta_match_history';
const MAX_HISTORY_ITEMS = 100;

export function createMatchRecord(params: {
  mode: GameMode;
  difficulty: AIDifficulty;
  winner: PlayerId | 'draw';
  playerScore: number;
  opponentScore: number;
  turns: number;
  playedAt?: number;
}): MatchRecord {
  const ts = params.playedAt ?? Date.now();
  return {
    id: `m-${ts}-${Math.random().toString(36).slice(2, 7)}`,
    playedAt: ts,
    mode: params.mode,
    difficulty: params.difficulty,
    winner: params.winner,
    playerScore: params.playerScore,
    opponentScore: params.opponentScore,
    turns: params.turns,
  };
}

export function loadMatchHistory(): MatchRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is MatchRecord =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.playerScore === 'number' &&
        typeof item.opponentScore === 'number',
    );
  } catch {
    return [];
  }
}

export function saveMatchHistory(records: MatchRecord[]): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(records.slice(0, MAX_HISTORY_ITEMS)),
    );
  } catch {
    // Ignore storage errors
  }
}

export function prependMatchRecord(
  existing: MatchRecord[],
  next: MatchRecord,
): MatchRecord[] {
  return [next, ...existing].slice(0, MAX_HISTORY_ITEMS);
}

export function filterMatchHistory(
  records: MatchRecord[],
  filter: DashboardFilter,
): MatchRecord[] {
  if (filter === 'ai') return records.filter((r) => r.mode === 'ai');
  if (filter === 'local') return records.filter((r) => r.mode === 'local');
  if (filter === 'wins') return records.filter((r) => r.winner === 'player');
  return records;
}

export function computeDashboardSummary(
  records: MatchRecord[],
): DashboardSummary {
  if (records.length === 0) {
    return {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRatePct: 0,
      bestScore: 0,
      avgScore: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalStonesCaptured: 0,
    };
  }

  let wins = 0;
  let losses = 0;
  let draws = 0;
  let bestScore = 0;
  let totalStonesCaptured = 0;

  for (const r of records) {
    if (r.winner === 'player') wins += 1;
    else if (r.winner === 'opponent') losses += 1;
    else draws += 1;

    if (r.playerScore > bestScore) bestScore = r.playerScore;
    totalStonesCaptured += r.playerScore;
  }

  // Records are ordered newest-first; calculate current streak from index 0
  let currentStreak = 0;
  for (const r of records) {
    if (r.winner === 'player') currentStreak += 1;
    else break;
  }

  // Calculate best win streak chronologically (oldest to newest)
  let bestStreak = 0;
  let running = 0;
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i].winner === 'player') {
      running += 1;
      if (running > bestStreak) bestStreak = running;
    } else {
      running = 0;
    }
  }

  const totalMatches = records.length;
  const winRatePct = Math.round((wins / totalMatches) * 100);
  const avgScore = Math.round(totalStonesCaptured / totalMatches);

  return {
    totalMatches,
    wins,
    losses,
    draws,
    winRatePct,
    bestScore,
    avgScore,
    currentStreak,
    bestStreak,
    totalStonesCaptured,
  };
}
