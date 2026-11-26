export type PlayerId = 'player' | 'opponent';

export type GameMode = 'ai' | 'local';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type Language = 'en' | 'ti' | 'am';

export type BoardTheme = 'wanza' | 'basalt' | 'acacia';

export type AccentPalette = 'gold' | 'terracotta' | 'emerald' | 'cobalt';

export type FontChoice = 'editorial' | 'modern' | 'geometric';

export type AnimationSpeed = 'brisk' | 'classic' | 'measured';

export type CameraPreset = 'angled' | 'topdown';

export type PageRoute = 'home' | 'play' | 'dashboard' | 'settings' | 'about';

export type ScreenState = 'title' | 'playing' | 'paused' | 'gameover';

export type AppSettings = {
  language: Language;
  theme: BoardTheme;
  accent: AccentPalette;
  font: FontChoice;
  speed: AnimationSpeed;
  cameraPreset: CameraPreset;
  muted: boolean;
};

export type MatchRecord = {
  id: string;
  playedAt: number;
  mode: GameMode;
  difficulty: AIDifficulty;
  winner: PlayerId | 'draw';
  playerScore: number;
  opponentScore: number;
  turns: number;
};

export type DashboardSummary = {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRatePct: number;
  bestScore: number;
  avgScore: number;
  currentStreak: number;
  bestStreak: number;
  totalStonesCaptured: number;
};

export type Hole = {
  id: number;
  stones: number;
  owner: PlayerId;
};

export type SowingStepType =
  | 'pickup'
  | 'drop'
  | 'capture'
  | 'relay'
  | 'end_empty'
  | 'sweep_remaining';

export type SowingStep = {
  type: SowingStepType;
  holeId: number;
  stonesInHand: number;
  holeCounts: number[];
  playerStore: number;
  opponentStore: number;
  capturedBy?: PlayerId;
  isLastStoneCapture?: boolean;
};

export type LastMoveSummary = {
  actor: PlayerId;
  startHoleId: number;
  capturedByPlayer: number;
  capturedByOpponent: number;
  relayCount: number;
  endedByCapture: boolean;
  gameOver: boolean;
};

export type GameState = {
  holes: Hole[];
  playerStore: number;
  opponentStore: number;
  currentPlayer: PlayerId;
  selectedHole: number | null;
  isAnimating: boolean;
  gameOver: boolean;
  winner: PlayerId | 'draw' | null;
  turnCount: number;
  lastMove: LastMoveSummary | null;
};

export type MoveSimulationResult = {
  nextState: GameState;
  steps: SowingStep[];
  summary: LastMoveSummary;
};
