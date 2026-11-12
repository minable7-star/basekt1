import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface TeamNameModalProps {
  isOpen: boolean;
  initialTeamA: string;
  initialTeamB: string;
  onSave: (teamA: string, teamB: string) => void;
  onClose: () => void;
}

export function TeamNameModal({
  isOpen,
  initialTeamA,
  initialTeamB,
  onSave,
  onClose,
}: TeamNameModalProps) {
  const [nameA, setNameA] = useState(initialTeamA);
  const [nameB, setNameB] = useState(initialTeamB);

  useEffect(() => {
    if (isOpen) {
      setNameA(initialTeamA);
      setNameB(initialTeamB);
    }
  }, [isOpen, initialTeamA, initialTeamB]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(nameA.trim() || '청팀', nameB.trim() || '홍팀');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-name-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#111822] border-2 border-slate-700 p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2
            id="team-name-modal-title"
            className="text-xl sm:text-2xl font-black text-white"
          >
            팀 이름 입력
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="team-a-input"
              className="block text-sm font-bold text-blue-400 mb-1.5"
            >
              A팀 (파랑)
            </label>
            <input
              id="team-a-input"
              type="text"
              maxLength={16}
              value={nameA}
              onChange={(e) => setNameA(e.target.value)}
              placeholder="예: 김민수 / 박지훈"
              autoFocus
              className="w-full min-h-[52px] px-4 rounded-xl bg-slate-900 border-2 border-slate-700 focus:border-blue-500 focus:outline-none text-white text-lg font-bold placeholder:text-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="team-b-input"
              className="block text-sm font-bold text-rose-400 mb-1.5"
            >
              B팀 (빨강)
            </label>
            <input
              id="team-b-input"
              type="text"
              maxLength={16}
              value={nameB}
              onChange={(e) => setNameB(e.target.value)}
              placeholder="예: 이서준 / 최우성"
              className="w-full min-h-[52px] px-4 rounded-xl bg-slate-900 border-2 border-slate-700 focus:border-rose-500 focus:outline-none text-white text-lg font-bold placeholder:text-slate-500"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[52px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-base transition-colors whitespace-nowrap"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[52px] px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-base transition-colors whitespace-nowrap"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
