import React from 'react';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Camera,
  Palette,
  Play,
  RotateCcw,
  Type,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type {
  AccentPalette,
  AnimationSpeed,
  AppSettings,
  BoardTheme,
  CameraPreset,
  FontChoice,
  Language,
} from '../game/types';
import {
  getAccentLabel,
  getFontLabel,
  getSpeedLabel,
  getThemeLabel,
  type TranslationDict,
} from '../game/i18n';

type SettingsPageProps = {
  t: TranslationDict;
  settings: AppSettings;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onResetDefaults: () => void;
  onBack: () => void;
  onPlay: () => void;
  onOpenAbout: () => void;
  onOpenDashboard: () => void;
};

const ACCENT_SWATCHES: Record<AccentPalette, string> = {
  gold: '#D4A035',
  terracotta: '#D86741',
  emerald: '#36A374',
  cobalt: '#558DE3',
};

const THEME_SWATCHES: Record<BoardTheme, string> = {
  wanza: '#4B2D1A',
  basalt: '#2C2F35',
  acacia: '#7A4C24',
};

export const SettingsPage: React.FC<SettingsPageProps> = ({
  t,
  settings,
  onUpdateSettings,
  onResetDefaults,
  onBack,
  onPlay,
  onOpenAbout,
  onOpenDashboard,
}) => {
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
            onClick={onOpenAbout}
            className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-lg bg-[#231710] hover:bg-[#322117] border border-[#D4A035]/20 text-sm font-medium text-[#E8D7BE] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 accent-text" />
            <span className="hidden sm:inline">{t.navAbout}</span>
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

      <main className="flex-1 w-full max-w-5xl mx-auto px-5 sm:px-8 py-8 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#FFF4E0]">
              {t.settingsTitle}
            </h1>
            <p className="text-sm sm:text-base text-[#CBB597]">
              {t.settingsSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onResetDefaults}
            className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[38px] rounded-lg bg-[#231710] hover:bg-[#322117] border border-[#D4A035]/20 text-xs font-medium text-[#DFCBB0] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetSettings}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Board Material Theme */}
          <section className="rounded-2xl bg-[#1E140D] border border-[#D4A035]/20 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#FFF4E0]">
              <Palette className="w-4 h-4 accent-text" />
              <h2>{t.boardThemeLabel}</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['wanza', 'basalt', 'acacia'] as BoardTheme[]).map((opt) => {
                const active = settings.theme === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onUpdateSettings({ theme: opt })}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#2C1D13] accent-border accent-text'
                        : 'bg-[#140D08] border-[#3B281B] text-[#CBB597] hover:text-[#FFF4E0]'
                    }`}
                  >
                    <span
                      className="w-7 h-7 rounded-full border border-white/20"
                      style={{ backgroundColor: THEME_SWATCHES[opt] }}
                    />
                    <span className="text-center">{getThemeLabel(t, opt)}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Accent Color Palette */}
          <section className="rounded-2xl bg-[#1E140D] border border-[#D4A035]/20 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#FFF4E0]">
              <Palette className="w-4 h-4 accent-text" />
              <h2>{t.accentLabel}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['gold', 'terracotta', 'emerald', 'cobalt'] as AccentPalette[]).map(
                (opt) => {
                  const active = settings.accent === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onUpdateSettings({ accent: opt })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#2C1D13] accent-border text-[#FFF4E0]'
                          : 'bg-[#140D08] border-[#3B281B] text-[#CBB597] hover:text-[#FFF4E0]'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-white/25"
                        style={{ backgroundColor: ACCENT_SWATCHES[opt] }}
                      />
                      <span className="text-center">{getAccentLabel(t, opt)}</span>
                    </button>
                  );
                },
              )}
            </div>
          </section>

          {/* Typography / Font Choice */}
          <section className="rounded-2xl bg-[#1E140D] border border-[#D4A035]/20 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#FFF4E0]">
              <Type className="w-4 h-4 accent-text" />
              <h2>{t.fontLabel}</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['editorial', 'modern', 'geometric'] as FontChoice[]).map((opt) => {
                const active = settings.font === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onUpdateSettings({ font: opt })}
                    className={`p-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#2C1D13] accent-border accent-text'
                        : 'bg-[#140D08] border-[#3B281B] text-[#CBB597] hover:text-[#FFF4E0]'
                    }`}
                  >
                    {getFontLabel(t, opt)}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Language Selection */}
          <section className="rounded-2xl bg-[#1E140D] border border-[#D4A035]/20 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#FFF4E0]">
              <span>{t.languageLabel}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['en', 'ti', 'am'] as Language[]).map((lang) => {
                const active = settings.language === lang;
                const label =
                  lang === 'en' ? 'English' : lang === 'ti' ? 'ትግርኛ' : 'አማርኛ';
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => onUpdateSettings({ language: lang })}
                    className={`p-3 min-h-[44px] rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                      active
                        ? 'accent-bg border-transparent'
                        : 'bg-[#140D08] border-[#3B281B] text-[#CBB597] hover:text-[#FFF4E0]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3D Camera Angle & Sowing Speed */}
          <section className="rounded-2xl bg-[#1E140D] border border-[#D4A035]/20 p-5 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#FFF4E0]">
                <Camera className="w-4 h-4 accent-text" />
                <h2>{t.cameraLabel}</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['angled', 'topdown'] as CameraPreset[]).map((preset) => {
                  const active = settings.cameraPreset === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onUpdateSettings({ cameraPreset: preset })}
                      className={`px-3 py-2.5 min-h-[42px] rounded-xl border text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#2C1D13] accent-border accent-text'
                          : 'bg-[#140D08] border-[#3B281B] text-[#CBB597] hover:text-[#FFF4E0]'
                      }`}
                    >
                      {preset === 'angled' ? t.cameraAngled : t.cameraTopDown}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-medium text-[#C5AF91]">{t.speedLabel}</h3>
              <div className="grid grid-cols-3 gap-2">
                {(['brisk', 'classic', 'measured'] as AnimationSpeed[]).map((spd) => {
                  const active = settings.speed === spd;
                  return (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => onUpdateSettings({ speed: spd })}
                      className={`px-2 py-2 min-h-[38px] rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#2C1D13] accent-border accent-text'
                          : 'bg-[#140D08] border-[#3B281B] text-[#CBB597] hover:text-[#FFF4E0]'
                      }`}
                    >
                      {getSpeedLabel(t, spd)}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Audio & Developer Attribution Card */}
          <section className="rounded-2xl bg-[#1E140D] border border-[#D4A035]/20 p-5 flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#FFF4E0]">
                {settings.muted ? (
                  <VolumeX className="w-4 h-4 accent-text" />
                ) : (
                  <Volume2 className="w-4 h-4 accent-text" />
                )}
                <h2>{t.soundLabel}</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ muted: false })}
                  className={`px-3 py-2.5 min-h-[42px] rounded-xl border text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    !settings.muted
                      ? 'bg-[#2C1D13] accent-border accent-text'
                      : 'bg-[#140D08] border-[#3B281B] text-[#CBB597] hover:text-[#FFF4E0]'
                  }`}
                >
                  {t.soundOn}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ muted: true })}
                  className={`px-3 py-2.5 min-h-[42px] rounded-xl border text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    settings.muted
                      ? 'bg-[#2C1D13] accent-border accent-text'
                      : 'bg-[#140D08] border-[#3B281B] text-[#CBB597] hover:text-[#FFF4E0]'
                  }`}
                >
                  {t.soundOff}
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-[#140D08] border border-[#D4A035]/15 p-4 space-y-1">
              <div className="text-sm font-display font-bold accent-text">
                DH Solutions
              </div>
              <div className="text-xs text-[#CBB597]">{t.developerCredit}</div>
              <div className="text-xs text-[#8E795F]">{t.copyrightText}</div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
