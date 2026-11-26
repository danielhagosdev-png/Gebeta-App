import type {
  AIDifficulty,
  GameState,
  Hole,
  LastMoveSummary,
  MoveSimulationResult,
  PlayerId,
  SowingStep,
} from './types';

export const TOTAL_HOLES = 12;
export const HOLES_PER_SIDE = 6;
export const INITIAL_STONES_PER_HOLE = 4;
export const CAPTURE_FAMILY_SIZE = 4;
const MAX_SOWING_STEPS = 400;

export function createInitialHoles(): Hole[] {
  return Array.from({ length: TOTAL_HOLES }, (_, id) => ({
    id,
    stones: INITIAL_STONES_PER_HOLE,
    owner: id < HOLES_PER_SIDE ? 'player' : 'opponent',
  }));
}

export function createInitialGameState(): GameState {
  return {
    holes: createInitialHoles(),
    playerStore: 0,
    opponentStore: 0,
    currentPlayer: 'player',
    selectedHole: null,
    isAnimating: false,
    gameOver: false,
    winner: null,
    turnCount: 0,
    lastMove: null,
  };
}

export function cloneGameState(state: GameState): GameState {
  return {
    ...state,
    holes: state.holes.map((h) => ({ ...h })),
    lastMove: state.lastMove ? { ...state.lastMove } : null,
  };
}

export function getLegalMoves(holes: Hole[], player: PlayerId): number[] {
  const moves: number[] = [];
  for (let i = 0; i < holes.length; i++) {
    if (holes[i].owner === player && holes[i].stones > 0) {
      moves.push(i);
    }
  }
  return moves;
}

export function getOtherPlayer(player: PlayerId): PlayerId {
  return player === 'player' ? 'opponent' : 'player';
}

function snapshotCounts(holes: Hole[]): number[] {
  return holes.map((h) => h.stones);
}

/**
 * Simulates a complete Gebeta move starting from `holeIndex` following the
 * authentic Clean Version rules:
 * - Anti-clockwise sowing (0 -> 1 -> ... -> 11 -> 0)
 * - Relay sowing when the last stone lands on a non-empty pit (and doesn't form 4)
 * - Capture of exactly 4 stones ("family"):
 *   - Normally goes to the owner of the pit
 *   - Exception: if the 4th stone is the last stone of the current hand,
 *     the sower captures them (even on opponent's pit), and sowing stops
 * - Game ends when the next player has no legal moves (remaining stones swept to pit owners)
 */
export function simulateMove(
  state: GameState,
  holeIndex: number,
): MoveSimulationResult {
  if (state.gameOver) {
    throw new Error('Cannot make a move after game over.');
  }
  if (holeIndex < 0 || holeIndex >= TOTAL_HOLES) {
    throw new Error(`Invalid hole index: ${holeIndex}`);
  }

  const startHole = state.holes[holeIndex];
  if (startHole.owner !== state.currentPlayer) {
    throw new Error(`Hole ${holeIndex} does not belong to ${state.currentPlayer}.`);
  }
  if (startHole.stones <= 0) {
    throw new Error(`Hole ${holeIndex} is empty.`);
  }

  const holes = state.holes.map((h) => ({ ...h }));
  let playerStore = state.playerStore;
  let opponentStore = state.opponentStore;
  const actor = state.currentPlayer;
  const steps: SowingStep[] = [];

  let capturedByPlayer = 0;
  let capturedByOpponent = 0;
  let relayCount = 0;
  let endedByCapture = false;

  let cursor = holeIndex;
  let hand = holes[cursor].stones;
  holes[cursor].stones = 0;

  steps.push({
    type: 'pickup',
    holeId: cursor,
    stonesInHand: hand,
    holeCounts: snapshotCounts(holes),
    playerStore,
    opponentStore,
  });

  let guard = 0;
  while (hand > 0 && guard < MAX_SOWING_STEPS) {
    guard += 1;
    cursor = (cursor + 1) % TOTAL_HOLES;
    holes[cursor].stones += 1;
    hand -= 1;
    const isLastStone = hand === 0;

    steps.push({
      type: 'drop',
      holeId: cursor,
      stonesInHand: hand,
      holeCounts: snapshotCounts(holes),
      playerStore,
      opponentStore,
    });

    if (holes[cursor].stones === CAPTURE_FAMILY_SIZE) {
      const capturedBy: PlayerId = isLastStone ? actor : holes[cursor].owner;
      holes[cursor].stones = 0;
      if (capturedBy === 'player') {
        playerStore += CAPTURE_FAMILY_SIZE;
        capturedByPlayer += CAPTURE_FAMILY_SIZE;
      } else {
        opponentStore += CAPTURE_FAMILY_SIZE;
        capturedByOpponent += CAPTURE_FAMILY_SIZE;
      }

      steps.push({
        type: 'capture',
        holeId: cursor,
        stonesInHand: hand,
        holeCounts: snapshotCounts(holes),
        playerStore,
        opponentStore,
        capturedBy,
        isLastStoneCapture: isLastStone,
      });

      if (isLastStone) {
        endedByCapture = true;
        break;
      }
    } else if (isLastStone) {
      if (holes[cursor].stones === 1) {
        // Landed in an empty hole: turn ends
        steps.push({
          type: 'end_empty',
          holeId: cursor,
          stonesInHand: 0,
          holeCounts: snapshotCounts(holes),
          playerStore,
          opponentStore,
        });
        break;
      } else {
        // Landed in an occupied hole (not 4): pick up and relay sow
        hand = holes[cursor].stones;
        holes[cursor].stones = 0;
        relayCount += 1;
        steps.push({
          type: 'relay',
          holeId: cursor,
          stonesInHand: hand,
          holeCounts: snapshotCounts(holes),
          playerStore,
          opponentStore,
        });
      }
    }
  }

  const nextPlayer = getOtherPlayer(actor);
  const nextMoves = getLegalMoves(holes, nextPlayer);
  const remainingOnBoard = holes.reduce((acc, h) => acc + h.stones, 0);

  let gameOver = false;
  let winner: PlayerId | 'draw' | null = null;

  if (remainingOnBoard === 0 || nextMoves.length === 0) {
    gameOver = true;
    if (remainingOnBoard > 0) {
      for (const h of holes) {
        if (h.stones > 0) {
          if (h.owner === 'player') {
            playerStore += h.stones;
          } else {
            opponentStore += h.stones;
          }
          h.stones = 0;
        }
      }
      steps.push({
        type: 'sweep_remaining',
        holeId: cursor,
        stonesInHand: 0,
        holeCounts: snapshotCounts(holes),
        playerStore,
        opponentStore,
      });
    }

    if (playerStore > opponentStore) {
      winner = 'player';
    } else if (opponentStore > playerStore) {
      winner = 'opponent';
    } else {
      winner = 'draw';
    }
  }

  const summary: LastMoveSummary = {
    actor,
    startHoleId: holeIndex,
    capturedByPlayer,
    capturedByOpponent,
    relayCount,
    endedByCapture,
    gameOver,
  };

  const nextState: GameState = {
    holes,
    playerStore,
    opponentStore,
    currentPlayer: gameOver ? actor : nextPlayer,
    selectedHole: null,
    isAnimating: false,
    gameOver,
    winner,
    turnCount: state.turnCount + 1,
    lastMove: summary,
  };

  return { nextState, steps, summary };
}

