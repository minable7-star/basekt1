export type TeamId = 'A' | 'B';

export interface SetRecord {
  setNumber: number;
  scoreA: number;
  scoreB: number;
  winner: TeamId;
}

export interface RallyEntry {
  scorer: TeamId;
  previousServer: TeamId;
}

export interface MatchState {
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  setsA: number;
  setsB: number;
  currentSet: number;
  server: TeamId;
  swappedSides: boolean;
  completedSets: SetRecord[];
  rallyHistory: RallyEntry[];
  lastSetWinner: TeamId | null;
  matchWinner: TeamId | null;
  alertDismissed: boolean;
  soundEnabled: boolean;
}

export const DEFAULT_MATCH_STATE: MatchState = {
  teamAName: '청팀',
  teamBName: '홍팀',
  scoreA: 0,
  scoreB: 0,
  setsA: 0,
  setsB: 0,
  currentSet: 1,
  server: 'A',
  swappedSides: false,
  completedSets: [],
  rallyHistory: [],
  lastSetWinner: null,
  matchWinner: null,
  alertDismissed: false,
  soundEnabled: true,
};

/**
 * Official 21-point rally scoring rules:
 * - Win at 21+ with at least a 2-point lead.
 * - At 20:20 (deuce), play continues until a 2-point lead.
 * - Capped at 30: first to 30 wins immediately (e.g., 30:29).
 */
export function getSetWinner(scoreA: number, scoreB: number): TeamId | null {
  if (scoreA >= 30) return 'A';
  if (scoreB >= 30) return 'B';
  if (scoreA >= 21 && scoreA - scoreB >= 2) return 'A';
  if (scoreB >= 21 && scoreB - scoreA >= 2) return 'B';
  return null;
}

export function isDeuce(scoreA: number, scoreB: number): boolean {
  return scoreA >= 20 && scoreB >= 20;
}

export function isSetPointFor(
  team: TeamId,
  scoreA: number,
  scoreB: number
): boolean {
  if (getSetWinner(scoreA, scoreB) !== null) return false;
  if (team === 'A') {
    return getSetWinner(scoreA + 1, scoreB) === 'A';
  }
  return getSetWinner(scoreA, scoreB + 1) === 'B';
}

export function getLiveStatusInfo(state: MatchState): {
  label: string;
  emphasis: 'normal' | 'deuce' | 'setpoint' | 'interval' | 'finished';
} {
  const { scoreA, scoreB, setsA, setsB, currentSet, lastSetWinner, matchWinner } = state;

  if (matchWinner) {
    return { label: '경기 종료 · 3세트 2선승 확정', emphasis: 'finished' };
  }
  if (lastSetWinner) {
    return { label: `${currentSet}세트 종료`, emphasis: 'finished' };
  }
  if (scoreA === 29 && scoreB === 29) {
    return { label: '29:29 · 30점 마지막 결승점', emphasis: 'setpoint' };
  }

  const aSetPt = isSetPointFor('A', scoreA, scoreB);
  const bSetPt = isSetPointFor('B', scoreA, scoreB);

  if (aSetPt || bSetPt) {
    const aMatchPt = aSetPt && setsA === 1;
    const bMatchPt = bSetPt && setsB === 1;
    const prefix = isDeuce(scoreA, scoreB) ? '듀스 · ' : '';
    if (aMatchPt || bMatchPt) {
      return { label: `${prefix}매치 포인트`, emphasis: 'setpoint' };
    }
    return { label: `${prefix}세트 포인트`, emphasis: 'setpoint' };
  }

  if (isDeuce(scoreA, scoreB)) {
    return {
      label:
        scoreA === scoreB
          ? '듀스 · 2점 차 승부 (30점 상한)'
          : '듀스 진행 중 · 2점 차 필요',
      emphasis: 'deuce',
    };
  }

  if (currentSet === 3 && Math.max(scoreA, scoreB) === 11 && Math.min(scoreA, scoreB) < 11) {
    return { label: '3세트 11점 도달 · 코트 교대 시점', emphasis: 'interval' };
  }

  return { label: '21점제 · 3세트 2선승', emphasis: 'normal' };
}
