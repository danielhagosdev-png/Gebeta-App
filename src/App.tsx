import React, { useCallback, useEffect, useRef, useState } from 'react';
import { haptic, requestInterstitial, requestReview } from './game/native';
import {
  BookOpen,
  Camera,
  ChevronDown,
  ChevronUp,
  Home,
  Lightbulb,
  Pause,
  RotateCcw,
  Settings,
  Share2,
  Undo2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  chooseAIMove,
  cloneGameState,
  createInitialGameState,
  getBestHintMove,
  getLegalMoves,
  simulateMove,
} from './game/rules';
import {
  getDifficultyLabel,
  getTurnStatusText,
  TRANSLATIONS,
} from './game/i18n';
import { soundEngine } from './game/sound';
import {
  createMatchRecord,
  loadMatchHistory,
  prependMatchRecord,
  saveMatchHistory,
} from './game/stats';
import type {
  AIDifficulty,
  AppSettings,
  GameMode,
  GameState,
  MatchRecord,
  PageRoute,
  ScreenState,
} from './game/types';
import { GebetaTitleScreen } from './components/GebetaTitleScreen';
import { GebetaScene3D } from './components/GebetaScene3D';
import { AboutPage } from './components/AboutPage';
import { SettingsPage } from './components/SettingsPage';
import { DashboardPage } from './components/DashboardPage';
import { ShareModal } from './components/ShareModal';
import { GameOverModal, PauseModal } from './components/GameModals';
import type { ActiveAnimationCue } from './components/GebetaBoard';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  theme: 'wanza',
  accent: 'gold',
  font: 'editorial',
  speed: 'classic',
  cameraPreset: 'angled',
  muted: false,
};

function loadInitialSettings(): AppSettings {
  try {
    const raw = localStorage.getItem('gebeta_settings');
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        muted: soundEngine.isMuted(),
      };
    }
  } catch {
    // Ignore storage errors
  }
  return { ...DEFAULT_SETTINGS, muted: soundEngine.isMuted() };
}

function getInitialAutostart(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('autostart') === '1';
}

