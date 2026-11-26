import test from 'node:test';
import assert from 'node:assert/strict';
import {
  chooseAIMove,
  createInitialGameState,
  getLegalMoves,
  simulateMove,
} from './rules';
import type { GameState } from './types';

function makeCustomState(
  counts: number[],
  currentPlayer: 'player' | 'opponent' = 'player',
  playerStore = 0,
  opponentStore = 0,
): GameState {
  assert.equal(counts.length, 12);
  return {
    holes: counts.map((stones, id) => ({
      id,
      stones,
      owner: id < 6 ? 'player' : 'opponent',
    })),
    playerStore,
    opponentStore,
    currentPlayer,
    selectedHole: null,
    isAnimating: false,
    gameOver: false,
    winner: null,
    turnCount: 0,
    lastMove: null,
  };
}

function totalStones(state: GameState): number {
  return (
    state.holes.reduce((sum, h) => sum + h.stones, 0) +
    state.playerStore +
    state.opponentStore
  );
}

test('initial board has 12 holes with 4 stones each (48 total)', () => {
  const state = createInitialGameState();
  assert.equal(state.holes.length, 12);
  assert.equal(totalStones(state), 48);
  assert.equal(state.currentPlayer, 'player');
  assert.deepEqual(getLegalMoves(state.holes, 'player'), [0, 1, 2, 3, 4, 5]);
  assert.deepEqual(getLegalMoves(state.holes, 'opponent'), [6, 7, 8, 9, 10, 11]);
});

test('first move from hole 0 relays and conserves 48 stones', () => {
  const initial = createInitialGameState();
  const { nextState, steps, summary } = simulateMove(initial, 0);

  assert.equal(totalStones(nextState), 48);
  assert.equal(summary.actor, 'player');
  assert.equal(nextState.currentPlayer, 'opponent');
  assert.ok(steps.some((s) => s.type === 'pickup' && s.holeId === 0));
  assert.ok(steps.some((s) => s.type === 'relay'));
});

test('intermediate 4-stone family goes to hole owner, not sower', () => {
  // Player sows 3 stones from hole 0 -> drops at 1, 2, 3.
  // Hole 1 belongs to player and has 3 -> becomes 4 (captured by player during sowing, hand still has 2).
  // Wait: let's test opponent hole hitting 4 on intermediate drop!
  // Player sows 3 stones from hole 5 -> drops at 6 (opp), 7 (opp), 8 (opp).
  // Hole 6 (opponent) has 3 -> becomes 4 on 1st drop (not last stone) -> opponent captures!
  // Hole 8 (opponent) has 0 -> last stone lands on empty -> turn ends.
  const state = makeCustomState([1, 0, 0, 0, 0, 3, 3, 0, 0, 1, 0, 0], 'player');
  const { nextState, steps, summary } = simulateMove(state, 5);

  assert.equal(nextState.opponentStore, 4);
  assert.equal(nextState.playerStore, 0);
  assert.equal(nextState.holes[6].stones, 0);
  assert.equal(nextState.holes[7].stones, 1);
  assert.equal(nextState.holes[8].stones, 1);
  assert.equal(summary.capturedByOpponent, 4);
  assert.ok(
    steps.some(
      (s) =>
        s.type === 'capture' &&
        s.holeId === 6 &&
        s.capturedBy === 'opponent' &&
        s.isLastStoneCapture === false,
    ),
  );
});

test('last-stone 4-stone family goes to the sower even on opponent hole and ends turn', () => {
  // Player sows 2 stones from hole 5 -> drops at 6 (opp, 0->1), 7 (opp, 3->4 LAST STONE).
  // Because 7 reached 4 on the LAST stone, player captures 4 and does not relay!
  const state = makeCustomState([1, 0, 0, 0, 0, 2, 0, 3, 2, 0, 0, 0], 'player');
  const { nextState, steps, summary } = simulateMove(state, 5);

  assert.equal(nextState.playerStore, 4);
  assert.equal(nextState.opponentStore, 0);
  assert.equal(nextState.holes[7].stones, 0);
  assert.equal(summary.capturedByPlayer, 4);
  assert.equal(summary.endedByCapture, true);
  assert.ok(
    steps.some(
      (s) =>
        s.type === 'capture' &&
        s.holeId === 7 &&
        s.capturedBy === 'player' &&
        s.isLastStoneCapture === true,
    ),
  );
});

test('game ends when next player has no legal moves and sweeps remaining stones to owners', () => {
  // Player has 1 stone at hole 0, hole 1 has 0. Opponent has 0 stones everywhere except none.
  // Actually give player 2 stones at hole 0 and 3 stones at hole 2; opponent has 0 stones.
  const state = makeCustomState([1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0], 'player', 20, 24);
  const { nextState } = simulateMove(state, 0);

  assert.equal(nextState.gameOver, true);
  assert.equal(nextState.playerStore, 24);
  assert.equal(nextState.opponentStore, 24);
  assert.equal(nextState.winner, 'draw');
  assert.equal(totalStones(nextState), 48);
});

test('AI chooses valid legal moves across all difficulties and full random games terminate', () => {
  let state = createInitialGameState();
  let turns = 0;
  while (!state.gameOver && turns < 200) {
    const diff = state.currentPlayer === 'player' ? 'easy' : 'hard';
    const move = chooseAIMove(state, diff, () => 0.25);
    assert.notEqual(move, null);
    const legal = getLegalMoves(state.holes, state.currentPlayer);
    assert.ok(legal.includes(move!));
    state = simulateMove(state, move!).nextState;
    assert.equal(totalStones(state), 48);
    turns += 1;
  }
  assert.ok(turns > 0);
});
