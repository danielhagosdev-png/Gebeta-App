import React from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import type { BoardTheme, GameMode, Hole, PlayerId } from '../game/types';
import type { TranslationDict } from '../game/i18n';
import { PitStoneCluster } from './PitStoneCluster';

export type ActiveAnimationCue = {
  holeId: number;
  type: 'pickup' | 'drop' | 'capture' | 'relay' | 'end_empty' | 'sweep_remaining';
  stonesInHand: number;
  capturedBy?: PlayerId;
  isLastStoneCapture?: boolean;
};

type GebetaBoardProps = {
  holes: Hole[];
  playerStore: number;
  opponentStore: number;
  currentPlayer: PlayerId;
  mode: GameMode;
  theme: BoardTheme;
  isAnimating: boolean;
  gameOver: boolean;
  activeCue: ActiveAnimationCue | null;
  hintHoleId: number | null;
  t: TranslationDict;
  onSelectHole: (holeId: number) => void;
};

const THEME_STYLES: Record<
  BoardTheme,
  {
    boardBg: string;
    boardBorder: string;
    pitBg: string;
    pitBorder: string;
    storeBg: string;
    grainColor: string;
  }
> = {
  wanza: {
    boardBg: 'bg-[#382214]',
    boardBorder: 'border-[#6E492D]',
    pitBg: 'bg-[#21120A]',
    pitBorder: 'border-[#5B3B24]',
    storeBg: 'bg-[#1D1009]',
    grainColor: 'rgba(212, 160, 53, 0.08)',
  },
  basalt: {
    boardBg: 'bg-[#26282C]',
    boardBorder: 'border-[#494E56]',
    pitBg: 'bg-[#17181B]',
    pitBorder: 'border-[#3E4249]',
    storeBg: 'bg-[#141518]',
    grainColor: 'rgba(255, 255, 255, 0.05)',
  },
  acacia: {
    boardBg: 'bg-[#56361D]',
    boardBorder: 'border-[#8D5E34]',
    pitBg: 'bg-[#321E0F]',
    pitBorder: 'border-[#774D2A]',
    storeBg: 'bg-[#2B190C]',
    grainColor: 'rgba(255, 224, 160, 0.09)',
  },
};

const TOP_ROW_IDS = [11, 10, 9, 8, 7, 6];
const BOTTOM_ROW_IDS = [0, 1, 2, 3, 4, 5];