function getSavedNumber(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const autostart = getInitialAutostart();
  const [page, setPage] = useState<PageRoute>(() => (autostart ? 'play' : 'home'));
  const [returnPage, setReturnPage] = useState<PageRoute>('home');
  const [paused, setPaused] = useState<boolean>(false);

  const [settings, setSettings] = useState<AppSettings>(() => loadInitialSettings());
  const [mode, setMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
  const [bestScore, setBestScore] = useState<number>(() =>
    getSavedNumber('gebeta_best_score', 0),
  );

  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState(),
  );
  const [undoStack, setUndoStack] = useState<GameState[]>([]);
  const [activeCue, setActiveCue] = useState<ActiveAnimationCue | null>(null);
  const [hintHoleId, setHintHoleId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>(() =>
    loadMatchHistory(),
  );
  const [shareState, setShareState] = useState<{
    open: boolean;
    message?: string;
  }>({ open: false });

  const timersRef = useRef<number[]>([]);
  const recordedMatchRef = useRef<boolean>(false);
  const t = TRANSLATIONS[settings.language];

  const screen: ScreenState =
    page !== 'play'
      ? 'title'
      : gameState.gameOver
        ? 'gameover'
        : paused
          ? 'paused'
          : 'playing';

  const clearPendingTimers = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  }, []);

  // Sync body state & root customization tokens
  useEffect(() => {
    document.body.dataset.state = screen;
    document.body.dataset.page = page;
  }, [screen, page]);

  useEffect(() => {
    document.documentElement.dataset.accent = settings.accent;
    document.documentElement.dataset.font = settings.font;
    try {
      localStorage.setItem('gebeta_settings', JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  useEffect(() => {
    return () => clearPendingTimers();
  }, [clearPendingTimers]);

  const scheduleTimer = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      if (patch.muted !== undefined) {
        soundEngine.setMuted(patch.muted);
      }
      return next;
    });
  }, []);

  const handleToggleMute = useCallback(() => {
    updateSettings({ muted: !settings.muted });
  }, [settings.muted, updateSettings]);

  const resetBoardState = useCallback(() => {
    clearPendingTimers();
    recordedMatchRef.current = false;
    setGameState(createInitialGameState());
    setUndoStack([]);
    setActiveCue(null);
    setHintHoleId(null);
    setStatusMessage('');
    setPaused(false);
  }, [clearPendingTimers]);

  // Persist completed match once when gameOver transitions to true
  useEffect(() => {
    if (!gameState.gameOver || !gameState.winner || recordedMatchRef.current) {
      return;
    }
    recordedMatchRef.current = true;
    const record = createMatchRecord({
      mode,
      difficulty,
      winner: gameState.winner,
      playerScore: gameState.playerStore,
      opponentScore: gameState.opponentStore,
      turns: gameState.turnCount,
    });
    setMatchHistory((prev) => {
      const next = prependMatchRecord(prev, record);
      saveMatchHistory(next);
      return next;
    });
  }, [
    difficulty,
    gameState.gameOver,
    gameState.opponentStore,
    gameState.playerStore,
    gameState.turnCount,
    gameState.winner,
    mode,
  ]);

  // Ask for a Play Store rating once, after the 3rd finished match.
  useEffect(() => {
    if (matchHistory.length < 3) return;
    try {
      if (localStorage.getItem('gebeta_review_asked')) return;
      localStorage.setItem('gebeta_review_asked', '1');
    } catch {
      return;
    }
    requestReview();
  }, [matchHistory.length]);

  // Each new match starts after an interstitial ad (the native app shows it).
  const handleStartGame = useCallback(() => {
    void requestInterstitial().then(() => {
      resetBoardState();
      setPage('play');
    });
  }, [resetBoardState]);

  const handleRestartMatch = useCallback(() => {
    void requestInterstitial().then(() => {
      resetBoardState();
      setPage('play');
    });
  }, [resetBoardState]);

  const openSubPage = useCallback(
    (target: 'about' | 'settings' | 'dashboard') => {
      setReturnPage(page === 'play' ? 'play' : 'home');
      setPaused(false);
      setPage(target);
    },
    [page],
  );

  const handleClearHistory = useCallback(() => {
    setMatchHistory([]);
    saveMatchHistory([]);
  }, []);

  const openShareModal = useCallback((message?: string) => {
    setShareState({ open: true, message });
  }, []);

  const executeMove = useCallback(
    (holeId: number, currentSnapshot: GameState) => {
      const legal = getLegalMoves(
        currentSnapshot.holes,
        currentSnapshot.currentPlayer,
      );
      if (!legal.includes(holeId) || currentSnapshot.isAnimating) return;

      clearPendingTimers();
      setHintHoleId(null);

      if (mode === 'local' || currentSnapshot.currentPlayer === 'player') {
        setUndoStack((prev) => [...prev, cloneGameState(currentSnapshot)]);
      }

      const { nextState, steps, summary } = simulateMove(currentSnapshot, holeId);

      setGameState((prev) => ({
        ...prev,
        selectedHole: holeId,
        isAnimating: true,
      }));

      const speedFactor =
        settings.speed === 'brisk'
          ? 0.72
          : settings.speed === 'measured'
            ? 1.38
            : 1.0;

      let elapsed = 0;
      let dropStepIndex = 0;
      const isLongChain = steps.length > 18;
      const baseDrop = isLongChain ? 95 : 125;

      steps.forEach((step) => {
        const rawDelay =
          step.type === 'pickup'
            ? 85
            : step.type === 'capture'
              ? 230
              : step.type === 'relay'
                ? 170
                : step.type === 'sweep_remaining'
                  ? 210
                  : baseDrop;

        elapsed += Math.round(rawDelay * speedFactor);

        scheduleTimer(() => {
          setActiveCue({
            holeId: step.holeId,
            type: step.type,
            stonesInHand: step.stonesInHand,
            capturedBy: step.capturedBy,
            isLastStoneCapture: step.isLastStoneCapture,
          });

          setGameState((prev) => ({
            ...prev,
            holes: prev.holes.map((h, idx) => ({
              ...h,
              stones: step.holeCounts[idx],
            })),
            playerStore: step.playerStore,
            opponentStore: step.opponentStore,
          }));

          if (step.type === 'pickup') {
            soundEngine.playPickup();
          } else if (step.type === 'drop') {
            soundEngine.playDrop(dropStepIndex);
            dropStepIndex += 1;
          } else if (step.type === 'relay') {
            soundEngine.playRelay();
          } else if (step.type === 'capture') {
            soundEngine.playCapture(step.capturedBy === 'player');
          }
        }, elapsed);
      });

      scheduleTimer(() => {
        setActiveCue(null);
        const capturedNow = summary.capturedByPlayer + summary.capturedByOpponent;
        haptic(nextState.gameOver ? 'success' : capturedNow > 0 ? 'medium' : 'light');
        setGameState(nextState);

        const totalCap = summary.capturedByPlayer + summary.capturedByOpponent;
        if (nextState.gameOver) {
          setStatusMessage(t.remainingSwept);
          scheduleTimer(() => {
            soundEngine.playGameOver(nextState.winner === 'player');
            if (mode === 'ai' && nextState.playerStore > bestScore) {
              setBestScore(nextState.playerStore);
              try {
                localStorage.setItem(
                  'gebeta_best_score',
                  String(nextState.playerStore),
                );
              } catch {
                // Ignore
              }
            }
          }, 340);
        } else if (totalCap > 0) {
          setStatusMessage(
            summary.endedByCapture
              ? `${t.familyCapture} (${t.lastStoneCaptureNote})`
              : t.familyCapture,
          );
        } else if (summary.relayCount > 0) {
          setStatusMessage(
            `${t.relayNote} ×${summary.relayCount} · ${t.turnEndedEmpty}`,
          );
        } else {
          setStatusMessage(t.turnEndedEmpty);
        }
      }, elapsed + 160);
    },
    [bestScore, clearPendingTimers, mode, scheduleTimer, settings.speed, t],
  );

  const handleSelectHole = useCallback(
    (holeId: number) => {
      if (
        page !== 'play' ||
        paused ||
        gameState.isAnimating ||
        gameState.gameOver
      ) {
        return;
      }
      if (mode === 'ai' && gameState.currentPlayer !== 'player') {
        return;
      }
      executeMove(holeId, gameState);
    },
    [executeMove, gameState, mode, page, paused],
  );

  // Automatic AI Turn
  useEffect(() => {
    if (
      page !== 'play' ||
      paused ||
      mode !== 'ai' ||
      gameState.isAnimating ||
      gameState.gameOver ||
      gameState.currentPlayer !== 'opponent'
    ) {
      return;
    }

    const aiTimer = window.setTimeout(() => {
      const chosen = chooseAIMove(gameState, difficulty);
      if (chosen !== null) {
        executeMove(chosen, gameState);
      }
    }, 600);

    return () => window.clearTimeout(aiTimer);
  }, [difficulty, executeMove, gameState, mode, page, paused]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || page !== 'play') return;
    clearPendingTimers();
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((stack) => stack.slice(0, -1));
    setActiveCue(null);
    setHintHoleId(null);
    setGameState(cloneGameState(prev));
    setStatusMessage('');
  }, [clearPendingTimers, page, undoStack]);

  const handleShowHint = useCallback(() => {
    if (
      page !== 'play' ||
      paused ||
      gameState.isAnimating ||
      gameState.gameOver ||
      (mode === 'ai' && gameState.currentPlayer !== 'player')
    ) {
      return;
    }
    const best = getBestHintMove(gameState);
    setHintHoleId(best);
  }, [gameState, mode, page, paused]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (shareState.open) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setShareState({ open: false });
        }
        return;
      }

      if (page === 'home') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartGame();
          return;
        }
        if (e.key.toLowerCase() === 'm') {
          e.preventDefault();
          handleToggleMute();
        }
        return;
      }

      if (page === 'about' || page === 'settings' || page === 'dashboard') {
        if (e.key === 'Escape') {
          e.preventDefault();
          setPage(returnPage);
        }
        return;
      }

      // Play page shortcuts
      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        if (!gameState.gameOver) {
          e.preventDefault();
          setPaused((prev) => !prev);
        }
        return;
      }

      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleToggleMute();
        return;
      }

      if (e.key.toLowerCase() === 'v') {
        e.preventDefault();
        updateSettings({
          cameraPreset:
            settings.cameraPreset === 'angled' ? 'topdown' : 'angled',
        });
        return;
      }

      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleRestartMatch();
        return;
      }

      if (e.key.toLowerCase() === 'u') {
        e.preventDefault();
        handleUndo();
        return;
      }

      if (
        !paused &&
        ['1', '2', '3', '4', '5', '6'].includes(e.key)
      ) {
        const num = Number(e.key);
        const holeId =
          gameState.currentPlayer === 'player' ? num - 1 : 12 - num;
        handleSelectHole(holeId);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    gameState.currentPlayer,
    gameState.gameOver,
    handleRestartMatch,
    handleSelectHole,
    handleStartGame,
    handleToggleMute,
    handleUndo,
    page,
    paused,
    returnPage,
    settings.cameraPreset,
    shareState.open,
    updateSettings,
  ]);

  const p1Label = mode === 'ai' ? t.playerLabel : t.player1Label;
  const p2Label = mode === 'ai' ? t.aiLabel : t.player2Label;
  const turnText = getTurnStatusText(
    t,
    mode,
    gameState.currentPlayer,
    gameState.isAnimating,
  );

  const gameOverShareMessage = `${t.gameName} — ${p1Label} ${gameState.playerStore} : ${gameState.opponentStore} ${p2Label}. ${t.shareMessageInvite}`;

  const renderPage = () => {
    if (page === 'dashboard') {
      return (
        <DashboardPage
          t={t}
          history={matchHistory}
          onClearHistory={handleClearHistory}
          onBack={() => setPage(returnPage)}
          onPlay={() => setPage('play')}
          onOpenSettings={() => setPage('settings')}
          onOpenShare={(summaryText) => openShareModal(summaryText)}
        />
      );
    }

    if (page === 'about') {
      return (
        <AboutPage
          t={t}
          onBack={() => setPage(returnPage)}
          onPlay={() => setPage('play')}
          onOpenSettings={() => setPage('settings')}
          onOpenDashboard={() => setPage('dashboard')}
        />
      );
    }

    if (page === 'settings') {
      return (
        <SettingsPage
          t={t}
          settings={settings}
          onUpdateSettings={updateSettings}
          onResetDefaults={() => {
            soundEngine.setMuted(false);
            setSettings(DEFAULT_SETTINGS);
          }}
          onBack={() => setPage(returnPage)}
          onPlay={() => setPage('play')}
          onOpenAbout={() => setPage('about')}
          onOpenDashboard={() => setPage('dashboard')}
        />
      );
    }

    if (page === 'home') {
      return (
        <GebetaTitleScreen
          t={t}
          language={settings.language}
          onChangeLanguage={(lang) => updateSettings({ language: lang })}
          mode={mode}
          onChangeMode={setMode}
          difficulty={difficulty}
          onChangeDifficulty={setDifficulty}
          muted={settings.muted}
          onToggleMute={handleToggleMute}
          hasActiveMatch={gameState.turnCount > 0 && !gameState.gameOver}
          onStart={handleStartGame}
          onResumeMatch={() => setPage('play')}
          onOpenAbout={() => openSubPage('about')}
          onOpenSettings={() => openSubPage('settings')}
          onOpenDashboard={() => openSubPage('dashboard')}
          onOpenShare={() => openShareModal()}
        />
      );
    }

    return (
      <div className="relative h-screen w-screen overflow-hidden bg-[#160F0A] text-[#F5EDE0]">
      {/* Full-Viewport Interactive 3D Board Canvas */}
      <GebetaScene3D
        holes={gameState.holes}
        playerStore={gameState.playerStore}
        opponentStore={gameState.opponentStore}
        currentPlayer={gameState.currentPlayer}
        mode={mode}
        theme={settings.theme}
        accent={settings.accent}
        cameraPreset={settings.cameraPreset}
        isAnimating={gameState.isAnimating}
        gameOver={gameState.gameOver}
        activeCue={activeCue}
        hintHoleId={hintHoleId}
        t={t}
        onSelectHole={handleSelectHole}
      />

      {/* Minimal Top-Left / Top-Center Perimeter Status Cluster (No backdrop-filter!) */}
      <div className="pointer-events-none fixed top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 pt-3 sm:pt-4">
        <div className="pointer-events-auto inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#1A100A]/92 accent-border border shadow-lg">
          <button
            type="button"
            onClick={() => setPage('home')}
            aria-label={t.navHome}
            className="inline-flex items-center gap-1.5 font-display font-bold text-base sm:text-lg text-[#FFF4E0] hover:opacity-80 transition-opacity whitespace-nowrap cursor-pointer"
          >
            <Home className="w-4 h-4 accent-text" />
            <span>{t.gameName}</span>
          </button>
          <span aria-hidden="true" className="text-[#6E563E]">
            ·
          </span>
          <span
            data-testid="turn-status"
            className="text-xs sm:text-sm font-semibold accent-text whitespace-nowrap"
          >
            {turnText}
          </span>
          <span
            aria-hidden="true"
            className="hidden md:inline text-[#6E563E]"
          >
            /
          </span>
          <span className="hidden md:inline text-xs text-[#C5AF91] whitespace-nowrap">
            {mode === 'ai'
              ? `${t.modeAI} (${getDifficultyLabel(t, difficulty)})`
              : t.modeLocal}
          </span>
        </div>

        {/* Compact Top-Right Score & Pause Cluster */}
        <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1A100A]/92 accent-border border shadow-lg">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium pr-1">
            <span className="text-[#C5AF91]">{p1Label}</span>
            <span className="font-mono-nums font-bold accent-text text-base">
              {gameState.playerStore}
            </span>
            <span className="text-[#6E563E]">:</span>
            <span className="font-mono-nums font-bold text-[#FFF4E0] text-base">
              {gameState.opponentStore}
            </span>
            <span className="text-[#C5AF91]">{p2Label}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              setPaused(true);
            }}
            aria-label={t.pause}
            title={t.pause}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#281A11] hover:bg-[#382519] text-[#F5EDE0] transition-colors cursor-pointer"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Unified Bottom Control Dock (Zero Left/Right Side Occlusion) */}
      <div className="pointer-events-none fixed bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center w-[min(94vw,860px)]">
        <button
          type="button"
          onClick={() => setDockCollapsed((prev) => !prev)}
          aria-expanded={!dockCollapsed}
          aria-label="Toggle controls"
          className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-[#1A100A]/92 border border-b-0 accent-border text-[11px] font-medium text-[#C5AF91] hover:text-[#FFF4E0] cursor-pointer"
        >
          {dockCollapsed ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
          <span>{dockCollapsed ? t.playHint.split('·')[0] : t.dragToOrbitHint}</span>
        </button>

        {!dockCollapsed && (
          <div className="pointer-events-auto w-full rounded-xl bg-[#1A100A]/94 accent-border border px-3 sm:px-4 py-2.5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <p className="text-xs text-[#E8D7BE] text-center sm:text-left truncate max-w-full sm:max-w-[340px]">
              {statusMessage || t.selectPitPrompt}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  updateSettings({
                    cameraPreset:
                      settings.cameraPreset === 'angled' ? 'topdown' : 'angled',
                  });
                }}
                aria-label={t.cameraLabel}
                title={t.cameraLabel}
                className="inline-flex items-center gap-1.5 px-2.5 h-9 rounded-lg bg-[#26180F] hover:bg-[#342216] border border-[#D4A035]/20 text-xs font-medium text-[#DFCBB0] transition-colors whitespace-nowrap cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 accent-text" />
                <span className="hidden sm:inline">
                  {settings.cameraPreset === 'angled'
                    ? t.cameraAngled
                    : t.cameraTopDown}
                </span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  handleShowHint();
                }}
                disabled={
                  gameState.isAnimating ||
                  gameState.gameOver ||
                  (mode === 'ai' && gameState.currentPlayer !== 'player')
                }
                aria-label={t.hint}
                title={t.hint}
                className="inline-flex items-center gap-1.5 px-2.5 h-9 rounded-lg bg-[#26180F] hover:bg-[#342216] disabled:opacity-40 border border-[#D4A035]/20 text-xs font-medium text-[#DFCBB0] transition-colors whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
              >
                <Lightbulb className="w-3.5 h-3.5 accent-text" />
                <span className="hidden sm:inline">{t.hint}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  handleUndo();
                }}
                disabled={undoStack.length === 0}
                aria-label={t.undo}
                title={t.undo}
                className="inline-flex items-center gap-1.5 px-2.5 h-9 rounded-lg bg-[#26180F] hover:bg-[#342216] disabled:opacity-40 border border-[#D4A035]/20 text-xs font-medium text-[#DFCBB0] transition-colors whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.undo}</span>
              </button>

              <button
                type="button"
                data-testid="hud-share-btn"
                onClick={() => openShareModal()}
                aria-label={t.shareButton}
                title={t.shareButton}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#26180F] hover:bg-[#342216] border border-[#D4A035]/20 text-[#DFCBB0] transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 accent-text" />
              </button>

              <button
                type="button"
                onClick={() => openSubPage('about')}
                aria-label={t.navAbout}
                title={t.navAbout}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#26180F] hover:bg-[#342216] border border-[#D4A035]/20 text-[#DFCBB0] transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => openSubPage('settings')}
                aria-label={t.navSettings}
                title={t.navSettings}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#26180F] hover:bg-[#342216] border border-[#D4A035]/20 text-[#DFCBB0] transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  handleToggleMute();
                }}
                aria-label={settings.muted ? t.unmute : t.mute}
                title={settings.muted ? t.unmute : t.mute}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#26180F] hover:bg-[#342216] border border-[#D4A035]/20 text-[#DFCBB0] transition-colors cursor-pointer"
              >
                {settings.muted ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  handleRestartMatch();
                }}
                aria-label={t.restart}
                title={t.restart}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#26180F] hover:bg-[#342216] border border-[#D4A035]/20 text-[#DFCBB0] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <PauseModal
        open={paused && !gameState.gameOver}
        t={t}
        theme={settings.theme}
        onChangeTheme={(theme) => updateSettings({ theme })}
        onResume={() => setPaused(false)}
        onRestart={handleRestartMatch}
        onOpenSettings={() => openSubPage('settings')}
        onMainMenu={() => {
          setPaused(false);
          setPage('home');
        }}
      />

      <GameOverModal
        open={gameState.gameOver}
        t={t}
        mode={mode}
        winner={gameState.winner}
        playerStore={gameState.playerStore}
        opponentStore={gameState.opponentStore}
        turnsPlayed={gameState.turnCount}
        bestScore={bestScore}
        onPlayAgain={handleRestartMatch}
        onShareResult={() => openShareModal(gameOverShareMessage)}
        onMainMenu={() => setPage('home')}
      />
    </div>
    );
  };

  return (
    <>
      {renderPage()}
      <ShareModal
        open={shareState.open}
        t={t}
        customMessage={shareState.message}
        onClose={() => setShareState({ open: false })}
      />
    </>
  );
}
