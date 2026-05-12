import { useState } from 'react';
import { Plus, Trash2, Check, X, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import { uid, fmt } from '../../utils';
import CategorySection from './CategorySection';

// ═══════════════════════════════════════════════════════════════
// 결제 수단 CRUD 관리 섹션
// ═══════════════════════════════════════════════════════════════
function PaymentMethodsSection({ paymentMethods, onUpdate }) {
  const [adding,    setAdding]    = useState(false);
  const [newPM,     setNewPM]     = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState('');

  const movePM = (idx, dir) => {
    const next = idx + dir;
    if (next < 0 || next >= paymentMethods.length) return;
    const arr = [...paymentMethods];
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    onUpdate(arr);
  };

  const addPM = () => {
    const v = newPM.trim();
    if (!v || paymentMethods.includes(v)) return;
    onUpdate([...paymentMethods, v]);
    setNewPM('');
    setAdding(false);
  };

  const removePM = (pm) => {
    if (paymentMethods.length <= 1) return;
    onUpdate(paymentMethods.filter(p => p !== pm));
  };

  const startEdit = (pm) => { setEditingId(pm); setEditDraft(pm); };

  const saveEdit = () => {
    const v = editDraft.trim();
    if (!v) { setEditingId(null); return; }
    onUpdate(paymentMethods.map(p => p === editingId ? v : p));
    setEditingId(null);
  };

  return (
    <section className="bg-gray-900 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-200">결제 수단 관리</h3>
        <button
          onClick={() => setAdding(a => !a)}
          className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 bg-violet-900/30 hover:bg-violet-900/50 px-2.5 py-1.5 rounded-lg transition-all"
        >
          <Plus className="w-3 h-3" />
          추가
        </button>
      </div>

      {/* 새 결제 수단 입력 폼 */}
      {adding && (
        <div className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={newPM}
            onChange={e => setNewPM(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter')  addPM();
              if (e.key === 'Escape') setAdding(false);
            }}
            placeholder="새 결제 수단 이름"
            className="flex-1 bg-gray-800 border border-gray-700 focus:border-violet-500 rounded-xl px-3 py-2 text-sm text-white outline-none transition-colors placeholder-gray-600"
          />
          <button
            onClick={addPM}
            className="p-2 text-violet-400 hover:text-violet-300 transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setAdding(false); setNewPM(''); }}
            className="p-2 text-gray-600 hover:text-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 결제 수단 목록 */}
      <ul className="space-y-2">
        {paymentMethods.map((pm, idx) => (
          <li key={pm} className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
            {editingId === pm ? (
              <div className="flex-1 flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={editDraft}
                  onChange={e => setEditDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter')  saveEdit();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="flex-1 bg-gray-700 border border-gray-600 focus:border-violet-500 rounded-lg px-2 py-1.5 text-sm text-white outline-none"
                />
                <button
                  onClick={saveEdit}
                  className="p-1.5 text-violet-400 hover:text-violet-300 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-1.5 text-gray-600 hover:text-gray-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <span className="text-sm text-gray-200 font-medium">{pm}</span>
                <div className="flex items-center gap-1">
                  <div className="flex flex-col mr-1">
                    <button
                      onClick={() => movePM(idx, -1)}
                      disabled={idx === 0}
                      className="p-0.5 text-gray-600 hover:text-gray-400 disabled:opacity-20 transition-colors"
                      aria-label="위로"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => movePM(idx, 1)}
                      disabled={idx === paymentMethods.length - 1}
                      className="p-0.5 text-gray-600 hover:text-gray-400 disabled:opacity-20 transition-colors"
                      aria-label="아래로"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => startEdit(pm)}
                    className="p-1.5 text-gray-600 hover:text-violet-400 transition-colors"
                    aria-label="수정"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removePM(pm)}
                    disabled={paymentMethods.length <= 1}
                    className="p-1.5 text-gray-600 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// 자주 쓰는 항목(프리셋) CRUD 관리 섹션
// ═══════════════════════════════════════════════════════════════

const EMOJI_OPTIONS = [
  '🛒','☕','🍜','🚬','🏪','🚗','🍺','🎮',
  '👕','💊','📚','🎵','🍕','🎬','✈️','💇',
];

const emptyForm = (paymentMethods) => ({
  emoji:         '🛒',
  name:          '',
  amount:        '',
  paymentMethod: paymentMethods[0] ?? '',
});

function PresetsSection({ presets, paymentMethods, onUpdate }) {
  const [adding,    setAdding]    = useState(false);
  const [newForm,   setNewForm]   = useState(() => emptyForm(paymentMethods));
  const [editingId, setEditingId] = useState(null);
  const [editForm,  setEditForm]  = useState({});

  const isNewValid = newForm.name.trim() && newForm.amount && parseFloat(newForm.amount) > 0;

  const addPreset = () => {
    if (!isNewValid) return;
    onUpdate([...presets, {
      id:            uid(),
      emoji:         newForm.emoji   || '🛒',
      name:          newForm.name.trim(),
      amount:        parseFloat(newForm.amount),
      paymentMethod: newForm.paymentMethod || paymentMethods[0],
    }]);
    setNewForm(emptyForm(paymentMethods));
    setAdding(false);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({ ...p, amount: String(p.amount) });
  };

  const isEditValid =
    editForm.name?.trim() && editForm.amount && parseFloat(editForm.amount) > 0;

  const saveEdit = () => {
    if (!isEditValid) return;
    onUpdate(presets.map(p =>
      p.id === editingId
        ? { ...p, ...editForm, amount: parseFloat(editForm.amount) }
        : p
    ));
    setEditingId(null);
  };

  const removePreset = (id) => onUpdate(presets.filter(p => p.id !== id));

  const movePreset = (idx, dir) => {
    const next = idx + dir;
    if (next < 0 || next >= presets.length) return;
    const arr = [...presets];
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    onUpdate(arr);
  };

  return (
    <section className="bg-gray-900 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-200">자주 쓰는 항목</h3>
        <button
          onClick={() => { setAdding(a => !a); setNewForm(emptyForm(paymentMethods)); }}
          className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 bg-violet-900/30 hover:bg-violet-900/50 px-2.5 py-1.5 rounded-lg transition-all"
        >
          <Plus className="w-3 h-3" />
          추가
        </button>
      </div>

      {/* 새 프리셋 추가 폼 */}
      {adding && (
        <div className="p-3 bg-gray-800 rounded-xl space-y-3">
          {/* 이모지 선택 */}
          <div>
            <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              이모지
            </span>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_OPTIONS.map(em => (
                <button
                  key={em}
                  onClick={() => setNewForm(f => ({ ...f, emoji: em }))}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                    newForm.emoji === em
                      ? 'bg-violet-700 ring-1 ring-violet-400'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* 카테고리명 + 금액 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                카테고리명
              </span>
              <input
                autoFocus
                type="text"
                value={newForm.name}
                onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))}
                placeholder="예: 커피"
                className="block w-full bg-gray-700 border border-gray-600 focus:border-violet-500 rounded-lg px-2.5 py-2 text-sm text-white outline-none placeholder-gray-600"
              />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                금액 (원)
              </span>
              <input
                type="number"
                value={newForm.amount}
                onChange={e => setNewForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0"
                min="0"
                inputMode="numeric"
                className="block w-full bg-gray-700 border border-gray-600 focus:border-violet-500 rounded-lg px-2.5 py-2 text-sm text-white outline-none placeholder-gray-600"
              />
            </div>
          </div>

          {/* 결제 수단 */}
          <div>
            <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
              결제 수단
            </span>
            <select
              value={newForm.paymentMethod}
              onChange={e => setNewForm(f => ({ ...f, paymentMethod: e.target.value }))}
              className="block w-full bg-gray-700 border border-gray-600 focus:border-violet-500 rounded-lg px-2.5 py-2 text-sm text-white outline-none appearance-none"
            >
              {paymentMethods.map(pm => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>

          {/* 추가/취소 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={addPreset}
              disabled={!isNewValid}
              className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-600 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors"
            >
              추가하기
            </button>
            <button
              onClick={() => setAdding(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-400 text-xs font-bold rounded-lg transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 프리셋 목록 */}
      {presets.length === 0 ? (
        <div className="text-center py-6 text-gray-600 text-xs">
          자주 사용하는 지출 항목을 추가해보세요
        </div>
      ) : (
        <ul className="space-y-2">
          {presets.map((p, idx) => (
            <li key={p.id} className="bg-gray-800 rounded-xl overflow-hidden">
              {editingId === p.id ? (
                /* 인라인 편집 폼 */
                <div className="p-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                        카테고리명
                      </span>
                      <input
                        autoFocus
                        type="text"
                        value={editForm.name}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        className="block w-full bg-gray-700 border border-gray-600 focus:border-violet-500 rounded-lg px-2.5 py-2 text-sm text-white outline-none"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                        금액 (원)
                      </span>
                      <input
                        type="number"
                        value={editForm.amount}
                        onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))}
                        min="0"
                        inputMode="numeric"
                        className="block w-full bg-gray-700 border border-gray-600 focus:border-violet-500 rounded-lg px-2.5 py-2 text-sm text-white outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                      결제 수단
                    </span>
                    <select
                      value={editForm.paymentMethod}
                      onChange={e => setEditForm(f => ({ ...f, paymentMethod: e.target.value }))}
                      className="block w-full bg-gray-700 border border-gray-600 focus:border-violet-500 rounded-lg px-2.5 py-2 text-sm text-white outline-none appearance-none"
                    >
                      {paymentMethods.map(pm => (
                        <option key={pm} value={pm}>{pm}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      disabled={!isEditValid}
                      className="flex-1 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-600 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-400 text-xs font-bold rounded-lg transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                /* 일반 표시 모드 */
                <div className="flex items-center justify-between px-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl leading-none">{p.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-100">{p.name}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {p.paymentMethod} · ₩{fmt(p.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex flex-col mr-1">
                      <button
                        onClick={() => movePreset(idx, -1)}
                        disabled={idx === 0}
                        className="p-0.5 text-gray-600 hover:text-gray-400 disabled:opacity-20 transition-colors"
                        aria-label="위로"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => movePreset(idx, 1)}
                        disabled={idx === presets.length - 1}
                        className="p-0.5 text-gray-600 hover:text-gray-400 disabled:opacity-20 transition-colors"
                        aria-label="아래로"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => startEdit(p)}
                      className="p-1.5 text-gray-600 hover:text-violet-400 transition-colors"
                      aria-label="수정"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removePreset(p.id)}
                      className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
                      aria-label="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// 테마 선택 섹션
// 업데이트 이력:
// - Japan 모드 토글 추가: 다크 모드 / 재팬 모드 선택 UI 구현
// ═══════════════════════════════════════════════════════════════
function ThemeSection({ theme, onThemeChange }) {
  return (
    <section className="bg-gray-900 rounded-2xl p-4 space-y-3">
      <h3 className="text-sm font-bold text-gray-200">테마 설정</h3>

      <div className="flex gap-3">
        {/* Dark Mode button */}
        <button
          onClick={() => onThemeChange('dark')}
          className={`
            flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2
            text-xs font-bold transition-all
            ${theme === 'dark'
              ? 'bg-gray-800 border-violet-500 text-violet-400'
              : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'}
          `}
        >
          <span className="text-2xl leading-none">🌙</span>
          다크 모드
        </button>

        {/* Japan Mode button — uses inline styles to remain visually correct in either theme */}
        <button
          onClick={() => onThemeChange('japan')}
          style={
            theme === 'japan'
              ? { backgroundColor: '#FCE2E1', borderColor: '#C96480', color: '#C96480' }
              : {}
          }
          className={`
            flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2
            text-xs font-bold transition-all
            ${theme === 'japan'
              ? ''
              : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'}
          `}
        >
          <span className="text-2xl leading-none">🌸</span>
          재팬 모드
        </button>
      </div>

      {theme === 'japan' && (
        <p className="text-[10px] text-center" style={{ color: '#C96480' }}>
          벚꽃 핑크 · 화지(和紙) 테마가 적용되었습니다
        </p>
      )}
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// 설정 탭 루트 컴포넌트
// 업데이트 이력:
// - v1.1.0 (2026-05-12): 카테고리 관리 섹션(CategorySection) 추가
//   · 드래그 앤 드롭 순서 변경, CRUD, 반응형 리네임 지원
// ═══════════════════════════════════════════════════════════════
export default function SettingsTab({
  paymentMethods, presets,
  onUpdatePaymentMethods, onUpdatePresets,
  categories, onUpdateCategories, onRenameCategory,
  theme, onThemeChange,
}) {
  return (
    <div className="space-y-4">
      <ThemeSection theme={theme} onThemeChange={onThemeChange} />
      <CategorySection
        categories={categories}
        onUpdate={onUpdateCategories}
        onRename={onRenameCategory}
      />
      <PaymentMethodsSection
        paymentMethods={paymentMethods}
        onUpdate={onUpdatePaymentMethods}
      />
      <PresetsSection
        presets={presets}
        paymentMethods={paymentMethods}
        onUpdate={onUpdatePresets}
      />
    </div>
  );
}
