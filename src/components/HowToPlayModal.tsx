import React, { useEffect, useState } from 'react';
import { X, Play, RotateCcw } from 'lucide-react';
import type { TranslationDict } from '../game/i18n';

type HowToPlayModalProps = {
  open: boolean;
  t: TranslationDict;
  onClose: () => void;
};

type DemoFrame = {
  pits: [number, number, number, number]; // Pit 5, Pit 6 (opp), Pit 7 (opp), Pit 8 (opp)
  playerStore: number;
  highlightIdx: number | null;
  caption: string;
};

const DEMO_FRAMES: DemoFrame[] = [
  {
    pits: [2, 0, 3, 1],
    playerStore: 0,
    highlightIdx: 0,
    caption: 'Pick 2 stones from your rightmost pit (Pit 6).',
  },
  {
    pits: [0, 1, 3, 1],
    playerStore: 0,
    highlightIdx: 1,
    caption: 'Drop 1st stone anti-clockwise into Opponent Pit 1.',
  },
  {
    pits: [0, 1, 4, 1],
    playerStore: 0,
    highlightIdx: 2,
    caption: 'Last stone lands on Opponent Pit 2 (3 + 1 = 4 stones!).',
  },
  {
    pits: [0, 1, 0, 1],
    playerStore: 4,
    highlightIdx: 2,
    caption: 'Last-stone Family! YOU capture all 4 stones.',
  },
];

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  open,
  t,
  onClose,
}) => {
  const [frameIdx, setFrameIdx] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!open) {
      setFrameIdx(0);
      setRunning(false);
    }
  }, [open]);

  useEffect(() => {
    if (!running || !open) return;
    if (frameIdx >= DEMO_FRAMES.length - 1) {
      setRunning(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setFrameIdx((prev) => prev + 1);
    }, 850);
    return () => window.clearTimeout(timer);
  }, [running, frameIdx, open]);

  if (!open) return null;

  const frame = DEMO_FRAMES[frameIdx];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gebeta-rules-title"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1E140D] border border-[#D4A035]/30 p-5 sm:p-7 shadow-2xl space-y-5">
        <div className="flex items-center justify-between gap-4 border-b border-[#D4A035]/15 pb-3">
          <h2
            id="gebeta-rules-title"
            className="text-xl sm:text-2xl font-display font-bold text-[#FFF4E0]"
          >
            {t.rulesTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.rulesClose}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#2B1D14] hover:bg-[#3A271B] text-[#E8D7BE] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Visual Mini-Example */}
        <div className="rounded-xl bg-[#140D08] border border-[#D4A035]/20 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#D4A035]">
              {t.demoStepLabel}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFrameIdx(0);
                  setRunning(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-md bg-[#D4A035] hover:bg-[#E0AF45] text-[#1A1008] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t.demoPlayButton}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRunning(false);
                  setFrameIdx(0);
                }}
                aria-label={t.demoResetButton}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-[#281A11] hover:bg-[#382519] text-[#DFCBB0] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 py-2">
            <div className="grid grid-cols-4 gap-2 sm:gap-3 flex-1">
              {frame.pits.map((count, idx) => {
                const isActive = frame.highlightIdx === idx;
                const ownerTag = idx === 0 ? t.playerLabel : t.aiLabel;
                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-colors ${
                      isActive
                        ? 'bg-[#362316] border-[#D4A035]'
                        : 'bg-[#1D120B] border-[#3F2B1D]'
                    }`}
                  >
                    <span className="text-[10px] text-[#B59D80]">{ownerTag}</span>
                    <div className="w-10 h-10 rounded-full bg-[#120B07] border border-[#5A3D28] flex items-center justify-center font-mono-nums text-base font-bold text-[#FFF4E0]">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col items-center justify-center px-3 py-2 rounded-xl bg-[#27190F] border border-[#D4A035]/40 min-w-[80px]">
              <span className="text-[10px] text-[#C5AF91]">{t.storeLabel}</span>
              <span className="text-xl font-display font-bold tabular-nums text-[#F3C15A]">
                {frame.playerStore}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#E7D7BE]">{t.demoCaptions[frameIdx]}</p>
        </div>

        {/* 4 Concise Rule Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <h3 className="font-semibold text-[#F3C15A]">{t.rulesStep1Title}</h3>
            <p className="text-[#D4C0A5] leading-relaxed">{t.rulesStep1Body}</p>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-[#F3C15A]">{t.rulesStep2Title}</h3>
            <p className="text-[#D4C0A5] leading-relaxed">{t.rulesStep2Body}</p>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-[#F3C15A]">{t.rulesStep3Title}</h3>
            <p className="text-[#D4C0A5] leading-relaxed">{t.rulesStep3Body}</p>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-[#F3C15A]">{t.rulesStep4Title}</h3>
            <p className="text-[#D4C0A5] leading-relaxed">{t.rulesStep4Body}</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 min-h-[42px] rounded-lg bg-[#D4A035] hover:bg-[#E0AF45] text-[#1A1008] font-semibold text-sm transition-colors cursor-pointer"
          >
            {t.rulesClose}
          </button>
        </div>
      </div>
    </div>
  );
};
