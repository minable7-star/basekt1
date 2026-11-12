import { Pencil } from 'lucide-react';
import { TeamId } from '../types/scoreboard';
import { ShuttlecockIcon } from './ShuttlecockIcon';

interface TeamPanelProps {
  teamId: TeamId;
  name: string;
  score: number;
  setsWon: number;
  isServing: boolean;
  isSetPoint: boolean;
  isMatchPoint: boolean;
  canIncrement: boolean;
  canDecrement: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onSelectServe: () => void;
  onEditName: () => void;
}

export function TeamPanel({
  teamId,
  name,
  score,
  setsWon,
  isServing,
  isSetPoint,
  isMatchPoint,
  canIncrement,
  canDecrement,
  onIncrement,
  onDecrement,
  onSelectServe,
  onEditName,
}: TeamPanelProps) {
  const isTeamA = teamId === 'A';

  const panelBg = isTeamA
    ? isServing
      ? 'bg-[#0F1E36] border-blue-500/70'
      : 'bg-[#0D141F] border-slate-800/90'
    : isServing
      ? 'bg-[#2B101C] border-rose-500/70'
      : 'bg-[#170F14] border-slate-800/90';

  const accentText = isTeamA ? 'text-blue-400' : 'text-rose-400';
  const setSquareActive = isTeamA ? 'bg-blue-500 border-blue-400' : 'bg-rose-500 border-rose-400';

  const plusBtnClass = isTeamA
    ? 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg shadow-blue-950/50'
    : 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-lg shadow-rose-950/50';

  return (
    <section
      aria-label={`${name} 점수 패널`}
      className={`relative flex flex-col justify-between rounded-2xl border-2 p-3.5 sm:p-5 lg:p-6 transition-colors duration-150 min-h-0 flex-1 ${panelBg}`}
    >
      {/* Top Row: Team Name + Set Wins + Serve Toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onEditName}
            className="group flex items-center gap-2 min-h-[44px] px-2 -ml-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            title="팀 이름 수정"
          >
            <span
              className={`inline-block w-2.5 h-6 rounded-sm shrink-0 ${
                isTeamA ? 'bg-blue-500' : 'bg-rose-500'
              }`}
              aria-hidden="true"
            />
            <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white truncate">
              {name}
            </span>
            <Pencil
              className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-white shrink-0 transition-colors"
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Set Wins Counter (Best of 3 -> 2 wins needed) */}
          <div
            className="flex items-center gap-1.5"
            aria-label={`획득 세트 ${setsWon}승`}
          >
            {[0, 1].map((idx) => (
              <span
                key={idx}
                className={`w-3.5 h-5 sm:w-4 sm:h-6 rounded-sm border transition-colors ${
                  idx < setsWon
                    ? setSquareActive
                    : 'bg-slate-900/80 border-slate-700'
                }`}
              />
            ))}
            <span className={`ml-1 text-base sm:text-lg font-extrabold tabular-nums ${accentText}`}>
              {setsWon}승
            </span>
          </div>

          {/* Serve Indicator Button */}
          <button
            type="button"
            onClick={onSelectServe}
            aria-pressed={isServing}
            className={`flex items-center gap-1.5 min-h-[44px] px-3 sm:px-3.5 rounded-xl font-extrabold text-sm sm:text-base transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
              isServing
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={isServing ? '현재 서브권 보유' : '눌러서 서브권 가져오기'}
          >
            <ShuttlecockIcon className="w-5 h-5 shrink-0" />
            <span>{isServing ? '서브' : '서브 전환'}</span>
          </button>
        </div>
      </div>

      {/* Center: Massive Gym-Legible Score */}
      <div className="flex-1 flex flex-col items-center justify-center py-1 sm:py-3 select-none min-h-0">
        <div
          className="font-score font-extrabold text-[clamp(5.5rem,18vh,12rem)] md:text-[clamp(6rem,min(24vh,18vw),13rem)] leading-[0.86] tracking-tight text-white drop-shadow-sm"
          aria-live="polite"
          aria-atomic="true"
        >
          {score}
        </div>

        {(isMatchPoint || isSetPoint) && (
          <div className="mt-1 text-sm sm:text-base font-extrabold tracking-wide text-amber-300">
            {isMatchPoint ? '매치 포인트' : '세트 포인트'}
          </div>
        )}
      </div>

      {/* Bottom Row: Large +1 / -1 Thumb Buttons */}
      <div className="flex items-stretch gap-2.5 sm:gap-3.5">
        <button
          type="button"
          onClick={onDecrement}
          disabled={!canDecrement}
          aria-label={`${name} 1점 빼기`}
          className="w-[30%] min-w-[84px] min-h-[64px] sm:min-h-[78px] lg:min-h-[88px] rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 active:scale-[0.97] disabled:opacity-35 disabled:pointer-events-none text-slate-100 font-extrabold text-2xl sm:text-3xl transition-all duration-100 flex items-center justify-center border border-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        >
          −1
        </button>

        <button
          type="button"
          onClick={onIncrement}
          disabled={!canIncrement}
          aria-label={`${name} 1점 추가`}
          className={`flex-1 min-h-[64px] sm:min-h-[78px] lg:min-h-[88px] rounded-xl font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight transition-all duration-100 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${plusBtnClass}`}
        >
          +1
        </button>
      </div>
    </section>
  );
}
