import React from 'react';
import { Play, RotateCcw, Home, Trophy, Settings, Share2 } from 'lucide-react';
import type { BoardTheme, GameMode, PlayerId } from '../game/types';
import type { TranslationDict } from '../game/i18n';
import { getThemeLabel } from '../game/i18n';

type PauseModalProps = {
  open: boolean;
  t: TranslationDict;
  theme: BoardTheme;
  onChangeTheme: (theme: BoardTheme) => void;
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onMainMenu: () => void;
};

export const PauseModal: React.FC<PauseModalProps> = ({
  open,
  t,
  theme,
  onChangeTheme,
  onResume,
  onRestart,
  onOpenSettings,
  onMainMenu,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gebeta-pause-title"
    >
      <div className="w-full max-w-sm rounded-2xl bg-[#1E140D] accent-border border p-6 shadow-2xl space-y-5">
        <h2
          id="gebeta-pause-title"
          className="text-2xl font-display font-bold text-[#FFF4E0] text-center"
        >
          {t.pausedTitle}
        </h2>

        <div className="space-y-1.5">
          <span className="block text-xs font-medium text-[#C5AF91]">
            {t.boardThemeLabel}
          </span>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-[#120B07]">
            {(['wanza', 'basalt', 'acacia'] as BoardTheme[]).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChangeTheme(opt)}
                className={`px-2 py-2 min-h-[38px] text-xs font-medium rounded-md transition-colors whitespace-nowrap truncate cursor-pointer ${
                  theme === opt
                    ? 'bg-[#3C2618] accent-text accent-border border'
                    : 'text-[#B8A286] hover:text-[#F5EDE0]'
                }`}
              >
                {getThemeLabel(t, opt)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[46px] rounded-lg accent-bg font-semibold text-sm transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{t.resume}</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg bg-[#2C1D13] hover:bg-[#3A271A] border border-[#D4A035]/25 text-[#F5EDE0] font-medium text-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.restart}</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg bg-[#2C1D13] hover:bg-[#3A271A] border border-[#D4A035]/25 text-[#F5EDE0] font-medium text-sm transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>{t.navSettings}</span>
          </button>

          <button
            type="button"
            onClick={onMainMenu}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg bg-transparent hover:bg-[#2C1D13]/60 text-[#C5AF91] hover:text-[#F5EDE0] font-medium text-sm transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{t.mainMenu}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

type GameOverModalProps = {
  open: boolean;
  t: TranslationDict;
  mode: GameMode;
  winner: PlayerId | 'draw' | null;
  playerStore: number;
  opponentStore: number;
  turnsPlayed: number;
  bestScore: number;
  onPlayAgain: () => void;
  onShareResult: () => void;
  onMainMenu: () => void;
};

export const GameOverModal: React.FC<GameOverModalProps> = ({
  open,
  t,
  mode,
  winner,
  playerStore,
  opponentStore,
  turnsPlayed,
  bestScore,
  onPlayAgain,
  onShareResult,
  onMainMenu,
}) => {
  if (!open) return null;

  let heading = t.drawTitle;
  if (winner === 'player') {
    heading = mode === 'ai' ? t.victoryTitle : t.p1WinsTitle;
  } else if (winner === 'opponent') {
    heading = mode === 'ai' ? t.defeatTitle : t.p2WinsTitle;
  }

  const p1Label = mode === 'ai' ? t.playerLabel : t.player1Label;
  const p2Label = mode === 'ai' ? t.aiLabel : t.player2Label;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gebeta-gameover-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#1E140D] accent-border border p-6 sm:p-7 shadow-2xl space-y-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-[#362313] accent-border border flex items-center justify-center accent-text">
            <Trophy className="w-6 h-6" />
          </div>
          <h2
            id="gebeta-gameover-title"
            className="text-3xl font-display font-bold text-[#FFF4E0]"
          >
            {heading}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-xl bg-[#140D08] border border-[#D4A035]/20 p-3">
            <div className="text-[11px] text-[#C5AF91]">{p1Label}</div>
            <div className="text-2xl font-display font-bold tabular-nums accent-text mt-0.5">
              {playerStore}
            </div>
          </div>
          <div className="rounded-xl bg-[#140D08] border border-[#D4A035]/20 p-3">
            <div className="text-[11px] text-[#C5AF91]">{p2Label}</div>
            <div className="text-2xl font-display font-bold tabular-nums text-[#FFF4E0] mt-0.5">
              {opponentStore}
            </div>
          </div>
          <div className="rounded-xl bg-[#140D08] border border-[#D4A035]/20 p-3">
            <div className="text-[11px] text-[#C5AF91]">
              {mode === 'ai' ? t.bestScore : t.turnsPlayed}
            </div>
            <div className="text-2xl font-display font-bold tabular-nums text-[#DFCBB0] mt-0.5">
              {mode === 'ai' ? bestScore : turnsPlayed}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            data-start="true"
            onClick={onPlayAgain}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[46px] rounded-lg accent-bg font-semibold text-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.playAgain}</span>
          </button>
          <button
            type="button"
            data-testid="gameover-share-btn"
            onClick={onShareResult}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[46px] rounded-lg bg-[#2C1D13] hover:bg-[#3A271A] border border-[#D4A035]/25 text-[#F5EDE0] font-medium text-sm transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4 accent-text" />
            <span>{t.shareButton}</span>
          </button>
          <button
            type="button"
            onClick={onMainMenu}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[46px] rounded-lg bg-[#2C1D13] hover:bg-[#3A271A] border border-[#D4A035]/25 text-[#F5EDE0] font-medium text-sm transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{t.mainMenu}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
