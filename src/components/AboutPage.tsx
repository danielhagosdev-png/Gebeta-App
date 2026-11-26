import React, { useEffect, useState } from 'react';
import { ArrowLeft, BarChart3, BookOpen, Compass, Play, RotateCcw, Settings } from 'lucide-react';
import type { TranslationDict } from '../game/i18n';

type AboutPageProps = {
  t: TranslationDict;
  onBack: () => void;
  onPlay: () => void;
  onOpenSettings: () => void;
  onOpenDashboard: () => void;
};

type DemoFrame = {
  pits: [number, number, number, number];
  playerStore: number;
  highlightIdx: number;
};

const DEMO_FRAMES: DemoFrame[] = [
  { pits: [2, 0, 3, 1], playerStore: 0, highlightIdx: 0 },
  { pits: [0, 1, 3, 1], playerStore: 0, highlightIdx: 1 },
  { pits: [0, 1, 4, 1], playerStore: 0, highlightIdx: 2 },
  { pits: [0, 1, 0, 1], playerStore: 4, highlightIdx: 2 },
];

export const AboutPage: React.FC<AboutPageProps> = ({
  t,
  onBack,
  onPlay,
  onOpenSettings,
  onOpenDashboard,
}) => {
  const [frameIdx, setFrameIdx] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (frameIdx >= DEMO_FRAMES.length - 1) {
      setRunning(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setFrameIdx((prev) => prev + 1);
    }, 850);
    return () => window.clearTimeout(timer);
  }, [running, frameIdx]);

  const frame = DEMO_FRAMES[frameIdx];

  return (
    <div className="min-h-screen w-full bg-[#160F0A] text-[#F5EDE0] flex flex-col">
      {/* Page Top Header */}
      <header className="w-full max-w-5xl mx-auto px-5 sm:px-8 pt-6 pb-4 flex items-center justify-between gap-4 border-b border-[#D4A035]/15">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-lg bg-[#231710] hover:bg-[#322117] border border-[#D4A035]/20 text-sm font-medium text-[#E8D7BE] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToMenu}</span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenDashboard}
            className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-lg bg-[#231710] hover:bg-[#322117] border border-[#D4A035]/20 text-sm font-medium text-[#E8D7BE] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 accent-text" />
            <span className="hidden sm:inline">{t.navDashboard}</span>
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-lg bg-[#231710] hover:bg-[#322117] border border-[#D4A035]/20 text-sm font-medium text-[#E8D7BE] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Settings className="w-4 h-4 accent-text" />
            <span className="hidden sm:inline">{t.navSettings}</span>
          </button>
          <button
            type="button"
            onClick={onPlay}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-lg accent-bg font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{t.navPlay}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-5 sm:px-8 py-8 space-y-10">
        {/* Title Hero */}
        <section className="space-y-2.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium accent-text">
            <BookOpen className="w-4 h-4" />
            <span>{t.gameName}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#FFF4E0] text-balance">
            {t.rulesTitle}
          </h1>
          <p className="text-sm sm:text-base text-[#CBB597] leading-relaxed">
            {t.aboutSubtitle}
          </p>
        </section>

        {/* Origins & Heritage Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="rounded-2xl bg-[#1E140D] border border-[#D4A035]/20 p-6 space-y-3">
            <div className="flex items-center gap-2 font-display text-lg font-bold accent-text">
              <Compass className="w-5 h-5" />
              <h2>{t.originsTitle}</h2>
            </div>
            <p className="text-sm text-[#DFCBB0] leading-relaxed">
              {t.originsParagraph1}
            </p>
            <p className="text-sm text-[#CBB597] leading-relaxed">
              {t.originsParagraph2}
            </p>
          </article>

          <article className="rounded-2xl bg-[#1E140D] border border-[#D4A035]/20 p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold accent-text">
                {t.etymologyTitle}
              </h2>
              <p className="text-sm text-[#DFCBB0] leading-relaxed">
                {t.etymologyBody}
              </p>
            </div>

            {/* Interactive 4-Step Capture Demo */}
            <div className="rounded-xl bg-[#140D08] border border-[#D4A035]/20 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold accent-text">
                  {t.demoStepLabel}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFrameIdx(0);
                      setRunning(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-md accent-bg text-xs font-semibold transition-colors cursor-pointer"
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

              <div className="flex items-center justify-between gap-2.5">
                <div className="grid grid-cols-4 gap-2 flex-1">
                  {frame.pits.map((count, idx) => {
                    const isActive = frame.highlightIdx === idx;
                    const ownerTag = idx === 0 ? t.playerLabel : t.aiLabel;
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-colors ${
                          isActive
                            ? 'bg-[#362316] accent-border'
                            : 'bg-[#1D120B] border-[#3F2B1D]'
                        }`}
                      >
                        <span className="text-[10px] text-[#B59D80]">{ownerTag}</span>
                        <div className="w-9 h-9 rounded-full bg-[#120B07] border border-[#5A3D28] flex items-center justify-center font-mono-nums text-sm font-bold text-[#FFF4E0]">
                          {count}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col items-center justify-center px-3 py-2 rounded-xl bg-[#27190F] accent-border border min-w-[70px]">
                  <span className="text-[10px] text-[#C5AF91]">{t.storeLabel}</span>
                  <span className="text-lg font-display font-bold tabular-nums accent-text">
                    {frame.playerStore}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#E7D7BE]">{t.demoCaptions[frameIdx]}</p>
            </div>
          </article>
        </section>

        {/* How to Play 4-Step Rules Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { title: t.rulesStep1Title, body: t.rulesStep1Body },
            { title: t.rulesStep2Title, body: t.rulesStep2Body },
            { title: t.rulesStep3Title, body: t.rulesStep3Body },
            { title: t.rulesStep4Title, body: t.rulesStep4Body },
          ].map((rule) => (
            <div
              key={rule.title}
              className="rounded-xl bg-[#1C130C] border border-[#D4A035]/15 p-5 space-y-2"
            >
              <h3 className="font-display font-bold text-base accent-text">
                {rule.title}
              </h3>
              <p className="text-sm text-[#D4C0A5] leading-relaxed">{rule.body}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Studio & Copyright Footer */}
      <footer className="w-full max-w-5xl mx-auto px-5 sm:px-8 py-5 border-t border-[#D4A035]/15 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#9E886D]">
        <span>{t.developerCredit}</span>
        <span>{t.copyrightText}</span>
      </footer>
    </div>
  );
};
