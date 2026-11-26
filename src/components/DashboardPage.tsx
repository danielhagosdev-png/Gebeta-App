import React, { useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Play,
  Settings,
  Share2,
  Trash2,
} from 'lucide-react';
import type { MatchRecord } from '../game/types';
import {
  computeDashboardSummary,
  filterMatchHistory,
  type DashboardFilter,
} from '../game/stats';
import { getDifficultyLabel, type TranslationDict } from '../game/i18n';

type DashboardPageProps = {
  t: TranslationDict;
  history: MatchRecord[];
  onClearHistory: () => void;
  onBack: () => void;
  onPlay: () => void;
  onOpenSettings: () => void;
  onOpenShare: (summaryText: string) => void;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  t,
  history,
  onClearHistory,
  onBack,
  onPlay,
  onOpenSettings,
  onOpenShare,
}) => {
  const [filter, setFilter] = useState<DashboardFilter>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const summary = computeDashboardSummary(history);
  const filtered = filterMatchHistory(history, filter);
  const recentForChart = filtered.slice(0, 10).reverse();

  const shareSummaryText =
    summary.totalMatches > 0
      ? `${t.gameName} — ${summary.wins}/${summary.totalMatches} (${summary.winRatePct}%), ${t.dashBestScore}: ${summary.bestScore}. ${t.shareMessageInvite}`
      : t.shareMessageInvite;

  return (
    <div className="min-h-screen w-full bg-[#160F0A] text-[#F5EDE0] flex flex-col">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto px-5 sm:px-8 pt-6 pb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#D4A035]/15">
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
            onClick={() => onOpenShare(shareSummaryText)}
            className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-lg bg-[#231710] hover:bg-[#322117] border border-[#D4A035]/20 text-sm font-medium text-[#E8D7BE] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Share2 className="w-4 h-4 accent-text" />
            <span>{t.shareButton}</span>
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

      <main className="flex-1 w-full max-w-5xl mx-auto px-5 sm:px-8 py-8 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-medium accent-text">
              <BarChart3 className="w-4 h-4" />
              <span>{t.gameName}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#FFF4E0]">
              {t.dashboardTitle}
            </h1>
            <p className="text-sm sm:text-base text-[#CBB597]">
              {t.dashboardSubtitle}
            </p>
          </div>

          {history.length > 0 && (
            <div className="flex items-center gap-2">
              {!confirmClear ? (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-lg bg-[#231710] hover:bg-[#322117] border border-[#D4A035]/20 text-xs font-medium text-[#DFCBB0] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.dashClearHistory}</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onClearHistory();
                      setConfirmClear(false);
                    }}
                    className="px-3.5 py-2 min-h-[38px] rounded-lg bg-[#B9382C] hover:bg-[#CC4235] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {t.dashConfirmClear}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-3.5 py-2 min-h-[38px] rounded-lg bg-[#231710] border border-[#D4A035]/20 text-xs font-medium text-[#DFCBB0] cursor-pointer"
                  >
                    {t.dashCancelClear}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 4-Column Tabular KPI Strip */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl bg-[#1E140D] border border-[#D4A035]/20 p-4 space-y-1">
            <div className="text-xs text-[#C5AF91]">{t.dashMatchesPlayed}</div>
            <div
              data-testid="dash-total-matches"
              className="text-3xl font-display font-bold tabular-nums text-[#FFF4E0]"
            >
              {summary.totalMatches}
            </div>
            <div className="text-xs text-[#9E886D] tabular-nums">
              {summary.wins}W · {summary.draws}D · {summary.losses}L
            </div>
          </div>

          <div className="rounded-xl bg-[#1E140D] border border-[#D4A035]/20 p-4 space-y-1">
            <div className="text-xs text-[#C5AF91]">{t.dashWinRate}</div>
            <div className="text-3xl font-display font-bold tabular-nums accent-text">
              {summary.winRatePct}%
            </div>
            <div className="text-xs text-[#9E886D] tabular-nums">
              {summary.wins} / {summary.totalMatches}
            </div>
          </div>

          <div className="rounded-xl bg-[#1E140D] border border-[#D4A035]/20 p-4 space-y-1">
            <div className="text-xs text-[#C5AF91]">{t.dashBestScore}</div>
            <div className="text-3xl font-display font-bold tabular-nums text-[#FFF4E0]">
              {summary.bestScore}
            </div>
            <div className="text-xs text-[#9E886D] tabular-nums">
              {t.dashAvgLabel}: {summary.avgScore} {t.stonesWord}
            </div>
          </div>

          <div className="rounded-xl bg-[#1E140D] border border-[#D4A035]/20 p-4 space-y-1">
            <div className="text-xs text-[#C5AF91]">{t.dashWinStreak}</div>
            <div className="text-3xl font-display font-bold tabular-nums text-[#FFF4E0]">
              {summary.currentStreak}
            </div>
            <div className="text-xs text-[#9E886D] tabular-nums">
              {t.dashBestStreakLabel}: {summary.bestStreak}
            </div>
          </div>
        </section>

        {history.length === 0 ? (
          /* Clean Empty State */
          <section
            data-testid="dash-empty-state"
            className="rounded-2xl bg-[#1E140D] border border-[#D4A035]/20 p-8 sm:p-10 text-center space-y-4"
          >
            <h2 className="text-xl font-display font-bold text-[#FFF4E0]">
              {t.dashEmptyTitle}
            </h2>
            <p className="text-sm text-[#CBB597] max-w-md mx-auto leading-relaxed">
              {t.dashEmptyBody}
            </p>
            <div>
              <button
                type="button"
                onClick={onPlay}
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-lg accent-bg font-semibold text-sm transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{t.dashPlayFirst}</span>
              </button>
            </div>
          </section>
        ) : (
          <div className="space-y-6">
            {/* Filter Segmented Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-[#FFF4E0]">
                {t.dashHistoryTitle}
              </h2>
              <div
                className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#1E140D] border border-[#D4A035]/20"
                role="group"
                aria-label={t.dashHistoryTitle}
              >
                {(
                  [
                    { id: 'all', label: t.dashFilterAll },
                    { id: 'ai', label: t.modeAI },
                    { id: 'local', label: t.modeLocal },
                    { id: 'wins', label: t.dashFilterWins },
                  ] as { id: DashboardFilter; label: string }[]
                ).map((tab) => {
                  const active = filter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilter(tab.id)}
                      className={`px-3 py-1.5 min-h-[34px] text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        active
                          ? 'accent-bg'
                          : 'text-[#CBB597] hover:text-[#FFF4E0]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Match Scores Bar Chart */}
            {recentForChart.length > 0 && (
              <section className="rounded-2xl bg-[#1E140D] border border-[#D4A035]/20 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#C5AF91]">
                  <span className="font-semibold text-[#FFF4E0]">
                    {t.dashRecentChartTitle}
                  </span>
                  <span>
                    {t.playerLabel} vs {t.aiLabel} / {t.player2Label}
                  </span>
                </div>
                <div className="w-full h-36 flex items-end gap-2 sm:gap-3 pt-4 border-b border-[#D4A035]/15">
                  {recentForChart.map((m) => {
                    const pHeight = Math.max(8, Math.round((m.playerScore / 48) * 100));
                    const oHeight = Math.max(8, Math.round((m.opponentScore / 48) * 100));
                    return (
                      <div
                        key={m.id}
                        className="flex-1 h-full flex flex-col justify-end items-center gap-1 min-w-[24px]"
                      >
                        <div className="w-full h-full flex items-end justify-center gap-1">
                          <div
                            className="w-3 sm:w-4 rounded-t accent-bg"
                            style={{ height: `${pHeight}%` }}
                            title={`${t.playerLabel}: ${m.playerScore}`}
                          />
                          <div
                            className="w-3 sm:w-4 rounded-t bg-[#5E4A38]"
                            style={{ height: `${oHeight}%` }}
                            title={`${t.aiLabel}: ${m.opponentScore}`}
                          />
                        </div>
                        <span className="text-[10px] font-mono-nums text-[#C5AF91]">
                          {m.playerScore}:{m.opponentScore}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Match Ledger Table */}
            <section className="rounded-2xl bg-[#1E140D] border border-[#D4A035]/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#D4A035]/15 text-[#C5AF91]">
                      <th className="py-3 px-4 font-medium">{t.dashColDate}</th>
                      <th className="py-3 px-4 font-medium">{t.dashColMode}</th>
                      <th className="py-3 px-4 font-medium text-right">{t.dashColScore}</th>
                      <th className="py-3 px-4 font-medium text-right">{t.dashColTurns}</th>
                      <th className="py-3 px-4 font-medium text-right">{t.dashColResult}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m) => {
                      const dateStr = new Date(m.playedAt).toLocaleDateString(
                        undefined,
                        { month: 'short', day: 'numeric' },
                      );
                      const modeText =
                        m.mode === 'ai'
                          ? `${t.modeAI} (${getDifficultyLabel(t, m.difficulty)})`
                          : t.modeLocal;
                      const outcomeText =
                        m.winner === 'player'
                          ? t.dashOutcomeWin
                          : m.winner === 'opponent'
                            ? t.dashOutcomeLoss
                            : t.dashOutcomeDraw;
                      const outcomeClass =
                        m.winner === 'player'
                          ? 'text-[#36A374]'
                          : m.winner === 'opponent'
                            ? 'text-[#D86741]'
                            : 'text-[#CBB597]';

                      return (
                        <tr
                          key={m.id}
                          className="border-b border-[#D4A035]/10 last:border-b-0 hover:bg-[#261910] transition-colors"
                        >
                          <td className="py-2.5 px-4 text-[#CBB597] whitespace-nowrap">
                            {dateStr}
                          </td>
                          <td className="py-2.5 px-4 text-[#F5EDE0] whitespace-nowrap">
                            {modeText}
                          </td>
                          <td className="py-2.5 px-4 font-mono-nums font-semibold text-right text-[#FFF4E0] whitespace-nowrap">
                            {m.playerScore} : {m.opponentScore}
                          </td>
                          <td className="py-2.5 px-4 font-mono-nums text-right text-[#CBB597] whitespace-nowrap">
                            {m.turns}
                          </td>
                          <td
                            className={`py-2.5 px-4 font-semibold text-right whitespace-nowrap ${outcomeClass}`}
                          >
                            {outcomeText}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="w-full max-w-5xl mx-auto px-5 sm:px-8 py-5 border-t border-[#D4A035]/15 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#9E886D]">
        <span>{t.developerCredit}</span>
        <span>{t.copyrightText}</span>
      </footer>
    </div>
  );
};
