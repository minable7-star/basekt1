import { ArrowLeftRight, RotateCcw, Trophy, Undo2 } from 'lucide-react';
import { SetRecord, TeamId } from '../types/scoreboard';

interface MatchAlertModalProps {
  isOpen: boolean;
  isMatchOver: boolean;
  winnerId: TeamId | null;
  winnerName: string;
  currentSet: number;
  scoreA: number;
  scoreB: number;
  setsA: number;
  setsB: number;
  teamAName: string;
  teamBName: string;
  completedSets: SetRecord[];
  onStartNextSet: (swapSides: boolean) => void;
  onUndoLastPoint: () => void;
  onResetMatch: () => void;
  onDismiss: () => void;
}

export function MatchAlertModal({
  isOpen,
  isMatchOver,
  winnerId,
  winnerName,
  currentSet,
  scoreA,
  scoreB,
  setsA,
  setsB,
  teamAName,
  teamBName,
  completedSets,
  onStartNextSet,
  onUndoLastPoint,
  onResetMatch,
  onDismiss,
}: MatchAlertModalProps) {
  if (!isOpen || !winnerId) return null;

  const isTeamA = winnerId === 'A';
  const accentText = isTeamA ? 'text-blue-400' : 'text-rose-400';
  const accentBg = isTeamA
    ? 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700'
    : 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="set-alert-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#111822] border-2 border-slate-700 p-6 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-center gap-2 text-amber-400 mb-2">
          <Trophy className="w-7 h-7" aria-hidden="true" />
          <span className="text-lg sm:text-xl font-extrabold tracking-tight">
            {isMatchOver ? '경기 종료 · 최종 승리' : `${currentSet}세트 종료`}
          </span>
        </div>

        <h2
          id="set-alert-title"
          className={`text-center text-3xl sm:text-4xl font-black tracking-tight break-keep ${accentText}`}
        >
          {winnerName} 승리!
        </h2>

        {/* Current Set Final Score */}
        <div className="mt-4 py-4 px-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
          <div className="text-sm font-bold text-slate-400">
            {isMatchOver ? '최종 세트 스코어' : `${currentSet}세트 점수`}
          </div>
          {isMatchOver ? (
            <div className="mt-1 font-score text-6xl font-extrabold text-white tabular-nums">
              {setsA} : {setsB}
            </div>
          ) : (
            <div className="mt-1 font-score text-6xl font-extrabold text-white tabular-nums">
              {scoreA} : {scoreB}
            </div>
          )}
          <div className="mt-2 text-sm font-bold text-slate-300">
            {teamAName} vs {teamBName}
          </div>
        </div>

        {/* Set-by-set Summary */}
        {completedSets.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm sm:text-base font-bold text-slate-300 tabular-nums">
            {completedSets.map((s, index) => (
              <span key={s.setNumber} className="flex items-center gap-2">
                {index > 0 && (
                  <span className="text-slate-600" aria-hidden="true">
                    ·
                  </span>
                )}
                <span>
                  {s.setNumber}세트 {s.scoreA}:{s.scoreB}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          {!isMatchOver ? (
            <>
              <button
                type="button"
                onClick={() => onStartNextSet(true)}
                className={`w-full min-h-[56px] px-5 rounded-xl font-black text-lg sm:text-xl text-white flex items-center justify-center gap-2.5 transition-colors whitespace-nowrap ${accentBg}`}
              >
                <ArrowLeftRight className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>코트 교대 후 {currentSet + 1}세트 시작</span>
              </button>

              <button
                type="button"
                onClick={() => onStartNextSet(false)}
                className="w-full min-h-[50px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-base transition-colors whitespace-nowrap"
              >
                교대 없이 {currentSet + 1}세트 시작
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onResetMatch}
                className={`w-full min-h-[56px] px-5 rounded-xl font-black text-lg sm:text-xl text-white flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${accentBg}`}
              >
                <RotateCcw className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>새 경기 시작</span>
              </button>

              <button
                type="button"
                onClick={onDismiss}
                className="w-full min-h-[50px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-base transition-colors whitespace-nowrap"
              >
                점수판 결과 보기
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onUndoLastPoint}
            className="w-full min-h-[48px] px-4 rounded-xl border border-slate-700 bg-transparent hover:bg-slate-800/70 text-slate-300 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <Undo2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>방금 점수 취소 (−1)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
