import { X } from 'lucide-react';

// 업데이트 이력:
// - editMode 프롭 추가: true일 때 '지출 편집' 모드로 전환
// - 날짜/카테고리/금액/결제수단 입력 필드 모두 block w-full + boxSizing: 'border-box' 적용
// - 버튼 텍스트를 모드에 따라 '수정하기' / '추가하기' 로 전환
export default function AddExpenseModal({
  form, paymentMethods, onClose, onFieldChange, onSubmit,
  editMode = false,
}) {
  const isValid =
    Boolean(form.name.trim()) &&
    Boolean(form.amount) &&
    parseFloat(form.amount) > 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-gray-900 rounded-t-3xl shadow-2xl animate-slide-up overflow-hidden"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 pt-4">
          {/* 드래그 핸들 */}
          <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-5" />

          {/* 모달 헤더 */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold">
              {editMode ? '지출 편집' : '지출 추가'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 입력 폼 */}
          <div className="space-y-3">

            {/* 날짜 */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                날짜
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => onFieldChange('date', e.target.value)}
                style={{ colorScheme: 'dark', boxSizing: 'border-box' }}
                className="block w-full bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-xl px-3 h-10 text-sm text-white outline-none transition-colors"
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                카테고리
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => onFieldChange('name', e.target.value)}
                placeholder="무엇을 구매했나요?"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && isValid && onSubmit()}
                style={{ boxSizing: 'border-box' }}
                className="block w-full bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder-gray-600"
              />
            </div>

            {/* 금액 */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                금액 (원)
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={e => onFieldChange('amount', e.target.value)}
                placeholder="0"
                min="0"
                inputMode="numeric"
                onKeyDown={e => e.key === 'Enter' && isValid && onSubmit()}
                style={{ boxSizing: 'border-box' }}
                className="block w-full bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder-gray-600"
              />
            </div>

            {/* 결제 수단 */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                결제 수단
              </label>
              <select
                value={form.paymentMethod}
                onChange={e => onFieldChange('paymentMethod', e.target.value)}
                style={{ boxSizing: 'border-box' }}
                className="block w-full bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors appearance-none cursor-pointer"
              >
                {paymentMethods.map(pm => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 제출 버튼 */}
          <button
            onClick={onSubmit}
            disabled={!isValid}
            className="mt-5 w-full py-3.5 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
          >
            {editMode ? '수정하기' : '추가하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
