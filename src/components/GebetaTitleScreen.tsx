import React from 'react';
import {
  BarChart3,
  BookOpen,
  Play,
  Users,
  Cpu,
  Volume2,
  VolumeX,
  Settings,
  Share2,
} from 'lucide-react';
import type { AIDifficulty, GameMode, Language } from '../game/types';
import type { TranslationDict } from '../game/i18n';

type GebetaTitleScreenProps = {
  t: TranslationDict;
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  mode: GameMode;
  onChangeMode: (mode: GameMode) => void;
  difficulty: AIDifficulty;
  onChangeDifficulty: (diff: AIDifficulty) => void;
  muted: boolean;
  onToggleMute: () => void;
  hasActiveMatch: boolean;
  onStart: () => void;
  onResumeMatch: () => void;
  onOpenAbout: () => void;
  onOpenSettings: () => void;
  onOpenDashboard: () => void;
  onOpenShare: () => void;
};

export const GebetaTitleScreen: React.FC<GebetaTitleScreenProps> = ({
  t,
  language,
  onChangeLanguage,
  mode,
  onChangeMode,
  difficulty,
  onChangeDifficulty,
  muted,
  onToggleMute,
  hasActiveMatch,
  onStart,
  onResumeMatch,
  onOpenAbout,
  onOpenSettings,
  onOpenDashboard,
  onOpenShare,
}) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#140D08] flex flex-col justify-between">
      {/* Title backdrop: gradients over the base background */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute inset-0 bg-gradient-to-r from-[#120B07]/95 via-[#120B07]/82 to-[#120B07]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#120B07]/90 via-transparent to-[#120B07]/60" />
      </div>

      {/* Top Perimeter Bar: Language Switcher & Page Utilities */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-5 sm:px-10 pt-5 sm:pt-7">
        <div
          className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#231710]/90 accent-border border"
          role="group"
          aria-label={t.languageLabel}
        >
          {(['en', 'ti', 'am'] as Language[]).map((lang) => {
            const active = language === lang;
            const label =
              lang === 'en' ? 'English' : lang === 'ti' ? 'ትግርኛ' : 'አማርኛ';
            return (
              <button
                key={lang}
                type="button"
                onClick={() => onChangeLanguage(lang)}
                className={`px-3 py-1.5 min-h-[36px] text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'accent-bg'
                    : 'text-[#DFCBB0] hover:text-[#FFF5E4]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="menu-dashboard-btn"
            onClick={onOpenDashboard}
            aria-label={t.navDashboard}
            title={t.navDashboard}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 h-10 rounded-lg bg-[#231710]/90 border border-[#D4A035]/25 text-xs sm:text-sm font-medium text-[#F5EDE0] hover:border-[#D4A035]/60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 accent-text" />
            <span>{t.navDashboard}</span>
          </button>

          <button
            type="button"
            data-testid="menu-share-btn"
            onClick={onOpenShare}
            aria-label={t.shareButton}
            title={t.shareButton}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 h-10 rounded-lg bg-[#231710]/90 border border-[#D4A035]/25 text-xs sm:text-sm font-medium text-[#F5EDE0] hover:border-[#D4A035]/60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Share2 className="w-4 h-4 accent-text" />
            <span>{t.shareButton}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAbout}
            aria-label={t.navAbout}
            title={t.navAbout}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 h-10 rounded-lg bg-[#231710]/90 border border-[#D4A035]/25 text-xs sm:text-sm font-medium text-[#F5EDE0] hover:border-[#D4A035]/60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 accent-text" />
            <span className="hidden sm:inline">{t.navAbout}</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label={t.navSettings}
            title={t.navSettings}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 h-10 rounded-lg bg-[#231710]/90 border border-[#D4A035]/25 text-xs sm:text-sm font-medium text-[#F5EDE0] hover:border-[#D4A035]/60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Settings className="w-4 h-4 accent-text" />
            <span className="hidden sm:inline">{t.navSettings}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            aria-label={muted ? t.unmute : t.mute}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#231710]/90 border border-[#D4A035]/25 text-[#F5EDE0] hover:border-[#D4A035]/60 transition-colors cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Focal Title Lockup & Controls inside Left Negative Space */}
      <main className="relative z-10 flex-1 flex items-center px-5 sm:px-10 py-6">
        <div className="w-full max-w-md space-y-5">
          {/* Bespoke Inline SVG Title Lockup */}
          <div className="space-y-3">
            <svg
              viewBox="0 0 360 112"
              className="w-full max-w-[340px] h-auto overflow-visible"
              role="img"
              aria-label="Gebeta ገበጣ"
            >
              <g transform="translate(2, 10)">
                <rect
                  x="0"
                  y="0"
                  width="92"
                  height="42"
                  rx="12"
                  fill="#2C1B10"
                  stroke="var(--accent)"
                  strokeWidth="2"
                />
                <circle cx="20" cy="14" r="4.5" fill="var(--accent)" />
                <circle cx="38" cy="14" r="4.5" fill="#E7D7BC" />
                <circle cx="56" cy="14" r="4.5" fill="var(--accent)" />
                <circle cx="74" cy="14" r="4.5" fill="#E7D7BC" />
                <circle cx="20" cy="28" r="4.5" fill="#E7D7BC" />
                <circle cx="38" cy="28" r="4.5" fill="var(--accent)" />
                <circle cx="56" cy="28" r="4.5" fill="#E7D7BC" />
                <circle cx="74" cy="28" r="4.5" fill="var(--accent)" />
              </g>
              <text
                x="2"
                y="94"
                fill="#FFF4E0"
                fontSize="50"
                fontWeight="700"
                fontFamily="var(--font-display)"
                letterSpacing="-0.02em"
              >
                {language === 'en' ? 'Gebeta' : 'ገበጣ'}
              </text>
              {language === 'en' && (
                <text
                  x="200"
                  y="92"
                  fill="var(--accent)"
                  fontSize="34"
                  fontWeight="600"
                  fontFamily="Noto Sans Ethiopic, serif"
                >
                  ገበጣ
                </text>
              )}
            </svg>

            <p className="text-sm sm:text-base text-[#DFCBB0] leading-relaxed max-w-[40ch]">
              {t.gameSubtitle}
            </p>
          </div>

          {/* Match Setup: Mode & AI Difficulty */}
          <div className="space-y-3.5 bg-[#1D130C]/92 accent-border border rounded-xl p-4">
            <div className="space-y-1.5">
              <span className="block text-xs font-medium text-[#C5AF91]">
                {t.modeLabel}
              </span>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-[#120B07]">
                <button
                  type="button"
                  onClick={() => onChangeMode('ai')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 min-h-[40px] text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    mode === 'ai'
                      ? 'bg-[#3C2618] text-[#FFF4E0] accent-border border'
                      : 'text-[#B8A286] hover:text-[#F5EDE0]'
                  }`}
                >
                  <Cpu className="w-4 h-4 shrink-0" />
                  <span>{t.modeAI}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeMode('local')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 min-h-[40px] text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    mode === 'local'
                      ? 'bg-[#3C2618] text-[#FFF4E0] accent-border border'
                      : 'text-[#B8A286] hover:text-[#F5EDE0]'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span>{t.modeLocal}</span>
                </button>
              </div>
            </div>

            {mode === 'ai' && (
              <div className="space-y-1.5">
                <span className="block text-xs font-medium text-[#C5AF91]">
                  {t.difficultyLabel}
                </span>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-[#120B07]">
                  {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((lvl) => {
                    const active = difficulty === lvl;
                    const label =
                      lvl === 'easy'
                        ? t.difficultyEasy
                        : lvl === 'medium'
                          ? t.difficultyMedium
                          : t.difficultyHard;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => onChangeDifficulty(lvl)}
                        className={`px-2.5 py-2 min-h-[38px] text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-[#3C2618] accent-text accent-border border'
                            : 'text-[#B8A286] hover:text-[#F5EDE0]'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Primary Start CTA + Optional Resume + About */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-start="true"
              onClick={(e) => {
                e.currentTarget.blur();
                onStart();
              }}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3 min-h-[48px] rounded-lg accent-bg active:scale-[0.98] font-semibold text-base transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-lg shadow-black/40"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t.startGame}</span>
            </button>

            {hasActiveMatch && (
              <button
                type="button"
                onClick={onResumeMatch}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-lg bg-[#231710]/92 hover:bg-[#322117] accent-border border text-[#F5EDE0] font-medium text-sm sm:text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>{t.resumeMatch}</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Safe Margin: Single-line hint + DH Solutions Copyright */}
      <div className="relative z-10 px-5 sm:px-10 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-[#B8A286]">
        <p className="tracking-wide">{t.titleHint}</p>
        <p className="text-[#9E886D] whitespace-nowrap">
          {t.developerCredit} · {t.copyrightText}
        </p>
      </div>
    </div>
  );
};
