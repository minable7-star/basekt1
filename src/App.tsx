import { useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  RotateCcw,
  Trophy,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { MatchAlertModal } from './components/MatchAlertModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { TeamNameModal } from './components/TeamNameModal';
import { TeamPanel } from './components/TeamPanel';
import {
  DEFAULT_MATCH_STATE,
  MatchState,
  TeamId,
  getLiveStatusInfo,
  getSetWinner,
  isSetPointFor,
} from './types/scoreboard';
import { playPointTone, playSetEndChime } from './utils/sound';

const STORAGE_KEY = 'badminton_scoreboard_v1';

function loadInitialState(): MatchState {
  if (typeof window === 'undefined') return DEFAULT_MATCH_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MATCH_STATE;
    const parsed = JSON.parse(raw) as Partial<MatchState>;
    return {
      ...DEFAULT_MATCH_STATE,
      ...parsed,
      completedSets: Array.isArray(parsed.completedSets) ? parsed.completedSets : [],
      rallyHistory: Array.isArray(parsed.rallyHistory) ? parsed.rallyHistory : [],
    };
  } catch {
    return DEFAULT_MATCH_STATE;
  }
}

export default function App() {
  const [state, setState] = useState<MatchState>(loadInitialState);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  const handleIncrement = (team: TeamId) => {
    setState((prev) => {
      if (prev.lastSetWinner !== null || prev.matchWinner !== null) {
        return prev;
      }

      const nextScoreA = team === 'A' ? prev.scoreA + 1 : prev.scoreA;
      const nextScoreB = team === 'B' ? prev.scoreB + 1 : prev.scoreB;
      const winner = getSetWinner(nextScoreA, nextScoreB);

      const nextHistory = [
        ...prev.rallyHistory,
        { scorer: team, previousServer: prev.server },
      ];

      if (winner) {
        const nextSetsA = winner === 'A' ? prev.setsA + 1 : prev.setsA;
        const nextSetsB = winner === 'B' ? prev.setsB + 1 : prev.setsB;
        const nextMatchWinner: TeamId | null =
          nextSetsA >= 2 ? 'A' : nextSetsB >= 2 ? 'B' : null;

        playSetEndChime(prev.soundEnabled, nextMatchWinner !== null);

        return {
          ...prev,
          scoreA: nextScoreA,
          scoreB: nextScoreB,
          setsA: nextSetsA,
          setsB: nextSetsB,
          server: team,
          rallyHistory: nextHistory,
          completedSets: [
            ...prev.completedSets,
            {
              setNumber: prev.currentSet,
              scoreA: nextScoreA,
              scoreB: nextScoreB,
              winner,
            },
          ],
          lastSetWinner: winner,
          matchWinner: nextMatchWinner,
          alertDismissed: false,
        };
      }

      playPointTone(prev.soundEnabled, false);

      return {
        ...prev,
        scoreA: nextScoreA,
        scoreB: nextScoreB,
        server: team,
        rallyHistory: nextHistory,
      };
    });
  };

  const handleDecrement = (team: TeamId) => {
    setState((prev) => {
      const currentScore = team === 'A' ? prev.scoreA : prev.scoreB;
      if (currentScore <= 0) return prev;

      // If set has already ended, only allow undoing the winning team's final point
      if (prev.lastSetWinner !== null && prev.lastSetWinner !== team) {
        return prev;
      }

      playPointTone(prev.soundEnabled, true);

      const nextScoreA = team === 'A' ? prev.scoreA - 1 : prev.scoreA;
      const nextScoreB = team === 'B' ? prev.scoreB - 1 : prev.scoreB;

      let nextServer = prev.server;
      const nextHistory = [...prev.rallyHistory];
      const lastEntry = nextHistory[nextHistory.length - 1];

      if (lastEntry && lastEntry.scorer === team) {
        nextHistory.pop();
        nextServer = lastEntry.previousServer;
      } else {
        // Manual correction if user decremented the team that didn't score the very last point
        for (let i = nextHistory.length - 1; i >= 0; i--) {
          if (nextHistory[i].scorer === team) {
            nextHistory.splice(i, 1);
            break;
          }
        }
      }

      if (prev.lastSetWinner === team) {
        const nextSetsA = team === 'A' ? Math.max(0, prev.setsA - 1) : prev.setsA;
        const nextSetsB = team === 'B' ? Math.max(0, prev.setsB - 1) : prev.setsB;
        const nextCompletedSets = prev.completedSets.filter(
          (s) => s.setNumber !== prev.currentSet
        );

        return {
          ...prev,
          scoreA: nextScoreA,
          scoreB: nextScoreB,
          setsA: nextSetsA,
          setsB: nextSetsB,
          server: nextServer,
          rallyHistory: nextHistory,
          completedSets: nextCompletedSets,
          lastSetWinner: null,
          matchWinner: null,
          alertDismissed: false,
        };
      }

      return {
        ...prev,
        scoreA: nextScoreA,
        scoreB: nextScoreB,
        server: nextServer,
        rallyHistory: nextHistory,
      };
    });
  };

  const handleUndoWinningPointFromModal = () => {
    if (!state.lastSetWinner) return;
    handleDecrement(state.lastSetWinner);
  };

  const handleSelectServe = (team: TeamId) => {
    setState((prev) => ({
      ...prev,
      server: team,
    }));
  };

  const handleSwapSides = () => {
    setState((prev) => ({
      ...prev,
      swappedSides: !prev.swappedSides,
    }));
  };

  const handleToggleSound = () => {
    setState((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  const handleStartNextSet = (swapSides: boolean) => {
    setState((prev) => {
      if (!prev.lastSetWinner || prev.matchWinner) return prev;
      return {
        ...prev,
        currentSet: prev.currentSet + 1,
        scoreA: 0,
        scoreB: 0,
        server: prev.lastSetWinner,
        swappedSides: swapSides ? !prev.swappedSides : prev.swappedSides,
        rallyHistory: [],
        lastSetWinner: null,
        alertDismissed: false,
      };
    });
  };

  const handleResetScoresOnly = () => {
    setState((prev) => ({
      ...DEFAULT_MATCH_STATE,
      teamAName: prev.teamAName,
      teamBName: prev.teamBName,
      soundEnabled: prev.soundEnabled,
    }));
    setIsResetModalOpen(false);
  };

  const handleFullReset = () => {
    setState((prev) => ({
      ...DEFAULT_MATCH_STATE,
      soundEnabled: prev.soundEnabled,
    }));
    setIsResetModalOpen(false);
  };

  const handleResetClick = () => {
    const hasProgress =
      state.scoreA > 0 ||
      state.scoreB > 0 ||
      state.setsA > 0 ||
      state.setsB > 0 ||
      state.currentSet > 1;
    if (hasProgress) {
      setIsResetModalOpen(true);
    } else {
      handleResetScoresOnly();
    }
  };

  const handleSaveTeamNames = (teamA: string, teamB: string) => {
    setState((prev) => ({
      ...prev,
      teamAName: teamA,
      teamBName: teamB,
    }));
  };

  const liveStatus = getLiveStatusInfo(state);
  const aIsSetPt = isSetPointFor('A', state.scoreA, state.scoreB);
  const bIsSetPt = isSetPointFor('B', state.scoreA, state.scoreB);

  const displayOrder: TeamId[] = state.swappedSides ? ['B', 'A'] : ['A', 'B'];

  const winnerId = state.matchWinner ?? state.lastSetWinner;
  const winnerName =
    winnerId === 'A'
      ? state.teamAName
      : winnerId === 'B'
        ? state.teamBName
        : '';

  const statusColorClass =
    liveStatus.emphasis === 'setpoint'
      ? 'text-amber-300'
      : liveStatus.emphasis === 'deuce'
        ? 'text-orange-300'
        : liveStatus.emphasis === 'interval'
          ? 'text-emerald-300'
          : liveStatus.emphasis === 'finished'
            ? 'text-amber-400'
            : 'text-slate-300';

  return (
    <div className="h-[100dvh] min-h-[540px] flex flex-col bg-[#090D12] text-slate-50 overflow-hidden">
      {/* Compact Top Utility Bar */}
      <header className="shrink-0 bg-[#0E141C] border-b border-slate-800/90 px-3 sm:px-5 h-[56px] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <span className="text-base sm:text-lg font-black tracking-tight text-white whitespace-nowrap shrink-0">
            배드민턴
          </span>
          <span className="text-slate-600" aria-hidden="true">
            ·
          </span>
          <span className="text-sm sm:text-base font-extrabold text-amber-400 tabular-nums whitespace-nowrap shrink-0">
            {state.currentSet}세트
          </span>
          <span className="text-slate-600" aria-hidden="true">
            ·
          </span>
          <span className="text-sm sm:text-base font-bold text-slate-300 tabular-nums whitespace-nowrap shrink-0">
            {state.setsA}:{state.setsB}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsTeamModalOpen(true)}
            className="min-h-[44px] px-2.5 sm:px-3 rounded-xl hover:bg-slate-800 active:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            title="팀 이름 입력"
          >
            <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>팀 이름</span>
          </button>

          <button
            type="button"
            onClick={handleSwapSides}
            className="min-h-[44px] px-2.5 sm:px-3 rounded-xl hover:bg-slate-800 active:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            title="좌우/상하 코트 교대"
          >
            <ArrowLeftRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">코트 교대</span>
            <span className="sm:hidden">교대</span>
          </button>

          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={state.soundEnabled ? '효과음 끄기' : '효과음 켜기'}
            title={state.soundEnabled ? '효과음 켜짐' : '효과음 꺼짐'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-slate-800 active:bg-slate-700 text-slate-200 transition-colors shrink-0"
          >
            {state.soundEnabled ? (
              <Volume2 className="w-5 h-5" aria-hidden="true" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={handleResetClick}
            className="min-h-[44px] px-2.5 sm:px-3 rounded-xl hover:bg-slate-800 active:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            title="새 경기 시작"
          >
            <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">새 경기</span>
          </button>
        </div>
      </header>

      {/* Clean Unboxed Status & Set History Strip */}
      <div className="shrink-0 bg-[#0B1016] border-b border-slate-800/70 px-3 sm:px-6 py-1.5 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold">
        <div className={`truncate ${statusColorClass}`}>{liveStatus.label}</div>

        <div className="flex items-center gap-3 shrink-0">
          {state.completedSets.length > 0 && (
            <div className="flex items-center gap-2 text-slate-400 tabular-nums whitespace-nowrap">
              {state.completedSets.map((setItem, idx) => (
                <span key={setItem.setNumber} className="flex items-center gap-2">
                  {idx > 0 && (
                    <span className="text-slate-600" aria-hidden="true">
                      ·
                    </span>
                  )}
                  <span>
                    {setItem.setNumber}세트 {setItem.scoreA}:{setItem.scoreB}
                  </span>
                </span>
              ))}
            </div>
          )}

          {state.lastSetWinner && state.alertDismissed && (
            <button
              type="button"
              onClick={() =>
                setState((prev) => ({ ...prev, alertDismissed: false }))
              }
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-extrabold whitespace-nowrap underline underline-offset-2"
            >
              <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{state.matchWinner ? '결과 창' : '다음 세트'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Scoreboard Arena (Portrait: Stacked, Landscape & Desktop: 2-Column Side-by-Side) */}
      <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 landscape:grid-cols-2 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {displayOrder.map((teamId) => {
          const isA = teamId === 'A';
          const name = isA ? state.teamAName : state.teamBName;
          const score = isA ? state.scoreA : state.scoreB;
          const setsWon = isA ? state.setsA : state.setsB;
          const isServing = state.server === teamId;
          const isSetPt = isA ? aIsSetPt : bIsSetPt;
          const isMatchPt = isSetPt && setsWon === 1;

          const canIncrement =
            state.lastSetWinner === null && state.matchWinner === null;
          const canDecrement =
            score > 0 &&
            (state.lastSetWinner === null || state.lastSetWinner === teamId);

          return (
            <TeamPanel
              key={teamId}
              teamId={teamId}
              name={name}
              score={score}
              setsWon={setsWon}
              isServing={isServing}
              isSetPoint={isSetPt && !isMatchPt}
              isMatchPoint={isMatchPt}
              canIncrement={canIncrement}
              canDecrement={canDecrement}
              onIncrement={() => handleIncrement(teamId)}
              onDecrement={() => handleDecrement(teamId)}
              onSelectServe={() => handleSelectServe(teamId)}
              onEditName={() => setIsTeamModalOpen(true)}
            />
          );
        })}
      </main>

      {/* Modals */}
      <MatchAlertModal
        isOpen={state.lastSetWinner !== null && !state.alertDismissed}
        isMatchOver={state.matchWinner !== null}
        winnerId={winnerId}
        winnerName={winnerName}
        currentSet={state.currentSet}
        scoreA={state.scoreA}
        scoreB={state.scoreB}
        setsA={state.setsA}
        setsB={state.setsB}
        teamAName={state.teamAName}
        teamBName={state.teamBName}
        completedSets={state.completedSets}
        onStartNextSet={handleStartNextSet}
        onUndoLastPoint={handleUndoWinningPointFromModal}
        onResetMatch={handleResetScoresOnly}
        onDismiss={() =>
          setState((prev) => ({ ...prev, alertDismissed: true }))
        }
      />

      <TeamNameModal
        isOpen={isTeamModalOpen}
        initialTeamA={state.teamAName}
        initialTeamB={state.teamBName}
        onSave={handleSaveTeamNames}
        onClose={() => setIsTeamModalOpen(false)}
      />

      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onConfirmResetScoresOnly={handleResetScoresOnly}
        onConfirmFullReset={handleFullReset}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}
