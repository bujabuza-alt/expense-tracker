import { useState } from 'react';
import { X } from 'lucide-react';
import { fmt } from '../utils';
import { useTheme } from '../context/ThemeContext';

export default function AddExpenseModal({
  form, paymentMethods, categories = [], onClose, onFieldChange, onSubmit,
  editMode = false,
}) {
  const { theme } = useTheme();
  const installments  = Math.max(1, parseInt(form.installmentMonths, 10) || 1);
  const totalAmount   = parseFloat(form.amount) || 0;
  const perMonth      = installments > 1 && totalAmount > 0
    ? Math.floor(totalAmount / installments)
    : 0;

  // 현재 form.name 이 카테고리 목록에 없는 커스텀 값이면 직접 입력 모드로 시작
  const isKnownCategory = categories.some(c => c.name === form.name);
  const [showCustom, setShowCustom] = useState(!isKnownCategory && form.name !== '');

  const isValid =
    Boolean(form.name.trim()) &&
    Boolean(form.amount) &&
    parseFloat(form.amount) > 0;

  const selectCategory = (name) => {
    onFieldChange('name', name);
    setShowCustom(false);
  };

  const openCustomInput = () => {
    onFieldChange('name', '');
    setShowCustom(true);
  };

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

          {/* 입력 폼 — space-y-4로 필드 간 간격 확보 */}
          <div className="space-y-4">

            {/* 날짜 */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                날짜
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => onFieldChange('date', e.target.value)}
                style={{ colorScheme: theme === 'japan' ? 'light' : 'dark' }}
                className="block w-full appearance-none bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm leading-5 text-white outline-none transition-colors"
              />
            </div>

            {/* 카테고리 — 칩(pill) 그리드 선택 + 직접 입력 */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                카테고리
              </label>

              {/* 카테고리 선택 칩 목록 */}
              <div className="flex flex-wrap gap-2 mb-2">
                {categories.map(c => {
                  const selected = !showCustom && form.name === c.name;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectCategory(c.name)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                        selected
                          ? 'bg-violet-600 border-transparent text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-300'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}

                {/* 직접 입력 토글 버튼 */}
                <button
                  type="button"
                  onClick={openCustomInput}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    showCustom
                      ? 'bg-violet-600 border-transparent text-white'
                      : 'bg-gray-800 border-dashed border-gray-600 text-gray-500 hover:border-violet-500 hover:text-violet-300'
                  }`}
                >
                  직접 입력
                </button>
              </div>

              {/* 직접 입력 텍스트 필드 — 직접 입력 모드일 때만 표시 */}
              {showCustom && (
                <input
                  type="text"
                  value={form.name}
                  onChange={e => onFieldChange('name', e.target.value)}
                  placeholder="카테고리를 직접 입력하세요"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && isValid && onSubmit()}
                  className="block w-full bg-gray-800 border border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder-gray-600"
                />
              )}
            </div>

            {/* 금액 */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
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
                className="block w-full bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder-gray-600"
              />
            </div>

            {/* 할부 개월 — 추가 모드 전용 */}
            {!editMode && (
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  할부 개월
                </label>
                <input
                  type="number"
                  value={form.installmentMonths ?? '1'}
                  onChange={e => onFieldChange('installmentMonths', e.target.value)}
                  placeholder="1"
                  min="1"
                  max="60"
                  inputMode="numeric"
                  className="block w-full bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder-gray-600"
                />
                {installments > 1 && (
                  <p className="text-[11px] text-violet-400 mt-1 pl-0.5">
                    월 ₩{fmt(perMonth)} × {installments}개월
                    {totalAmount % installments !== 0 && (
                      <span className="text-gray-500 ml-1">
                        (첫 달 ₩{fmt(totalAmount - perMonth * (installments - 1))})
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* 결제 수단 */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                결제 수단
              </label>
              <select
                value={form.paymentMethod}
                onChange={e => onFieldChange('paymentMethod', e.target.value)}
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