export const GebetaBoard: React.FC<GebetaBoardProps> = ({
  holes,
  playerStore,
  opponentStore,
  currentPlayer,
  mode,
  theme,
  isAnimating,
  gameOver,
  activeCue,
  hintHoleId,
  t,
  onSelectHole,
}) => {
  const palette = THEME_STYLES[theme];

  const opponentTitle = mode === 'ai' ? t.aiLabel : t.player2Label;
  const playerTitle = mode === 'ai' ? t.playerLabel : t.player1Label;

  const canHumanInteract =
    !isAnimating && !gameOver && (mode === 'local' || currentPlayer === 'player');

  const renderPit = (holeId: number, displayIndex: number) => {
    const hole = holes[holeId];
    const isOwnerTurn = hole.owner === currentPlayer;
    const isInteractive =
      canHumanInteract && isOwnerTurn && hole.stones > 0;

    const isCueTarget = activeCue?.holeId === holeId;
    const isCaptureFlash = isCueTarget && activeCue?.type === 'capture';
    const isRelayFlash = isCueTarget && activeCue?.type === 'relay';
    const isHinted = hintHoleId === holeId && isInteractive;
    const isFamilyReady = hole.stones === 3;

    const sideLabel = hole.owner === 'player' ? playerTitle : opponentTitle;

    return (
      <div key={holeId} className="relative flex flex-col items-center gap-2 sm:gap-1.5">
        {/* Top row pit numbers sit above; bottom row pit numbers sit below */}
        {hole.owner === 'opponent' && (
          <span className="text-[11px] font-mono-nums text-[#B59D80]/70 select-none">
            {displayIndex}
          </span>
        )}

        <button
          type="button"
          data-testid={`pit-${holeId}`}
          data-stones={hole.stones}
          disabled={!isInteractive}
          onClick={() => onSelectHole(holeId)}
          aria-label={t.pitAriaLabel(sideLabel, displayIndex, hole.stones)}
          className={`group relative w-[46px] h-[46px] sm:w-[74px] sm:h-[74px] md:w-[86px] md:h-[86px] lg:w-[96px] lg:h-[96px] rounded-full ${palette.pitBg} border-2 transition-transform duration-150 ease-out flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A035] ${
            isCaptureFlash
              ? 'border-[#F3C15A] ring-4 ring-[#D4A035]/45 scale-105'
              : isRelayFlash
                ? 'border-[#E07A48] ring-4 ring-[#C85A32]/40 scale-105'
                : isCueTarget
                  ? 'border-[#D4A035] ring-2 ring-[#D4A035]/40 animate-pit-pulse'
                  : isHinted
                    ? 'border-[#D4A035] ring-4 ring-[#D4A035]/35 scale-[1.03]'
                    : isInteractive
                      ? `${palette.pitBorder} hover:border-[#D4A035] hover:-translate-y-0.5 active:scale-95 cursor-pointer`
                      : `${palette.pitBorder} opacity-90 cursor-default`
          }`}
          style={{
            boxShadow:
              'inset 0 7px 14px rgba(0, 0, 0, 0.72), inset 0 -2px 4px rgba(255, 228, 185, 0.08)',
          }}
        >
          {/* Subtle golden rim indicator when a pit has 3 stones (1 away from Family of 4) */}
          {isFamilyReady && !isCueTarget && (
            <span
              aria-hidden="true"
              className="absolute inset-1 rounded-full border border-dashed border-[#D4A035]/45 pointer-events-none"
            />
          )}

          {/* Stone visual cluster */}
          <div className="w-[84%] h-[84%]">
            <PitStoneCluster count={hole.stones} seedOffset={holeId} />
          </div>

          {/* Crisp tabular numeric count badge */}
          <span
            className={`absolute -bottom-1.5 sm:-bottom-2 px-1.5 py-0.5 min-w-[22px] rounded-md text-[11px] sm:text-xs font-mono-nums font-semibold leading-none border shadow-sm transition-colors ${
              hole.stones === 0
                ? 'bg-[#17100B] text-[#7D6B56] border-[#3C2B1E]'
                : hole.stones === 3
                  ? 'bg-[#3C2810] text-[#F3C15A] border-[#D4A035]/60'
                  : 'bg-[#1F140D] text-[#F7EEDD] border-[#664A32]'
            }`}
          >
            {hole.stones}
          </span>

          {/* Active Hand Counter while sowing */}
          {isCueTarget && activeCue && activeCue.stonesInHand > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-3 z-20 px-2 py-0.5 rounded-md bg-[#D4A035] text-[#1A1008] text-[11px] font-mono-nums font-bold shadow-md"
            >
              {activeCue.stonesInHand}
            </span>
          )}

          {/* Floating +4 Capture Burst */}
          {isCaptureFlash && (
            <span
              aria-hidden="true"
              className="animate-capture-burst absolute -top-7 z-30 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D4A035] text-[#1A1008] text-xs font-bold shadow-lg whitespace-nowrap"
            >
              <Sparkles className="w-3 h-3" />
              +4
            </span>
          )}
        </button>

        {hole.owner === 'player' && (
          <span className="text-[11px] font-mono-nums text-[#B59D80]/80 select-none">
            {displayIndex}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      data-testid="gebeta-board"
      className={`relative w-full max-w-[980px] mx-auto rounded-2xl sm:rounded-3xl border-2 ${palette.boardBg} ${palette.boardBorder} p-3 sm:p-5 md:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.65)]`}
      style={{
        backgroundImage: `radial-gradient(ellipse at 50% 35%, ${palette.grainColor} 0%, transparent 72%)`,
        boxShadow:
          '0 24px 60px rgba(0,0,0,0.68), inset 0 2px 3px rgba(255,228,185,0.14), inset 0 -6px 14px rgba(0,0,0,0.55)',
      }}
    >
      {/* Mobile Portrait Opponent Store Strip (< 640px) */}
      <div className="sm:hidden flex items-center justify-between gap-3 mb-3 px-3 py-2 rounded-xl border border-[#5B3B24]/70 bg-[#1B1009]/85">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-full bg-[#140B06] border border-[#5B3B24] p-1"
            style={{ boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.7)' }}
          >
            <PitStoneCluster count={opponentStore} seedOffset={12} isStore />
          </div>
          <div>
            <div className="text-xs font-medium text-[#C5AF91]">
              {opponentTitle} · {t.storeLabel}
            </div>
            <div className="text-lg font-display font-bold tabular-nums text-[#FFF4E0] leading-tight">
              {opponentStore}
            </div>
          </div>
        </div>
        {currentPlayer === 'opponent' && !gameOver && (
          <span className="text-xs font-semibold text-[#D4A035]">
            {mode === 'ai' ? t.aiThinking : t.player2Turn}
          </span>
        )}
      </div>

      {/* Main Board Grid: Left Store (sm+) | 2x6 Pits | Right Store (sm+) */}
      <div className="flex items-stretch gap-3 sm:gap-4 md:gap-6">
        {/* Desktop/Tablet Opponent Store (Left) */}
        <div
          data-testid="opponent-store"
          className={`hidden sm:flex flex-col items-center justify-between w-[82px] md:w-[98px] rounded-2xl border-2 ${palette.storeBg} ${
            currentPlayer === 'opponent' && !gameOver
              ? 'border-[#D4A035]/70'
              : palette.pitBorder
          } py-3 px-2 shrink-0`}
          style={{
            boxShadow: 'inset 0 8px 18px rgba(0, 0, 0, 0.75)',
          }}
        >
          <span className="text-[11px] font-medium text-[#C5AF91] text-center leading-tight">
            {opponentTitle}
          </span>
          <div className="w-14 h-20 md:w-16 md:h-24 my-1">
            <PitStoneCluster count={opponentStore} seedOffset={12} isStore />
          </div>
          <div className="text-center">
            <div className="text-2xl font-display font-bold tabular-nums text-[#FFF4E0] leading-none">
              {opponentStore}
            </div>
            <span className="text-[10px] text-[#9A8469]">{t.storeLabel}</span>
          </div>
        </div>

        {/* Center 2x6 Pit Matrix */}
        <div className="flex-1 flex flex-col justify-center gap-2 sm:gap-3.5">
          {/* Top Row (Opponent): indices 11..6 left-to-right */}
          <div className="grid grid-cols-6 gap-1.5 sm:gap-3 md:gap-4 place-items-center">
            {TOP_ROW_IDS.map((id, idx) => renderPit(id, 6 - idx))}
          </div>

          {/* Engraved Anti-Clockwise Flow Divider */}
          <div
            aria-hidden="true"
            className="flex items-center justify-between px-3 sm:px-6 py-0.5 text-[#D4A035]/45 select-none"
          >
            <div className="flex items-center gap-1.5 text-[11px]">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline tracking-wide">{opponentTitle}</span>
            </div>
            <div className="h-px flex-1 mx-3 bg-[#D4A035]/15" />
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="hidden sm:inline tracking-wide">{playerTitle}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Bottom Row (Player): indices 0..5 left-to-right */}
          <div className="grid grid-cols-6 gap-1.5 sm:gap-3 md:gap-4 place-items-center">
            {BOTTOM_ROW_IDS.map((id, idx) => renderPit(id, idx + 1))}
          </div>
        </div>

        {/* Desktop/Tablet Player Store (Right) */}
        <div
          data-testid="player-store"
          className={`hidden sm:flex flex-col items-center justify-between w-[82px] md:w-[98px] rounded-2xl border-2 ${palette.storeBg} ${
            currentPlayer === 'player' && !gameOver
              ? 'border-[#D4A035]/70'
              : palette.pitBorder
          } py-3 px-2 shrink-0`}
          style={{
            boxShadow: 'inset 0 8px 18px rgba(0, 0, 0, 0.75)',
          }}
        >
          <span className="text-[11px] font-medium text-[#C5AF91] text-center leading-tight">
            {playerTitle}
          </span>
          <div className="w-14 h-20 md:w-16 md:h-24 my-1">
            <PitStoneCluster count={playerStore} seedOffset={5} isStore />
          </div>
          <div className="text-center">
            <div className="text-2xl font-display font-bold tabular-nums text-[#F3C15A] leading-none">
              {playerStore}
            </div>
            <span className="text-[10px] text-[#9A8469]">{t.storeLabel}</span>
          </div>
        </div>
      </div>

      {/* Mobile Portrait Player Store Strip (< 640px) */}
      <div className="sm:hidden flex items-center justify-between gap-3 mt-3 px-3 py-2 rounded-xl border border-[#5B3B24]/70 bg-[#1B1009]/85">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-full bg-[#140B06] border border-[#5B3B24] p-1"
            style={{ boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.7)' }}
          >
            <PitStoneCluster count={playerStore} seedOffset={5} isStore />
          </div>
          <div>
            <div className="text-xs font-medium text-[#C5AF91]">
              {playerTitle} · {t.storeLabel}
            </div>
            <div className="text-lg font-display font-bold tabular-nums text-[#F3C15A] leading-tight">
              {playerStore}
            </div>
          </div>
        </div>
        {currentPlayer === 'player' && !gameOver && (
          <span className="text-xs font-semibold text-[#D4A035]">
            {mode === 'ai' ? t.yourTurn : t.player1Turn}
          </span>
        )}
      </div>
    </div>
  );
};
