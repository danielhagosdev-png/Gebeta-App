import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeDashboardSummary,
  createMatchRecord,
  filterMatchHistory,
  prependMatchRecord,
} from './stats';

test('computeDashboardSummary returns zeroed metrics on empty history', () => {
  const summary = computeDashboardSummary([]);
  assert.deepEqual(summary, {
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
  });
});

test('computeDashboardSummary calculates wins, streaks, best, and average accurately', () => {
  const m1 = createMatchRecord({
    mode: 'ai',
    difficulty: 'easy',
    winner: 'player',
    playerScore: 28,
    opponentScore: 20,
    turns: 14,
    playedAt: 1000,
  });
  const m2 = createMatchRecord({
    mode: 'ai',
    difficulty: 'medium',
    winner: 'player',
    playerScore: 32,
    opponentScore: 16,
    turns: 18,
    playedAt: 2000,
  });
  const m3 = createMatchRecord({
    mode: 'local',
    difficulty: 'medium',
    winner: 'opponent',
    playerScore: 18,
    opponentScore: 30,
    turns: 16,
    playedAt: 3000,
  });
  const m4 = createMatchRecord({
    mode: 'ai',
    difficulty: 'hard',
    winner: 'player',
    playerScore: 26,
    opponentScore: 22,
    turns: 20,
    playedAt: 4000,
  });

  let history = prependMatchRecord([], m1);
  history = prependMatchRecord(history, m2);
  history = prependMatchRecord(history, m3);
  history = prependMatchRecord(history, m4);

  const summary = computeDashboardSummary(history);
  assert.equal(summary.totalMatches, 4);
  assert.equal(summary.wins, 3);
  assert.equal(summary.losses, 1);
  assert.equal(summary.draws, 0);
  assert.equal(summary.winRatePct, 75);
  assert.equal(summary.bestScore, 32);
  assert.equal(summary.avgScore, 26); // (28+32+18+26)/4 = 26
  assert.equal(summary.currentStreak, 1);
  assert.equal(summary.bestStreak, 2);
  assert.equal(summary.totalStonesCaptured, 104);

  assert.equal(filterMatchHistory(history, 'ai').length, 3);
  assert.equal(filterMatchHistory(history, 'local').length, 1);
  assert.equal(filterMatchHistory(history, 'wins').length, 3);
});
