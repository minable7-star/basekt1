interface ResetConfirmModalProps {
  isOpen: boolean;
  onConfirmResetScoresOnly: () => void;
  onConfirmFullReset: () => void;
  onCancel: () => void;
}

export function ResetConfirmModal({
  isOpen,
  onConfirmResetScoresOnly,
  onConfirmFullReset,
  onCancel,
}: ResetConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
    >
      <div className="w-full max-w-sm rounded-2xl bg-[#111822] border-2 border-slate-700 p-6 shadow-2xl">
        <h2
          id="reset-modal-title"
          className="text-xl font-black text-white text-center"
        >
          경기를 초기화할까요?
        </h2>
        <p className="mt-2 text-sm text-slate-300 text-center">
          현재 진행 중인 점수와 세트 기록이 초기화됩니다.
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onConfirmResetScoresOnly}
            className="w-full min-h-[52px] px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-base transition-colors whitespace-nowrap"
          >
            점수만 초기화 (팀 이름 유지)
          </button>
          <button
            type="button"
            onClick={onConfirmFullReset}
            className="w-full min-h-[48px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-colors whitespace-nowrap"
          >
            팀 이름까지 모두 초기화
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full min-h-[48px] px-4 rounded-xl border border-slate-700 hover:bg-slate-800/70 text-slate-300 font-bold text-sm transition-colors whitespace-nowrap"
          >
            계속 진행하기
          </button>
        </div>
      </div>
    </div>
  );
}