function evaluateState(state: GameState, perspective: PlayerId): number {
  if (state.gameOver) {
    if (state.winner === perspective) return 10000 + (perspective === 'opponent' ? state.opponentStore - state.playerStore : state.playerStore - state.opponentStore);
    if (state.winner === 'draw') return 0;
    return -10000;
  }

  const myStore = perspective === 'opponent' ? state.opponentStore : state.playerStore;
  const oppStore = perspective === 'opponent' ? state.playerStore : state.opponentStore;

  let positional = 0;
  let myMobility = 0;
  let oppMobility = 0;

  for (const hole of state.holes) {
    const isMine = hole.owner === perspective;
    if (hole.stones > 0) {
      if (isMine) myMobility += 1;
      else oppMobility += 1;
    }
    // Having 3 stones on your own side creates immediate family capture pressure
    if (hole.stones === 3) {
      positional += isMine ? 1.8 : -1.5;
    }
    if (hole.stones === 2) {
      positional += isMine ? 0.5 : -0.4;
    }
  }

  return (myStore - oppStore) * 6 + positional + (myMobility - oppMobility) * 0.8;
}

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: PlayerId,
): number {
  if (depth === 0 || state.gameOver) {
    return evaluateState(state, maximizingPlayer);
  }

  const legal = getLegalMoves(state.holes, state.currentPlayer);
  if (legal.length === 0) {
    return evaluateState(state, maximizingPlayer);
  }

  const isMax = state.currentPlayer === maximizingPlayer;

  if (isMax) {
    let best = -Infinity;
    for (const move of legal) {
      const { nextState } = simulateMove(state, move);
      const val = minimax(nextState, depth - 1, alpha, beta, maximizingPlayer);
      if (val > best) best = val;
      if (best > alpha) alpha = best;
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of legal) {
      const { nextState } = simulateMove(state, move);
      const val = minimax(nextState, depth - 1, alpha, beta, maximizingPlayer);
      if (val < best) best = val;
      if (best < beta) beta = best;
      if (beta <= alpha) break;
    }
    return best;
  }
}

export function chooseAIMove(
  state: GameState,
  difficulty: AIDifficulty,
  rng: () => number = Math.random,
): number | null {
  const legal = getLegalMoves(state.holes, state.currentPlayer);
  if (legal.length === 0) return null;

  if (difficulty === 'easy') {
    const idx = Math.floor(rng() * legal.length);
    return legal[idx];
  }

  const aiPlayer = state.currentPlayer;
  const searchDepth = difficulty === 'medium' ? 1 : 3;

  let bestScore = -Infinity;
  let bestMoves: number[] = [];

  for (const move of legal) {
    const { nextState } = simulateMove(state, move);
    const score =
      difficulty === 'medium'
        ? evaluateState(nextState, aiPlayer)
        : minimax(nextState, searchDepth - 1, -Infinity, Infinity, aiPlayer);

    if (score > bestScore + 1e-6) {
      bestScore = score;
      bestMoves = [move];
    } else if (Math.abs(score - bestScore) <= 1e-6) {
      bestMoves.push(move);
    }
  }

  const pick = Math.floor(rng() * bestMoves.length);
  return bestMoves[pick];
}

export function getBestHintMove(state: GameState): number | null {
  if (state.gameOver) return null;
  const legal = getLegalMoves(state.holes, state.currentPlayer);
  if (legal.length === 0) return null;

  let bestScore = -Infinity;
  let bestMove = legal[0];
  for (const move of legal) {
    const { nextState } = simulateMove(state, move);
    const score = minimax(nextState, 2, -Infinity, Infinity, state.currentPlayer);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}
