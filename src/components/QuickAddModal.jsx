import { X, Zap } from 'lucide-react';
import { fmt } from '../utils';

// 빠른 추가 모달 — 프리셋 목록을 보여주고 즉시 지출 추가
export default function QuickAddModal({ presets, selDate, onClose, onAddPreset }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-gray-900 rounded-t-3xl shadow-2xl animate-slide-up"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 pt-4">
          {/* 드래그 핸들 */}
          <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-5" />

          {/* 헤더 */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold">빠른 추가</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-[11px] text-gray-500 mb-5">
            대상 날짜:{' '}
            <span className="text-violet-400 font-bold">{selDate ?? '오늘'}</span>
          </p>

          {/* 프리셋 목록 */}
          {presets.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm text-gray-600">등록된 프리셋이 없습니다</p>
              <p className="text-xs text-gray-700 mt-1">설정 탭에서 자주 쓰는 항목을 추가해보세요</p>
            </div>
          ) : (
            <div className="space-y-2 pb-2">
              {presets.map(p => (
                <button
                  key={p.id}
                  onClick={() => { onAddPreset(p); onClose(); }}
                  className="w-full flex items-center justify-between p-3.5 bg-gray-800 hover:bg-gray-750 active:scale-[0.98] rounded-xl transition-all border border-transparent hover:border-emerald-800/60"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl leading-none">{p.emoji}</span>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-100">{p.name}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{p.paymentMethod}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-violet-400">₩{fmt(p.amount)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
